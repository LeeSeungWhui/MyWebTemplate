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
        cur = con.execute("SELECT 1 FROM user_template WHERE username = ?", ("demo@demo.demo",))
        if cur.fetchone():
            return
        passwordHash = hashPasswordPbkdf2("password123")
        con.execute(
            "INSERT INTO user_template (username, password_hash, name, email, role) VALUES (?,?,?,?,?)",
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
