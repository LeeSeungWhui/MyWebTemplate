"""
파일: backend/scripts/users_seed.py
작성: Codex
갱신: 2025-12-18
설명: 로컬/테스트용 SQLite 사용자 테이블 생성 및 데모 계정 시드 유틸.
"""

from __future__ import annotations

import base64
import hashlib
import secrets
import sqlite3
from typing import Optional


def connect(db_path: str) -> sqlite3.Connection:
    return sqlite3.connect(db_path)


def _hash_password_pbkdf2(plain: str, iterations: int = 260000) -> str:
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt, iterations)
    return (
        f"pbkdf2${iterations}$"
        f"{base64.b64encode(salt).decode()}$"
        f"{base64.b64encode(dk).decode()}"
    )


def ensure_table(con: sqlite3.Connection) -> None:
    con.execute(
        """
        CREATE TABLE IF NOT EXISTS user_template (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT,
            email TEXT,
            role TEXT
        )
        """
    )
    con.commit()


def seed_demo(
    con: sqlite3.Connection,
    *,
    username: str = "demo@demo.demo",
    password: str = "password123",
    name: str = "Demo User",
    email: Optional[str] = "demo@demo.demo",
    role: str = "user",
) -> None:
    ensure_table(con)
    cur = con.execute("SELECT 1 FROM user_template WHERE username = ?", (username,))
    if cur.fetchone():
        return
    pwd_hash = _hash_password_pbkdf2(password)
    con.execute(
        "INSERT INTO user_template (username, password_hash, name, email, role) VALUES (?,?,?,?,?)",
        (username, pwd_hash, name, email, role),
    )
    con.commit()

