"""
파일명: backend/lib/Middleware.py
작성자: LSH
갱신일: 2025-09-07
설명: 요청ID 전파 및 구조적 접근 로그 미들웨어.
"""

import json
import time
import uuid
from typing import Callable, Awaitable

from fastapi import Request
from starlette.responses import Response as StarletteResponse
from starlette.middleware.base import BaseHTTPMiddleware

from lib.Logger import logger
from .RequestContext import resetRequestId, setRequestId


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
        try:
            # 실제 비즈니스 핸들러 호출
            response = await callNext(request)

            # 응답 헤더에 요청 ID를 추가
            try:
                response.headers["X-Request-Id"] = reqId
            except Exception:
                pass

            elapsedMs = int((time.perf_counter() - started) * 1000)
            level = "INFO"
            logObj = {
                "ts": int(time.time() * 1000),
                "level": level,
                "requestId": reqId,
                "method": request.method,
                "path": request.url.path,
                "status": response.status_code,
                "latency_ms": elapsedMs,
                "msg": "access",
            }
            # 구조적 로그를 위해 JSON 문자열로 기록
            msg = json.dumps(logObj, ensure_ascii=False)
            logger.info(msg)
            return response
        finally:
            resetRequestId(token)
