"""
파일명: backend/scripts/users_seed.py
작성자: LSH
갱신일: 2026-02-24
설명: 로컬/테스트용 SQLite 사용자 테이블 생성 및 데모 계정 시드 유틸.
"""

from __future__ import annotations

import base64
import hashlib
import secrets
import sqlite3
from typing import Optional


def connect(dbPath: str) -> sqlite3.Connection:
    """
    설명: SQLite DB 경로로 연결을 생성
    갱신일: 2026-02-24
    """
    return sqlite3.connect(dbPath)


def hashPasswordPbkdf2(plain: str, iterations: int = 260000) -> str:
    """
    설명: PBKDF2-SHA256 해시 문자열을 생성
    갱신일: 2026-02-24
    """
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt, iterations)
    return (
        f"pbkdf2${iterations}$"
        f"{base64.b64encode(salt).decode()}$"
        f"{base64.b64encode(dk).decode()}"
    )


def ensureTable(con: sqlite3.Connection) -> None:
    """
    설명: T_USER 테이블을 보장하고 레거시 컬럼명을 표준 컬럼명으로 정리
    갱신일: 2026-02-24
    """
    con.execute(
        """
        CREATE TABLE IF NOT EXISTS T_USER (
            USER_NO INTEGER PRIMARY KEY AUTOINCREMENT,
            USER_ID TEXT UNIQUE NOT NULL,
            USER_PW TEXT NOT NULL,
            USER_NM TEXT,
            USER_EML TEXT,
            ROLE_CD TEXT
        )
        """
    )
    userColumnMap = [
        ("id", "USER_NO"),
        ("username", "USER_ID"),
        ("password_hash", "USER_PW"),
        ("name", "USER_NM"),
        ("email", "USER_EML"),
        ("role", "ROLE_CD"),
    ]
    renameSqlByLegacy = {
        "id": "ALTER TABLE T_USER RENAME COLUMN id TO USER_NO",
        "username": "ALTER TABLE T_USER RENAME COLUMN username TO USER_ID",
        "password_hash": "ALTER TABLE T_USER RENAME COLUMN password_hash TO USER_PW",
        "name": "ALTER TABLE T_USER RENAME COLUMN name TO USER_NM",
        "email": "ALTER TABLE T_USER RENAME COLUMN email TO USER_EML",
        "role": "ALTER TABLE T_USER RENAME COLUMN role TO ROLE_CD",
    }
    columns = {
        str(row[1]).upper()
        for row in con.execute("PRAGMA table_info(T_USER)").fetchall()
        if len(row) > 1
    }
    for legacyColumnName, targetColumnName in userColumnMap:
        if targetColumnName in columns or legacyColumnName.upper() not in columns:
            continue
        con.execute(renameSqlByLegacy[legacyColumnName])
        columns.discard(legacyColumnName.upper())
        columns.add(targetColumnName)
    con.commit()


def seedDemo(
    con: sqlite3.Connection,
    *,
    username: str = "demo@demo.demo",
    password: str = "password123",
    name: str = "Demo User",
    email: Optional[str] = "demo@demo.demo",
    role: str = "user",
) -> None:
    """
    설명: 데모 사용자 계정이 없으면 1건을 삽입
    갱신일: 2026-02-24
    """
    ensureTable(con)
    cursor = con.execute("SELECT 1 FROM T_USER WHERE USER_ID = ?", (username,))
    if cursor.fetchone():
        return
    passwordHash = hashPasswordPbkdf2(password)
    con.execute(
        "INSERT INTO T_USER (USER_ID, USER_PW, USER_NM, USER_EML, ROLE_CD) VALUES (?,?,?,?,?)",
        (username, passwordHash, name, email, role),
    )
    con.commit()
