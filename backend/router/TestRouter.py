"""
파일: backend/router/TestRouter.py
작성: Codex CLI
갱신: 2025-09-07
설명: 테스트 전용 엔드포인트(unsafe POST) - OpenAPI CSRF 패치 검증용.
"""

from fastapi import APIRouter
from lib.Response import successResponse


router = APIRouter(prefix="/api/v1/test", tags=["test"])


@router.post("/unsafe")
async def unsafe_post():
    return successResponse(result={"ok": True})

