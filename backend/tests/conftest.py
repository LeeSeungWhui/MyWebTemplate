import os
import sys
import sqlite3
import base64
import secrets
import hashlib
import pytest

"""
파일명: backend/tests/conftest.py
작성자: LSH
갱신일: 2025-12-02
설명: pytest 사전 준비(테스트 DB 경로 및 사용자 시드)
"""
from configparser import ConfigParser

baseDir = os.path.dirname(os.path.dirname(__file__))
testConfigPath = os.path.join(baseDir, "config.test.ini")
os.environ["BACKEND_CONFIG"] = testConfigPath
if baseDir not in sys.path:
    sys.path.insert(0, baseDir)


def loadDbPath() -> str:
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
            CREATE TABLE IF NOT EXISTS T_TEST_TRANSACTION (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                VALUE TEXT UNIQUE
            )
            """
        )
        con.commit()
    finally:
        con.close()


def ensureUserLogTable(dbPath: str) -> None:
    os.makedirs(os.path.dirname(dbPath), exist_ok=True)
    con = sqlite3.connect(dbPath)
    try:
        con.execute(
            """
            CREATE TABLE IF NOT EXISTS T_USER_LOG (
                LOG_ID TEXT PRIMARY KEY,
                USER_ID TEXT NOT NULL,
                REQ_ID TEXT,
                REQ_MTHD TEXT NOT NULL,
                REQ_PATH TEXT NOT NULL,
                RES_CD INTEGER NOT NULL,
                LATENCY_MS INTEGER NOT NULL,
                SQL_CNT INTEGER NOT NULL DEFAULT 0,
                CLIENT_IP TEXT,
                IP_LOC_TXT TEXT,
                IP_LOC_SRC TEXT,
                REG_DT TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        con.commit()
    finally:
        con.close()


def pytest_sessionstart(session):
    dbPath = loadDbPath()
    ensureUserTableAndDemo(dbPath)
    ensureTxTable(dbPath)
    ensureUserLogTable(dbPath)


@pytest.fixture(autouse=True)
def resetRateLimiter():
    try:
        from lib.RateLimit import globalRateLimiter

        globalRateLimiter.store.clear()
    except Exception:
        pass
    yield
