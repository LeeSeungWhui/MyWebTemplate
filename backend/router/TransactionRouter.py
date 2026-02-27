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
    설명: 서비스의 단건 insert 시나리오를 호출해 커밋 성공 응답을 반환한다.
    반환값: 삽입 결과를 successResponse로 감싼 status=200 JSONResponse를 반환한다.
    갱신일: 2026-02-22
    """
    result = await TransactionService.testSingle()
    return JSONResponse(status_code=200, content=successResponse(result=result))


@router.post("/test/unique-violation")
async def testUniqueViolation(user=Depends(getCurrentUser)):
    """
    설명: UNIQUE 제약 충돌 시나리오를 실행하고 롤백 결과를 409로 매핑한다.
    처리 규칙: 서비스 예외 발생 시 code=TX_409_UNIQUE 표준 에러 응답을 반환한다.
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
