import os
import sys
import sqlite3
import base64
import secrets
import hashlib

"""
파일명: backend/tests/conftest.py
작성자: Codex
갱신일: 2025-12-02
설명: pytest 사전 준비(테스트 DB 경로 및 사용자 시드)
"""
from configparser import ConfigParser

# Ensure backend/ is importable
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


def _load_db_path() -> str:
    # Read backend/config.ini to resolve database path relative to backend/
    cfg = ConfigParser()
    cfg.read(os.path.join(BASE_DIR, 'config.ini'), encoding='utf-8')
    # Accept legacy [DATABASE] and current [DATABASE_1]/[DATABASE_2] sections.
    section = None
    for candidate in ('DATABASE', 'DATABASE_1', 'DATABASE_2'):
        if candidate in cfg:
            section = candidate
            break
    db_rel = cfg[section].get('database', './data/main.db') if section else './data/main.db'
    if not os.path.isabs(db_rel):
        return os.path.normpath(os.path.join(BASE_DIR, db_rel))
    return db_rel


def _hash_password_pbkdf2(plain: str, iterations: int = 260000) -> str:
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt, iterations)
    return f"pbkdf2${iterations}${base64.b64encode(salt).decode()}${base64.b64encode(dk).decode()}"


def _ensure_user_table_and_demo(db_path: str) -> None:
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    con = sqlite3.connect(db_path)
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
        cur = con.execute("SELECT 1 FROM user_template WHERE username = ?", ("demo",))
        if cur.fetchone():
            return
        pwd_hash = _hash_password_pbkdf2("password123")
        con.execute(
            "INSERT INTO user_template (username, password_hash, name, email, role) VALUES (?,?,?,?,?)",
            ("demo", pwd_hash, "Demo User", "demo@demo.demo", "user"),
        )
        con.commit()
    finally:
        con.close()


def _ensure_tx_table(db_path: str) -> None:
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    con = sqlite3.connect(db_path)
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
    db_path = _load_db_path()
    _ensure_user_table_and_demo(db_path)
    _ensure_tx_table(db_path)
