"""
파일: backend/lib/RateLimit.py
작성: Codex
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

    def _now(self):
        """설명: monotonic 초 단위를 반환. 갱신일: 2025-11-12"""
        return time.monotonic()

    def hit(self, key: str):
        """설명: 주어진 키로 히트를 기록하고 제한 여부를 알려준다. 갱신일: 2025-11-12"""
        now = self._now()
        dq = self.store.get(key)
        if dq is None:
            dq = deque()
            self.store[key] = dq
        while dq and now - dq[0] > self.window:
            dq.popleft()
        if len(dq) >= self.limit:
            retryAfter = max(1, int(self.window - (now - dq[0])))
            return False, retryAfter
        dq.append(now)
        return True, 0


_GLOBAL_LIMIT = RateLimiter(limit=int(os.getenv("AUTH_RATE_LIMIT", "5")), windowSec=60)


def checkRateLimit(request: Request, username: Optional[str] = None) -> Optional[JSONResponse]:
    """설명: IP/사용자별 속도 제한을 검사한다. 갱신일: 2025-11-12"""
    """
    속도 제한 검사 유틸. 초과 시 JSONResponse(429)를 반환, 통과 시 None.
    키: ip:{ip} 와 user:{username}(옵션) 조합.
    """
    ip = getattr(request.client, "host", "unknown")
    keys = [f"ip:{ip}"]
    if username:
        keys.append(f"user:{username}")
    for k in keys:
        ok, retryAfter = _GLOBAL_LIMIT.hit(k)
        if not ok:
            return JSONResponse(
                status_code=429,
                content=errorResponse(message="too many requests", code="AUTH_429_RATE_LIMIT"),
                headers={"Retry-After": str(retryAfter)},
            )
    return None
