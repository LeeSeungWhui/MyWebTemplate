"""
파일: backend/service/TransactionService.py
작성: Codex CLI
갱신: 2025-09-07
설명: 트랜잭션 유틸 도메인 서비스. 테이블 보장/단일 커밋/유니크 위반 시뮬레이트.
"""

from __future__ import annotations

from lib import Database as DB


async def ensure_tables() -> None:
    # No DDL at runtime; tests will ensure the table exists.
    return


async def do_single_commit() -> None:
    await ensure_tables()
    db = DB.getManager()
    if not db:
        raise RuntimeError("DB manager unavailable")
    await db.executeQuery("tx.insertValue", {"val": "tx-single"})


async def do_unique_violation() -> None:
    await ensure_tables()
    db = DB.getManager()
    if not db:
        raise RuntimeError("DB manager unavailable")
    # insert a fixed value to hit unique constraint
    await db.executeQuery("tx.insertValue", {"val": "tx-dup"})
    # second insert will violate UNIQUE
    await db.executeQuery("tx.insertValue", {"val": "tx-dup"})

