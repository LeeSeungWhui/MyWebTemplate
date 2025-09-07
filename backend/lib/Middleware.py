"""
파일명: backend/lib/Middleware.py
작성자: Codex CLI
갱신일: 2025-09-07
설명: 요청ID 전파 및 구조적 접근 로그 미들웨어.
"""

import json
import time
import uuid
from typing import Callable

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from lib.Logger import logger
from .RequestContext import reset_request_id, set_request_id


class RequestLogMiddleware(BaseHTTPMiddleware):
    """
    설명: X-Request-Id 생성/전파 및 구조적 JSON 접근 로그 기록.
    갱신일: 2025-09-07
    """

    async def dispatch(self, request: Request, call_next: Callable):
        """
        설명: 요청 처리 시간/상태/경로 등을 수집하여 INFO 레벨로 로그 출력.
        갱신일: 2025-09-07
        """
        started = time.perf_counter()
        req_id = request.headers.get("X-Request-Id") or str(uuid.uuid4())
        token = set_request_id(req_id)
        try:
            # process
            response = await call_next(request)

            # attach request id header
            try:
                response.headers["X-Request-Id"] = req_id
            except Exception:
                pass

            elapsed_ms = int((time.perf_counter() - started) * 1000)
            level = "INFO"
            log_obj = {
                "ts": int(time.time() * 1000),
                "level": level,
                "requestId": req_id,
                "method": request.method,
                "path": request.url.path,
                "status": response.status_code,
                "latency_ms": elapsed_ms,
                "msg": "access",
            }
            # write as a single JSON string for structured logs
            msg = json.dumps(log_obj, ensure_ascii=False)
            logger.info(msg)
            return response
        finally:
            reset_request_id(token)
"""
Module: lib.Middleware
Purpose: Request logging middleware with requestId propagation.
Logs structured JSON and lowers noise for health endpoints.
"""
