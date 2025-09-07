"""
파일: backend/service/TransactionService.py
작성: Codex CLI
갱신: 2025-09-07
설명: 트랜잭션 유틸 도메인 서비스. 테이블 보장/단일 커밋/유니크 위반 시뮬레이트.
"""

from __future__ import annotations

from lib import Database as DB


async def ensure_tables() -> None:
    if "main_db" not in DB.dbManagers:
        return
    db = DB.dbManagers["main_db"]
    await db.execute("""
    CREATE TABLE IF NOT EXISTS test_transaction (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        value TEXT UNIQUE
    )
    """)


async def do_single_commit() -> None:
    await ensure_tables()
    db = DB.dbManagers["main_db"]
    await db.execute("INSERT INTO test_transaction (value) VALUES (:val)", {"val": "tx-single"})


async def do_unique_violation() -> None:
    await ensure_tables()
    db = DB.dbManagers["main_db"]
    # insert a fixed value to hit unique constraint
    await db.execute("INSERT INTO test_transaction (value) VALUES (:val)", {"val": "tx-dup"})
    # second insert will violate UNIQUE
    await db.execute("INSERT INTO test_transaction (value) VALUES (:val)", {"val": "tx-dup"})

