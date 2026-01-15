"""
파일명: backend/router/TransactionRouter.py
작성자: Codex
갱신일: 2025-12-18
설명: 트랜잭션/세이브포인트/로깅 검증용 데모 라우터.
"""

from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from lib.Response import errorResponse, successResponse
from service import TransactionService

router = APIRouter(prefix="/api/v1/transaction", tags=["transaction"])


@router.post("/test/single")
async def test_single():
    result = await TransactionService.test_single()
    return JSONResponse(status_code=200, content=successResponse(result=result))


@router.post("/test/unique-violation")
async def test_unique_violation():
    try:
        await TransactionService.test_unique_violation()
        return JSONResponse(status_code=200, content=successResponse(result={"ok": True}))
    except Exception:
        return JSONResponse(
            status_code=409,
            content=errorResponse(
                message="unique constraint violation",
                code="TX_409_UNIQUE",
            ),
        )
