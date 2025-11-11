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
    """
    초간단 인메모리 속도 제한기(프로세스 단위).
    - limit: 윈도우 내 허용 횟수
    - window_sec: 윈도우 길이(초)
    """

    def __init__(self, limit: int = 5, window_sec: int = 60):
        self.limit = int(limit)
        self.window = int(window_sec)
        self.store = {}

    def _now(self):
        return time.monotonic()

    def hit(self, key: str):
        now = self._now()
        dq = self.store.get(key)
        if dq is None:
            dq = deque()
            self.store[key] = dq
        while dq and now - dq[0] > self.window:
            dq.popleft()
        if len(dq) >= self.limit:
            retry_after = max(1, int(self.window - (now - dq[0])))
            return False, retry_after
        dq.append(now)
        return True, 0


_GLOBAL_LIMIT = RateLimiter(limit=int(os.getenv("AUTH_RATE_LIMIT", "5")), window_sec=60)


def check_rate_limit(request: Request, username: Optional[str] = None) -> Optional[JSONResponse]:
    """
    속도 제한 검사 유틸. 초과 시 JSONResponse(429)를 반환, 통과 시 None.
    키: ip:{ip} 와 user:{username}(옵션) 조합.
    """
    ip = getattr(request.client, "host", "unknown")
    keys = [f"ip:{ip}"]
    if username:
        keys.append(f"user:{username}")
    for k in keys:
        ok, retry_after = _GLOBAL_LIMIT.hit(k)
        if not ok:
            return JSONResponse(
                status_code=429,
                content=errorResponse(message="too many requests", code="AUTH_429_RATE_LIMIT"),
                headers={"Retry-After": str(retry_after)},
            )
    return None

