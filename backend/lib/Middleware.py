"""
파일명: backend/lib/Middleware.py
작성자: LSH
갱신일: 2026-02-25
설명: 요청ID 전파 및 구조적 접근 로그 미들웨어
"""

import asyncio
import json
import ipaddress
import os
import re
import time
import uuid
from typing import Callable, Awaitable

from fastapi import Request
from starlette.responses import Response as StarletteResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from lib.Logger import logger
from .Masking import maskUserIdentifierForLog
from .Database import getSqlCount, resetSqlCount
from .Config import getConfig
from .RequestContext import resetRequestId, setRequestId
from .RequestTrust import getTrustedForwardedIp
from .UserAccessLog import writeUserAccessLog

SECURITY_RESPONSE_HEADERS = (
    ("X-Content-Type-Options", "nosniff"),
    ("Referrer-Policy", "same-origin"),
    ("Permissions-Policy", "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"),
    ("X-Frame-Options", "DENY"),
)

REQUEST_ID_PATTERN = re.compile(r"^[A-Za-z0-9._:-]{1,128}$")
DEFAULT_ACCESS_LOG_PENDING_TASK_CAP = 100
_pendingAccessLogTasks: set[asyncio.Task[None]] = set()


async def writeUserAccessLogSafely(
    *,
    username: str,
    requestId: str,
    method: str,
    path: str,
    statusCode: int,
    latencyMs: int,
    sqlCount: int,
    clientIp: str | None,
) -> None:
    """
    설명: 요청 종료 후 사용자 접근 로그를 비차단 방식으로 적재하는 보호 래퍼
    처리 규칙: writeUserAccessLog 호출 인자를 그대로 전달하고, 본 요청 응답 흐름을 우선
    실패 동작: 로그 적재 예외는 상위 태스크 완료 콜백에서 구조 로그로 수집
    부작용: user_access_log 저장 시도가 발생할 수
    갱신일: 2026-02-27
    """
    await writeUserAccessLog(
        username=username,
        requestId=requestId,
        method=method,
        path=path,
        statusCode=statusCode,
        latencyMs=latencyMs,
        sqlCount=sqlCount,
        clientIp=clientIp,
    )


def resolveRequestId(rawRequestId: object) -> str:
    """검증된 요청 ID를 보존하고 그 외 입력은 UUID4로 교체한다."""
    if isinstance(rawRequestId, str) and REQUEST_ID_PATTERN.fullmatch(rawRequestId):
        return rawRequestId
    return str(uuid.uuid4())


def getAccessLogPendingTaskCap() -> int:
    """접근 로그 백그라운드 태스크의 동시 보존 상한을 조회한다."""
    return parsePositiveInt(os.getenv("ACCESS_LOG_PENDING_TASK_CAP")) or DEFAULT_ACCESS_LOG_PENDING_TASK_CAP


def _finishAccessLogTask(task: asyncio.Task[None]) -> None:
    if task not in _pendingAccessLogTasks:
        return
    _pendingAccessLogTasks.discard(task)
    if task.cancelled():
        return
    try:
        failure = task.exception()
    except asyncio.CancelledError:
        return
    if failure is not None:
        logger.error(
            json.dumps(
                {
                    "level": "ERROR",
                    "msg": "user_access_log_task_failed",
                    "errorType": type(failure).__name__,
                },
                ensure_ascii=False,
            )
        )


def scheduleUserAccessLog(**kwargs: object) -> bool:
    """상한 내에서 접근 로그 태스크를 강한 참조로 보존한다."""
    cap = getAccessLogPendingTaskCap()
    if len(_pendingAccessLogTasks) >= cap:
        logger.warning(
            json.dumps(
                {
                    "level": "WARNING",
                    "msg": "user_access_log_task_dropped",
                    "pending": len(_pendingAccessLogTasks),
                    "pendingCap": cap,
                    "requestId": kwargs.get("requestId"),
                },
                ensure_ascii=False,
            )
        )
        return False
    try:
        task = asyncio.create_task(writeUserAccessLogSafely(**kwargs))
    except Exception as failure:
        logger.error(
            json.dumps(
                {
                    "level": "ERROR",
                    "msg": "user_access_log_task_create_failed",
                    "errorType": type(failure).__name__,
                    "requestId": kwargs.get("requestId"),
                },
                ensure_ascii=False,
            )
        )
        return False
    _pendingAccessLogTasks.add(task)
    task.add_done_callback(_finishAccessLogTask)
    return True


async def drainUserAccessLogTasks(timeout: float = 5.0) -> None:
    """보존 중인 접근 로그 태스크를 기다리고 제한시간 뒤 남은 태스크를 취소한다."""
    pending = set(_pendingAccessLogTasks)
    if not pending:
        return
    done, stillPending = await asyncio.wait(pending, timeout=max(0.0, timeout))
    if stillPending:
        logger.warning(
            json.dumps(
                {
                    "level": "WARNING",
                    "msg": "user_access_log_task_drain_timeout",
                    "pending": len(stillPending),
                },
                ensure_ascii=False,
            )
        )
        for task in stillPending:
            task.cancel()
        await asyncio.gather(*stillPending, return_exceptions=True)
    for task in done:
        _finishAccessLogTask(task)


def parsePositiveInt(rawValue: object) -> int | None:
    """
    설명: 양의 정수 값만 파싱해서 반환. 호출 맥락의 제약을 기준으로 동작 기준 확정
    반환값: 1 이상 정수면 해당 값, 그 외 입력은 None
    갱신일: 2026-02-22
    """
    if rawValue is None:
        return None
    try:
        value = int(str(rawValue).strip())
        if value <= 0:
            return None
        return value
    except Exception:
        return None


def getSqlWarnThresholdFromConfig() -> int | None:
    """
    설명: config. ini 기반 SQL 경고 임계치(sql_warn_threshold) 조회
    우선순위 섹션: OBSERVABILITY > SERVER > DATABASE > DATABASE_*
    갱신일: 2026-02-22
    """
    try:
        config = getConfig()
    except Exception:
        return None

    sectionNames = ["OBSERVABILITY", "SERVER", "DATABASE"]
    try:
        sectionNames.extend([name for name in config.sections() if name.startswith("DATABASE_")])
    except Exception:
        pass

    for sectionName in sectionNames:
        try:
            if sectionName not in config:
                continue
            rawValue = config[sectionName].get("sql_warn_threshold")
            parsed = parsePositiveInt(rawValue)
            if parsed is not None:
                return parsed
        except Exception:
            continue
    return None


def getSqlWarnThreshold() -> int:
    """
    설명: 요청당 SQL 경고 임계치(환경변수 SQL_WARN_THRESHOLD) 조회
    처리 규칙: env 우선, 없으면 config, 둘 다 없으면 기본값 30을 사용
    갱신일: 2026-02-22
    """
    envThreshold = parsePositiveInt(os.getenv("SQL_WARN_THRESHOLD"))
    if envThreshold is not None:
        return envThreshold
    configThreshold = getSqlWarnThresholdFromConfig()
    if configThreshold is not None:
        return configThreshold
    return 30


def resolveClientIp(request: Request) -> str | None:
    """
    설명: 요청 헤더/소켓 정보를 기반으로 클라이언트 IP 추정
    우선순위: TRUST_PROXY_HEADERS=true일 때 X-Forwarded-For(첫 IP) > X-Real-IP, 그 외 request.client.host
    갱신일: 2026-06-05
    """
    forwardedIp = getTrustedForwardedIp(request)
    if forwardedIp:
        return forwardedIp

    try:
        clientHost = request.client.host if request.client else None
        if isinstance(clientHost, str) and clientHost.strip():
            return clientHost
    except Exception:
        pass
    return None


def resolveAuthUsername(request: Request) -> str | None:
    """
    설명: 인증 의존성에서 주입한 request. state. authUsername 값을 조회. 호출 맥락의 제약을 기준으로 동작 기준 확정
    반환값: 공백 제거 후 유효 문자열 username 또는 None
    갱신일: 2026-02-22
    """
    try:
        raw = getattr(request.state, "authUsername", None)
    except Exception:
        raw = None
    if isinstance(raw, str) and raw.strip():
        return raw
    return None


def maskClientIpForLog(clientIp: str | None) -> str | None:
    """
    설명: 로그 출력용 클라이언트 IP 마스킹
    처리 규칙: IPv4는 마지막 octet을 `*`, IPv6는 앞 4블록만 남기고 나머지는 `*`로 마스킹
    갱신일: 2026-02-22
    """
    value = (clientIp or "").strip()
    if not value:
        return None
    try:
        parsedIp = ipaddress.ip_address(value)
    except Exception:
        return "***"
    if isinstance(parsedIp, ipaddress.IPv4Address):
        octets = value.split(".")
        if len(octets) == 4:
            return f"{octets[0]}.{octets[1]}.{octets[2]}.*"
        return "***"
    hextets = parsedIp.exploded.split(":")
    return ":".join(hextets[:4] + ["*"])


def applyDefaultSecurityHeaders(response: StarletteResponse) -> StarletteResponse:
    """
    설명: 응답에 공통 보안 헤더 기본값을 추가
    처리 규칙: 기존 헤더가 이미 있으면 존중하고, Cache-Control 등 기존 캐시 정책은 변경하지 않음
    반환값: 보안 헤더가 반영된 동일 response 객체
    갱신일: 2026-06-24
    """
    try:
        headers = response.headers
    except Exception:
        return response
    for headerName, headerValue in SECURITY_RESPONSE_HEADERS:
        headers.setdefault(headerName, headerValue)
    return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    설명: 모든 HTTP 응답에 기본 보안 헤더를 부여하는 미들웨어
    갱신일: 2026-06-24
    """

    async def dispatch(self, request: Request, callNext: Callable[[Request], Awaitable[StarletteResponse]]) -> StarletteResponse:
        response = await callNext(request)
        return applyDefaultSecurityHeaders(response)


class RequestLogMiddleware:
    """
    설명: Request-Id 생성/전파 및 구조적 JSON 접근 로그 기록
    갱신일: 2025-11-12
    """

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        """
        설명: 요청 처리 시간/상태/경로 등을 수집하여 INFO 레벨로 로그 출력
        부작용: X-Request-Id 헤더 주입, 구조적 access 로그 기록, 인증 사용자 접근로그 백그라운드 적재를 수행
        갱신일: 2025-11-12
        """
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request = Request(scope, receive=receive)
        started = time.perf_counter()
        reqId = resolveRequestId(request.headers.get("X-Request-Id"))
        scope["requestId"] = reqId
        scope.setdefault("state", {})["requestId"] = reqId
        token = setRequestId(reqId)
        resetSqlCount()
        statusCode = 500

        async def sendWithRequestId(message: Message) -> None:
            nonlocal statusCode
            if message["type"] == "http.response.start":
                statusCode = int(message["status"])
                headers = list(message.get("headers", []))
                headers = [(name, value) for name, value in headers if name.lower() != b"x-request-id"]
                headers.append((b"x-request-id", reqId.encode("ascii")))
                message = {**message, "headers": headers}
            await send(message)

        try:
            await self.app(scope, receive, sendWithRequestId)
        except Exception:
            statusCode = 500
            raise
        finally:
            try:
                elapsedMs = int((time.perf_counter() - started) * 1000)
                sqlCount = getSqlCount()
                username = resolveAuthUsername(request)
                clientIp = resolveClientIp(request)
                maskedUsername = maskUserIdentifierForLog(username)
                maskedClientIp = maskClientIpForLog(clientIp)
                logObj = {
                    "ts": int(time.time() * 1000),
                    "level": "INFO",
                    "requestId": reqId,
                    "method": request.method,
                    "path": request.url.path,
                    "status": statusCode,
                    "latency_ms": elapsedMs,
                    "sql_count": sqlCount,
                    "is_authenticated": bool(username),
                    "msg": "access",
                }
                if maskedUsername:
                    logObj["usernameMasked"] = maskedUsername
                if maskedClientIp:
                    logObj["clientIpMasked"] = maskedClientIp

                logger.info(json.dumps(logObj, ensure_ascii=False))
                threshold = getSqlWarnThreshold()
                if sqlCount >= threshold:
                    warnObj = {
                        "ts": int(time.time() * 1000),
                        "level": "WARNING",
                        "requestId": reqId,
                        "path": request.url.path,
                        "method": request.method,
                        "status": statusCode,
                        "sql_count": sqlCount,
                        "sql_warn_threshold": threshold,
                        "msg": "sql_count_high",
                    }
                    logger.warning(json.dumps(warnObj, ensure_ascii=False))
                if username:
                    scheduleUserAccessLog(
                        username=username,
                        requestId=reqId,
                        method=request.method,
                        path=request.url.path,
                        statusCode=statusCode,
                        latencyMs=elapsedMs,
                        sqlCount=sqlCount,
                        clientIp=clientIp,
                    )
            finally:
                resetRequestId(token)
                resetSqlCount()
