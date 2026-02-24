"""
파일명: backend/lib/RateLimit.py
작성자: Codex
갱신일: 2026-02-24
설명: 간단한 인메모리 속도 제한기와 FastAPI용 체크 헬퍼.
"""

from __future__ import annotations

import os
import time
from collections import deque
from typing import Optional

from fastapi import Request
from fastapi.responses import JSONResponse

from lib.Response import errorResponse


class RateLimiter:
    """설명: 간단한 인메모리 속도 제한기. 갱신일: 2025-11-12"""
    """
    초간단 인메모리 속도 제한기(프로세스 단위).
    - limit: 윈도우 내 허용 횟수
    - windowSec: 윈도우 길이(초)
    """

    def __init__(self, limit: int = 5, windowSec: int = 60):
        self.limit = int(limit)
        self.window = int(windowSec)
        self.store = {}

    def now(self):
        """설명: monotonic 초 단위를 반환. 갱신일: 2025-11-12"""
        return time.monotonic()

    def hit(self, key: str, *, commit: bool = True):
        """
        설명: 주어진 키로 속도 제한을 검사한다.
        - commit=True: 검사 + 히트 기록(윈도우 내 카운트 증가)
        - commit=False: 검사만 수행(카운트 증가 없음)
        갱신일: 2026-01-15
        """
        now = self.now()
        timestamps = self.store.get(key)
        if timestamps is None:
            if not commit:
                return True, 0
            timestamps = deque()
            self.store[key] = timestamps
        while timestamps and now - timestamps[0] > self.window:
            timestamps.popleft()
        if len(timestamps) >= self.limit:
            retryAfter = max(1, int(self.window - (now - timestamps[0])))
            return False, retryAfter
        if commit:
            timestamps.append(now)
        return True, 0


globalRateLimiter = RateLimiter(limit=int(os.getenv("AUTH_RATE_LIMIT", "5")), windowSec=60)

def resolveClientIp(request: Request) -> str:
    """
    설명: 요청의 클라이언트 IP를 최대한 정확히 추정한다.
    - 기본: request.client.host
    - 프록시 뒤: TRUST_PROXY_HEADERS=true 일 때 X-Forwarded-For 첫 IP를 사용
    갱신일: 2026-01-15
    """
    trustProxy = os.getenv("TRUST_PROXY_HEADERS", "false").lower() in ("1", "true", "yes")
    if trustProxy:
        xff = request.headers.get("X-Forwarded-For")
        if isinstance(xff, str) and xff.strip():
            first = xff.split(",")[0].strip()
            if first:
                return first
    return getattr(request.client, "host", None) or "unknown"


def checkRateLimit(request: Request, username: Optional[str] = None, *, commit: bool = True) -> Optional[JSONResponse]:
    """설명: IP/사용자별 속도 제한을 검사한다. 갱신일: 2026-01-15"""
    """
    속도 제한 검사 유틸.
    - 초과 시 JSONResponse(429)를 반환, 통과 시 None.
    - 키: ip:{ip} 와 user:{username}(옵션) 조합.
    - commit=False로 호출하면 '현재 제한 상태인지'만 확인한다(카운트 증가 없음).
    """
    ip = resolveClientIp(request)
    keys = [f"ip:{ip}"]
    if username:
        keys.append(f"user:{username}")
    for key in keys:
        ok, retryAfter = globalRateLimiter.hit(key, commit=commit)
        if not ok:
            return JSONResponse(
                status_code=429,
                content=errorResponse(message="too many requests", code="AUTH_429_RATE_LIMIT"),
                headers={"Retry-After": str(retryAfter)},
            )
    return None
