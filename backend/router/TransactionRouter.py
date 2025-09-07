"""
파일명: backend/router/TransactionRouter.py
작성자: Codex CLI
갱신일: 2025-09-07
설명: 트랜잭션 유틸 테스트 라우트. 공용 데모용 엔드포인트.
"""

from fastapi import APIRouter
from lib.Response import successResponse, errorResponse
from lib.Transaction import transaction
from service.TransactionService import ensure_tables, do_single_commit, do_unique_violation

# Transaction test endpoints (v1)
router = APIRouter(prefix="/api/v1/transaction", tags=["transaction"])


@transaction("main_db")
async def _tx_single():
    await do_single_commit()


@transaction("main_db")
async def _tx_unique():
    await do_unique_violation()


@router.post("/test/single")
async def testSingleTransaction():
    """
    설명: 단일 DB 트랜잭션(테이블 생성 후 1건 입력).
    갱신일: 2025-09-07
    """
    await ensure_tables()
    await _tx_single()
    return successResponse(message="single transaction ok")


@router.post("/test/unique-violation")
async def testTransactionUniqueViolation():
    """
    설명: 오류를 강제로 발생시켜 트랜잭션 롤백 검증.
    갱신일: 2025-09-07
    """
    try:
        await ensure_tables()
        await _tx_unique()
        # if no error, that's unexpected
        return errorResponse(message="expected unique violation not raised", code="TX_500_TEST")
    except Exception:
        # rollback by decorator; surface a 409-like error payload
        return errorResponse(message="unique violation", code="TX_409_UNIQUE")
