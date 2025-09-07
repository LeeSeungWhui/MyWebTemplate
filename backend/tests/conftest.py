import os
import sys
import sqlite3
from configparser import ConfigParser

# Ensure backend/ is importable
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


def _load_db_path() -> str:
    # Read backend/config.ini to resolve database path relative to backend/
    cfg = ConfigParser()
    cfg.read(os.path.join(BASE_DIR, 'config.ini'), encoding='utf-8')
    db_rel = cfg['DATABASE'].get('database', './data/main.db')
    if not os.path.isabs(db_rel):
        return os.path.normpath(os.path.join(BASE_DIR, db_rel))
    return db_rel


def _ensure_user_table_and_demo(db_path: str) -> None:
    from scripts import users_seed  # backend/scripts/users_seed.py

    con = users_seed.connect(db_path)
    try:
        users_seed.ensure_table(con)
        users_seed.seed_demo(con)
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

