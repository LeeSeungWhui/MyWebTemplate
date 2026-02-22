import os
import sys
import sqlite3
import base64
import secrets
import hashlib
import pytest

"""
파일명: backend/tests/conftest.py
작성자: Codex
갱신일: 2025-12-02
설명: pytest 사전 준비(테스트 DB 경로 및 사용자 시드)
"""
from configparser import ConfigParser

# Ensure backend/ is importable
baseDir = os.path.dirname(os.path.dirname(__file__))
testConfigPath = os.path.join(baseDir, "config.test.ini")
os.environ["BACKEND_CONFIG"] = testConfigPath
if baseDir not in sys.path:
    sys.path.insert(0, baseDir)


def loadDbPath() -> str:
    # 테스트 전용 config(test)에서 DB 경로를 읽는다.
    config = ConfigParser()
    config.read(testConfigPath, encoding="utf-8")
    section = "DATABASE"
    dbPathRel = (
        config[section].get("database", "./data/test.db")
        if section in config
        else "./data/test.db"
    )
    if not os.path.isabs(dbPathRel):
        return os.path.normpath(os.path.join(baseDir, dbPathRel))
    return dbPathRel


def hashPasswordPbkdf2(plain: str, iterations: int = 260000) -> str:
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt, iterations)
    return f"pbkdf2${iterations}${base64.b64encode(salt).decode()}${base64.b64encode(dk).decode()}"


def ensureUserTableAndDemo(dbPath: str) -> None:
    os.makedirs(os.path.dirname(dbPath), exist_ok=True)
    con = sqlite3.connect(dbPath)
    try:
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
        columns = {
            str(row[1]).upper()
            for row in con.execute("PRAGMA table_info(T_USER)").fetchall()
            if len(row) > 1
        }
        for legacyColumnName, targetColumnName in userColumnMap:
            if targetColumnName in columns or legacyColumnName.upper() not in columns:
                continue
            con.execute(f"ALTER TABLE T_USER RENAME COLUMN {legacyColumnName} TO {targetColumnName}")
            columns.discard(legacyColumnName.upper())
            columns.add(targetColumnName)
        con.commit()
        cur = con.execute("SELECT 1 FROM T_USER WHERE USER_ID = ?", ("demo@demo.demo",))
        if cur.fetchone():
            return
        passwordHash = hashPasswordPbkdf2("password123")
        con.execute(
            "INSERT INTO T_USER (USER_ID, USER_PW, USER_NM, USER_EML, ROLE_CD) VALUES (?,?,?,?,?)",
            ("demo@demo.demo", passwordHash, "Demo User", "demo@demo.demo", "user"),
        )
        con.commit()
    finally:
        con.close()


def ensureTxTable(dbPath: str) -> None:
    os.makedirs(os.path.dirname(dbPath), exist_ok=True)
    con = sqlite3.connect(dbPath)
    try:
        con.execute(
            """
            CREATE TABLE IF NOT EXISTS test_transaction (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                value TEXT UNIQUE
            )
            """
        )
        con.commit()
    finally:
        con.close()


def pytest_sessionstart(session):
    # Seed required tables/data for tests without touching runtime code.
    dbPath = loadDbPath()
    ensureUserTableAndDemo(dbPath)
    ensureTxTable(dbPath)


@pytest.fixture(autouse=True)
def resetRateLimiter():
    # Ensure tests don't depend on order (RateLimiter is in-memory global).
    try:
        from lib.RateLimit import globalRateLimiter

        globalRateLimiter.store.clear()
    except Exception:
        pass
    yield
