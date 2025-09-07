#!/usr/bin/env python
"""
Utility to initialize and inspect the SQLite user table used by the backend.

Usage examples:
  - Initialize table and seed demo user:
      python backend/scripts/users_seed.py --init --seed-demo
  - List users:
      python backend/scripts/users_seed.py --list
  - Add a user:
      python backend/scripts/users_seed.py --add --username alice --password secret123 --name "Alice" --email alice@example.com --role user
"""

from __future__ import annotations

import argparse
import os
import sqlite3
from typing import Optional
import base64
import hashlib
import secrets


def connect(db_path: str):
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    return con


def ensure_table(con) -> None:
    con.execute(
        """
        CREATE TABLE IF NOT EXISTS T_USER (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT,
          email TEXT,
          role TEXT,
          last_login_at TIMESTAMP
        )
        """
    )
    con.commit()


def _hash_password(plain: str) -> str:
    salt = secrets.token_bytes(16)
    iters = 100_000
    dk = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt, iters)
    return "pbkdf2$%d$%s$%s" % (
        iters,
        base64.b64encode(salt).decode(),
        base64.b64encode(dk).decode(),
    )


def seed_demo(con) -> None:
    row = con.execute("SELECT username FROM T_USER WHERE username=?", ("demo",)).fetchone()
    if row is None:
        hashed = _hash_password("password123")
        con.execute(
            "INSERT INTO T_USER (username, password_hash, name, email, role) VALUES (?,?,?,?,?)",
            ("demo", hashed, "Demo User", "demo@example.com", "admin"),
        )
        con.commit()


def add_user(con, username: str, password: str, name: Optional[str], email: Optional[str], role: Optional[str]):
    hashed = _hash_password(password)
    con.execute(
        "INSERT INTO T_USER (username, password_hash, name, email, role) VALUES (?,?,?,?,?)",
        (username, hashed, name, email, role),
    )
    con.commit()


def list_users(con) -> None:
    rows = con.execute("SELECT id, username, name, email, role FROM T_USER ORDER BY id LIMIT 50").fetchall()
    for r in rows:
        print(dict(r))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join("backend", "data", "main.db"))
    ap.add_argument("--init", action="store_true")
    ap.add_argument("--seed-demo", action="store_true")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--add", action="store_true")
    ap.add_argument("--username")
    ap.add_argument("--password")
    ap.add_argument("--name")
    ap.add_argument("--email")
    ap.add_argument("--role")
    args = ap.parse_args()

    con = connect(args.db)
    try:
        if args.init:
            ensure_table(con)
        if args.seed_demo:
            ensure_table(con)
            seed_demo(con)
        if args.add:
            ensure_table(con)
            if not args.username or not args.password:
                ap.error("--add requires --username and --password")
            add_user(con, args.username, args.password, args.name, args.email, args.role)
        if args.list:
            ensure_table(con)
            list_users(con)
    finally:
        con.close()


if __name__ == "__main__":
    main()
