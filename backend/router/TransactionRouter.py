"""
파일명: backend/router/TransactionRouter.py
작성자: LSH
갱신일: 2025-12-18
설명: 트랜잭션/세이브포인트/로깅 검증용 데모 라우터.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from lib.Auth import getCurrentUser
from lib.Response import errorResponse, successResponse
from service import TransactionService

router = APIRouter(prefix="/api/v1/transaction", tags=["transaction"])


@router.post("/test/single")
async def testSingle(user=Depends(getCurrentUser)):
    """
    설명: 단일 트랜잭션 정상 커밋 동작을 검증한다.
    갱신일: 2026-02-22
    """
    result = await TransactionService.testSingle()
    return JSONResponse(status_code=200, content=successResponse(result=result))


@router.post("/test/unique-violation")
async def testUniqueViolation(user=Depends(getCurrentUser)):
    """
    설명: unique 제약 위반 시 롤백/에러 응답 동작을 검증한다.
    갱신일: 2026-02-22
    """
    try:
        await TransactionService.testUniqueViolation()
        return JSONResponse(status_code=200, content=successResponse(result={"ok": True}))
    except Exception:
        return JSONResponse(
            status_code=409,
            content=errorResponse(
                message="unique constraint violation",
                code="TX_409_UNIQUE",
            ),
        )
