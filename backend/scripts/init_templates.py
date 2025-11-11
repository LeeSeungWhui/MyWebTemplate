#!/usr/bin/env python3
"""
파일: backend/scripts/init_templates.py
작성: Codex
갱신: 2025-11-11
설명: backend/config.ini를 읽어 user_template, data_template 테이블을 생성하고 샘플 데이터를 삽입한다.

사용법:
  bash -lc "source ./env.sh && python backend/scripts/init_templates.py"

대상 DB:
  - sqlite (aiosqlite)
  - mysql/mariadb (aiomysql)
"""

from __future__ import annotations

import asyncio
import base64
import hashlib
import os
import secrets
from configparser import ConfigParser
from typing import Optional, Tuple

from databases import Database


def _read_db_section(cfg: ConfigParser) -> Tuple[str, dict]:
    """config.ini에서 첫 번째 DATABASE* 섹션을 읽고 (dbType, section) 반환"""
    for name in cfg.sections():
        if not name.upper().startswith("DATABASE"):
            continue
        section = cfg[name]
        db_type = (section.get("type") or "").strip().lower()
        if db_type:
            return db_type, section
    raise RuntimeError("config.ini에 [DATABASE*] 섹션이 없습니다.")


def _sqlite_abs_path(rel: str) -> str:
    base_dir = os.path.dirname(os.path.dirname(__file__))  # backend/
    p = rel
    if not os.path.isabs(p):
        p = os.path.join(base_dir, p)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    return p


def _build_dsn(db_type: str, sec: dict) -> str:
    if db_type == "sqlite":
        db_path = _sqlite_abs_path(sec.get("database"))
        return f"sqlite+aiosqlite:///{db_path}"
    if db_type in ("mysql", "mariadb"):
        host = sec.get("host", "localhost")
        port = sec.get("port", "3306")
        database = sec.get("database")
        user = sec.get("user")
        password = sec.get("password")
        return f"mysql+aiomysql://{user}:{password}@{host}:{port}/{database}?charset=utf8mb4"
    raise RuntimeError(f"지원하지 않는 DB type: {db_type}")


def _hash_password(plain: str) -> str:
    """pbkdf2(SHA256) 해시 문자열 생성 (users_seed.py와 동일 포맷)"""
    salt = secrets.token_bytes(16)
    iters = 100_000
    dk = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt, iters)
    return "pbkdf2$%d$%s$%s" % (
        iters,
        base64.b64encode(salt).decode(),
        base64.b64encode(dk).decode(),
    )


def _ddl_for(db_type: str) -> Tuple[str, str]:
    if db_type == "sqlite":
        user_sql = (
            """
            CREATE TABLE IF NOT EXISTS user_template (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT UNIQUE NOT NULL,
              password_hash TEXT NOT NULL,
              name TEXT,
              email TEXT,
              role TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP NULL
            );
            """
        )
        data_sql = (
            """
            CREATE TABLE IF NOT EXISTS data_template (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT NOT NULL,
              description TEXT,
              status TEXT NOT NULL,
              amount REAL NOT NULL DEFAULT 0,
              tags TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        return user_sql, data_sql

    if db_type in ("mysql", "mariadb"):
        user_sql = (
            """
            CREATE TABLE IF NOT EXISTS user_template (
              id INT AUTO_INCREMENT PRIMARY KEY,
              username VARCHAR(191) NOT NULL UNIQUE,
              password_hash VARCHAR(255) NOT NULL,
              name VARCHAR(191),
              email VARCHAR(191),
              role VARCHAR(64),
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
        )
        data_sql = (
            """
            CREATE TABLE IF NOT EXISTS data_template (
              id INT AUTO_INCREMENT PRIMARY KEY,
              title VARCHAR(191) NOT NULL,
              description TEXT,
              status VARCHAR(32) NOT NULL,
              amount DECIMAL(12,2) NOT NULL DEFAULT 0,
              tags JSON NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
        )
        return user_sql, data_sql

    raise RuntimeError(f"지원하지 않는 DB type: {db_type}")


async def _exec(db: Database, sql: str):
    for stmt in [s.strip() for s in sql.split(";") if s.strip()]:
        await db.execute(stmt)


async def main():
    here = os.path.dirname(os.path.dirname(__file__))  # backend/
    cfg_path = os.path.join(here, "config.ini")
    if not os.path.isfile(cfg_path):
        raise SystemExit("backend/config.ini를 찾을 수 없습니다.")

    cfg = ConfigParser()
    with open(cfg_path, "r", encoding="utf-8") as f:
        cfg.read_file(f)

    db_type, sec = _read_db_section(cfg)
    dsn = _build_dsn(db_type, sec)
    db = Database(dsn)
    await db.connect()
    try:
        # DDL
        user_ddl, data_ddl = _ddl_for(db_type)
        await _exec(db, user_ddl)
        await _exec(db, data_ddl)

        # Seed - users
        users = [
            ("demo", _hash_password("password123"), "Demo User", "demo@example.com", "admin"),
            ("alice", _hash_password("alicePass1!"), "Alice", "alice@example.com", "user"),
            ("bob", _hash_password("bobPass1!"), "Bob", "bob@example.com", "user"),
        ]
        # Upsert-ish: try insert; ignore duplicates
        if db_type == "sqlite":
            ins_sql = (
                "INSERT OR IGNORE INTO user_template (username, password_hash, name, email, role)"
                " VALUES (:u, :p, :n, :e, :r)"
            )
        else:
            ins_sql = (
                "INSERT INTO user_template (username, password_hash, name, email, role)"
                " VALUES (:u, :p, :n, :e, :r)"
                " ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), role=VALUES(role)"
            )
        for u, p, n, e, r in users:
            await db.execute(ins_sql, values={"u": u, "p": p, "n": n, "e": e, "r": r})

        # Seed - data
        rows = [
            ("Welcome Card", "첫 진입시 보여줄 환영 카드", "active", 0.00, ["welcome", "card"]),
            ("Sales Today", "금일 매출 요약", "active", 12345.67, ["kpi", "sales"]),
            ("Pending Tasks", "남은 업무 개수", "draft", 8, ["tasks"]),
            ("System Notice", "시스템 점검 공지", "archived", 0, ["notice"]),
            ("Conversion", "전환율(%)", "active", 3.25, ["kpi", "rate"]),
        ]

        if db_type == "sqlite":
            ins_data = (
                "INSERT INTO data_template (title, description, status, amount, tags)"
                " VALUES (:t, :d, :s, :a, :g)"
            )
        else:
            # MariaDB/MySQL JSON 컬럼은 문자열 바인딩으로도 자동 변환된다.
            ins_data = (
                "INSERT INTO data_template (title, description, status, amount, tags)"
                " VALUES (:t, :d, :s, :a, :g)"
            )

        # 간단한 존재 체크 후 없으면 삽입
        count = await db.fetch_one("SELECT COUNT(*) AS c FROM data_template")
        existing = int(count["c"]) if count and "c" in count else 0
        if existing == 0:
            for t, d, s, a, g in rows:
                tags_json = "[" + ",".join(f'"{x}"' for x in g) + "]"
                await db.execute(ins_data, values={"t": t, "d": d, "s": s, "a": a, "g": tags_json})

        print("[init_templates] 완료: user_template, data_template DDL/seed 적용")
    finally:
        await db.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
