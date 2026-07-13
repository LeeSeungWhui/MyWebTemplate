"""
파일명: backend/lib/RateLimit.py
작성자: LSH
갱신일: 2026-02-24
설명: 간단한 인메모리 속도 제한기와 FastAPI용 체크 헬퍼
"""

from __future__ import annotations

import os
import re
import time
from collections import deque
from threading import RLock
from typing import Optional

from fastapi import Request
from fastapi.responses import JSONResponse

from lib.RequestTrust import getTrustedForwardedIp, isTrustedProxyRequest
from lib.Response import errorResponse


class RateLimiter:
    """설명: 간단한 인메모리 속도 제한기 갱신일: 2025-11-12"""
    """
    초간단 인메모리 속도 제한기(프로세스 단위).
    - limit: 윈도우 내 허용 횟수
    - windowSec: 윈도우 길이(초)
    """

    def __init__(self, limit: int = 5, windowSec: int = 60, sweepEvery: int = 256):
        """
        설명: 제한 횟수/윈도우/청소 주기 초기화
        처리 규칙: sweepEvery는 최소 1로 보정하고 내부 store/hitCount를 초기화
        부작용: 인메모리 카운터 상태를 새로 생성
        갱신일: 2026-02-27
        """
        self.limit = int(limit)
        self.window = int(windowSec)
        self.store = {}
        self.sweepEvery = max(1, int(sweepEvery))
        self.hitCount = 0
        self.lock = RLock()
        self.reservationSequence = 0
        self.reservations = {}

    def now(self):
        """
        설명: 시스템 시계 변경 영향 없이 윈도우 계산에 쓰는 monotonic 타임스탬프 제공
        반환값: rate-limit 윈도우 계산에 사용하는 monotonic float 초 값
        갱신일: 2025-11-12
        """
        return time.monotonic()

    def sweepExpired(self, nowSec: float) -> None:
        """
        설명: 윈도우를 벗어난 키를 일괄 정리해 메모리 증 완화
        처리 규칙: 각 키의 오래된 타임스탬프를 제거하고 비어 있는 키는 store에서 제거
        부작용: self.store 내부 상태를 직접 변경
        갱신일: 2026-02-24
        """
        with self.lock:
            expiredKeys = []
            for key, timestamps in list(self.store.items()):
                while timestamps and nowSec - timestamps[0] > self.window:
                    timestamps.popleft()
                if not timestamps:
                    expiredKeys.append(key)
            for key in expiredKeys:
                self.store.pop(key, None)

    def hit(self, key: str, *, commit: bool = True):
        """
        설명: 주어진 키로 속도 제한 검사
        - commit=True: 검사 + 히트 기록(윈도우 내 카운트 증가)
        - commit=False: 검사만 수행(카운트 증가 없음)
        갱신일: 2026-01-15
        """
        with self.lock:
            now = self.now()
            self.hitCount += 1
            if self.hitCount % self.sweepEvery == 0:
                self.sweepExpired(now)
            timestamps = self.store.get(key)
            if timestamps is None:
                if not commit:
                    return True, 0
                timestamps = deque()
                self.store[key] = timestamps
            while timestamps and now - timestamps[0] > self.window:
                timestamps.popleft()
            if not timestamps and not commit:
                self.store.pop(key, None)
                return True, 0
            if len(timestamps) >= self.limit:
                retryAfter = max(1, int(self.window - (now - timestamps[0])))
                return False, retryAfter
            if commit:
                timestamps.append(now)
            return True, 0

    def reserve(self, keys):
        """
        설명: 여러 rate-limit 키의 용량을 한 번에 검사하고 in-flight 슬롯을 원자적으로 예약
        처리 규칙: 모든 키가 허용될 때만 같은 시각의 예약 entry를 추가하고 opaque id를 반환
        반환값: (허용 여부, Retry-After 초, reservation id)
        갱신일: 2026-07-13
        """
        uniqueKeys = tuple(dict.fromkeys(str(key) for key in keys if str(key)))
        if not uniqueKeys:
            raise ValueError("rate-limit reservation requires at least one key")

        with self.lock:
            now = self.now()
            self.hitCount += 1
            if self.hitCount % self.sweepEvery == 0:
                self.sweepExpired(now)

            for key in uniqueKeys:
                timestamps = self.store.get(key)
                if timestamps is None:
                    continue
                while timestamps and now - timestamps[0] > self.window:
                    timestamps.popleft()
                if not timestamps:
                    self.store.pop(key, None)
                    continue
                if len(timestamps) >= self.limit:
                    retryAfter = max(1, int(self.window - (now - timestamps[0])))
                    return False, retryAfter, None

            self.reservationSequence += 1
            reservationId = self.reservationSequence
            reservationEntries = []
            for key in uniqueKeys:
                timestamps = self.store.get(key)
                if timestamps is None:
                    timestamps = deque()
                    self.store[key] = timestamps
                timestamps.append(now)
                reservationEntries.append((key, now))
            self.reservations[reservationId] = tuple(reservationEntries)
            return True, 0, reservationId

    def finalizeReservation(self, reservationId, *, keep: bool) -> bool:
        """
        설명: in-flight 예약을 실패 hit로 확정하거나 정확히 해제
        처리 규칙: keep=True면 timestamp를 유지하고, False면 예약 entry만 제거하며 재호출은 no-op
        반환값: 처음 처리한 예약이면 True, 이미 처리됐거나 모르는 id면 False
        갱신일: 2026-07-13
        """
        with self.lock:
            reservationEntries = self.reservations.pop(reservationId, None)
            if reservationEntries is None:
                return False
            if keep:
                return True

            for key, reservedAt in reservationEntries:
                timestamps = self.store.get(key)
                if not timestamps:
                    continue
                try:
                    timestamps.remove(reservedAt)
                except ValueError:
                    continue
                if not timestamps:
                    self.store.pop(key, None)
            return True


def parseRateLimitLimit(defaultValue: int = 5) -> int:
    """
    설명: AUTH_RATE_LIMIT 환경변수를 rate-limit limit 정수로 파싱
    처리 규칙: 숫자가 아니거나 1 미만이면 defaultValue로 폴백
    반환값: 1 이상 정수 limit 값
    갱신일: 2026-03-02
    """
    rawValue = os.getenv("AUTH_RATE_LIMIT", str(defaultValue))
    try:
        parsedValue = int(str(rawValue).strip())
    except Exception:
        return int(defaultValue)
    if parsedValue < 1:
        return int(defaultValue)
    return parsedValue


globalRateLimiter = RateLimiter(limit=parseRateLimitLimit(), windowSec=60)


RATE_LIMIT_NAMESPACE_PATTERN = re.compile(r"^[a-z0-9][a-z0-9._-]{0,47}$")


def normalizeRateLimitNamespace(namespace: str) -> str:
    """
    설명: 카운터 충돌을 막기 위한 bounded namespace/action 키를 검증 및 정규화
    반환값: 최대 48자의 소문자 namespace
    갱신일: 2026-07-11
    """
    normalizedNamespace = str(namespace or "").strip().lower()
    if not RATE_LIMIT_NAMESPACE_PATTERN.fullmatch(normalizedNamespace):
        raise ValueError("invalid rate-limit namespace")
    return normalizedNamespace

def resolveClientIp(request: Request) -> str:
    """
    설명: 요청의 클라이언트 IP를 최대한 정확히 추정
    - 기본: request.client.host
    - 프록시 뒤: opt-in 및 trusted peer 검증을 통과한 X-Forwarded-For 첫 IP를 사용
    갱신일: 2026-07-11
    """
    trustedProxy = isTrustedProxyRequest(request)
    forwardedIp = getTrustedForwardedIp(request) if trustedProxy else None
    if forwardedIp:
        return forwardedIp
    return getattr(request.client, "host", None) or "unknown"


def buildRateLimitKeys(
    request: Request,
    username: Optional[str] = None,
    *,
    namespace: str,
) -> tuple[str, ...]:
    """
    설명: check/reserve가 공유하는 namespaced IP/사용자 키 생성
    반환값: IP 키와 선택적 사용자 키를 순서대로 담은 tuple
    갱신일: 2026-07-13
    """
    normalizedNamespace = normalizeRateLimitNamespace(namespace)
    ip = resolveClientIp(request)
    keys = [f"{normalizedNamespace}:ip:{ip}"]
    if username:
        keys.append(f"{normalizedNamespace}:user:{username}")
    return tuple(keys)


def buildRateLimitResponse(retryAfter: int) -> JSONResponse:
    """설명: 표준 429 rate-limit 응답 생성 갱신일: 2026-07-13"""
    return JSONResponse(
        status_code=429,
        content=errorResponse(message="too many requests", code="AUTH_429_RATE_LIMIT"),
        headers={"Retry-After": str(retryAfter), "Cache-Control": "no-store"},
    )


def checkRateLimit(
    request: Request,
    username: Optional[str] = None,
    *,
    commit: bool = True,
    namespace: str = "auth.login",
) -> Optional[JSONResponse]:
    """
    설명: IP/사용자별 속도 제한 검사
    처리 규칙: 키(ip:{ip}, user:{username})를 순회해 하나라도 초과면 즉시 429를 반환
    반환값: 제한 초과 시 Retry-After/no-store 헤더가 포함된 JSONResponse, 통과 시 None을 반환
    갱신일: 2026-01-15
    """
    for key in buildRateLimitKeys(request, username, namespace=namespace):
        ok, retryAfter = globalRateLimiter.hit(key, commit=commit)
        if not ok:
            return buildRateLimitResponse(retryAfter)
    return None


def reserveRateLimit(
    request: Request,
    username: Optional[str] = None,
    *,
    namespace: str,
):
    """
    설명: 현재 limiter에 IP/사용자 multi-key in-flight 슬롯 예약
    반환값: (제한 응답 또는 None, limiter instance와 reservation id를 묶은 handle)
    갱신일: 2026-07-13
    """
    limiter = globalRateLimiter
    keys = buildRateLimitKeys(request, username, namespace=namespace)
    ok, retryAfter, reservationId = limiter.reserve(keys)
    if not ok:
        return buildRateLimitResponse(retryAfter), None
    return None, (limiter, reservationId)


def finalizeRateLimitReservation(reservationHandle, *, keep: bool) -> bool:
    """
    설명: 예약 당시 limiter에 handle을 확정 또는 해제
    반환값: 유효 예약을 처음 처리했으면 True, 없거나 재처리면 False
    갱신일: 2026-07-13
    """
    if reservationHandle is None:
        return False
    limiter, reservationId = reservationHandle
    return limiter.finalizeReservation(reservationId, keep=keep)
