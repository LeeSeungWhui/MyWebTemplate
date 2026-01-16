"""
파일: backend/service/TransactionService.py
작성: Codex
갱신: 2025-12-18
설명: 트랜잭션/세이브포인트 동작을 검증하기 위한 데모 서비스.
"""

from __future__ import annotations

import uuid

from lib import Database as DB
from lib.Transaction import transaction


async def ensureTables(dbName: str = "main_db") -> None:
    db = DB.getManager(dbName)
    if not db:
        raise RuntimeError(f"database not found: {dbName}")
    await db.execute(
        """
        CREATE TABLE IF NOT EXISTS test_transaction (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            value TEXT UNIQUE
        )
        """,
    )


@transaction("main_db")
async def testSingle() -> dict:
    await ensureTables("main_db")
    db = DB.getManager("main_db")
    assert db is not None
    value = f"tx-{uuid.uuid4().hex[:8]}"
    await db.execute(
        "INSERT INTO test_transaction (value) VALUES (:val)",
        {"val": value},
    )
    return {"inserted": value}


@transaction("main_db")
async def testUniqueViolation() -> None:
    await ensureTables("main_db")
    db = DB.getManager("main_db")
    assert db is not None
    # Intentionally trigger UNIQUE constraint error. The decorator must roll back the whole tx.
    await db.execute(
        "INSERT INTO test_transaction (value) VALUES (:val)",
        {"val": "tx-dup"},
    )
    await db.execute(
        "INSERT INTO test_transaction (value) VALUES (:val)",
        {"val": "tx-dup"},
    )
