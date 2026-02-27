"""
파일명: backend/service/TransactionService.py
작성자: Codex
갱신일: 2025-12-18
설명: 트랜잭션/세이브포인트 동작을 검증하기 위한 데모 서비스.
"""

from __future__ import annotations

import uuid

from lib import Database as DB
from lib.Transaction import transaction


async def ensureTables(dbName: str = "main_db") -> None:
    """
    설명: 테스트용 트랜잭션 테이블 존재만 확인한다(런타임 DDL 금지).
    갱신일: 2026-02-24
    """
    db = DB.getManager(dbName)
    if not db:
        raise RuntimeError(f"database not found: {dbName}")
    try:
        await db.fetchOneQuery("transaction.pingTestTable")
    except Exception as e:
        raise RuntimeError("T_TEST_TRANSACTION table is missing. seed/migrate schema before runtime.") from e


@transaction("main_db")
async def testSingle() -> dict:
    """
    설명: 단일 INSERT 트랜잭션 성공 케이스를 검증한다.
    갱신일: 2026-02-24
    """
    await ensureTables("main_db")
    db = DB.getManager("main_db")
    assert db is not None
    value = f"tx-{uuid.uuid4().hex[:8]}"
    await db.executeQuery("transaction.insertValue", {"val": value})
    return {"inserted": value}


@transaction("main_db")
async def testUniqueViolation() -> None:
    """
    설명: UNIQUE 제약 위반 시 롤백 동작을 검증한다.
    갱신일: 2026-02-24
    """
    await ensureTables("main_db")
    db = DB.getManager("main_db")
    assert db is not None
    # UNIQUE 제약 위반을 의도적으로 유발한다. 데코레이터가 전체 트랜잭션을 롤백해야 한다.
    await db.executeQuery("transaction.insertValue", {"val": "tx-dup"})
    await db.executeQuery("transaction.insertValue", {"val": "tx-dup"})
