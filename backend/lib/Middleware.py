"""
파일명: backend/lib/Middleware.py
작성자: LSH
갱신일: 2025-09-07
설명: 요청ID 전파 및 구조적 접근 로그 미들웨어.
"""

import json
import os
import time
import uuid
from typing import Callable, Awaitable

from fastapi import Request
from starlette.responses import Response as StarletteResponse
from starlette.middleware.base import BaseHTTPMiddleware

from lib.Logger import logger
from .Database import getSqlCount, resetSqlCount
from .Config import getConfig
from .RequestContext import resetRequestId, setRequestId


def parsePositiveInt(rawValue: object) -> int | None:
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
    설명: config.ini 기반 SQL 경고 임계치(sql_warn_threshold) 조회.
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
    설명: 요청당 SQL 경고 임계치(환경변수 SQL_WARN_THRESHOLD) 조회.
    갱신일: 2026-02-22
    """
    envThreshold = parsePositiveInt(os.getenv("SQL_WARN_THRESHOLD"))
    if envThreshold is not None:
        return envThreshold
    configThreshold = getSqlWarnThresholdFromConfig()
    if configThreshold is not None:
        return configThreshold
    return 30


class RequestLogMiddleware(BaseHTTPMiddleware):
    """
    설명: X-Request-Id 생성/전파 및 구조적 JSON 접근 로그 기록.
    갱신일: 2025-11-12
    """

    async def dispatch(self, request: Request, callNext: Callable[[Request], Awaitable[StarletteResponse]]) -> StarletteResponse:
        """
        설명: 요청 처리 시간/상태/경로 등을 수집하여 INFO 레벨로 로그 출력.
        갱신일: 2025-11-12
        """
        started = time.perf_counter()
        reqId = request.headers.get("X-Request-Id") or str(uuid.uuid4())
        token = setRequestId(reqId)
        resetSqlCount()
        try:
            # 실제 비즈니스 핸들러 호출
            response = await callNext(request)

            # 응답 헤더에 요청 ID를 추가
            try:
                response.headers["X-Request-Id"] = reqId
            except Exception:
                pass

            elapsedMs = int((time.perf_counter() - started) * 1000)
            sqlCount = getSqlCount()
            level = "INFO"
            logObj = {
                "ts": int(time.time() * 1000),
                "level": level,
                "requestId": reqId,
                "method": request.method,
                "path": request.url.path,
                "status": response.status_code,
                "latency_ms": elapsedMs,
                "sql_count": sqlCount,
                "msg": "access",
            }
            # 구조적 로그를 위해 JSON 문자열로 기록
            msg = json.dumps(logObj, ensure_ascii=False)
            logger.info(msg)
            threshold = getSqlWarnThreshold()
            if sqlCount >= threshold:
                warnObj = {
                    "ts": int(time.time() * 1000),
                    "level": "WARNING",
                    "requestId": reqId,
                    "path": request.url.path,
                    "method": request.method,
                    "status": response.status_code,
                    "sql_count": sqlCount,
                    "sql_warn_threshold": threshold,
                    "msg": "sql_count_high",
                }
                logger.warning(json.dumps(warnObj, ensure_ascii=False))
            return response
        finally:
            resetRequestId(token)
            resetSqlCount()
