import asyncio
import os
import sys
import sqlite3
from configparser import ConfigParser
from fastapi.testclient import TestClient


# Ensure we can import backend modules in both test and runtime
baseDir = os.path.dirname(os.path.dirname(__file__))
if baseDir not in sys.path:
    sys.path.insert(0, baseDir)


def resolveTestDbPath() -> str:
    configPath = os.path.join(baseDir, "config.test.ini")
    config = ConfigParser()
    config.read(configPath, encoding="utf-8")
    dbPathRel = config["DATABASE"].get("database", "./data/test.db")
    if os.path.isabs(dbPathRel):
        return dbPathRel
    return os.path.normpath(os.path.join(baseDir, dbPathRel))


def testHealthzOk():
    from server import app

    with TestClient(app) as client:
        response = client.get("/healthz")
        assert response.status_code == 200
        assert response.headers.get("Cache-Control") == "no-store"
        assert response.headers.get("X-Request-Id")

        data = response.json()
        assert data["status"] is True
        assert data["result"]["ok"] is True
        assert data["requestId"]


def testReadyzOk():
    from server import app

    with TestClient(app) as client:
        response = client.get("/readyz")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] is True
        # db may not exist in tests, but default sqlite is configured; allow either
        assert "ok" in data["result"]


def testRequestIdPropagation():
    from server import app

    with TestClient(app) as client:
        requestId = "test-rid-123"
        response = client.get("/healthz", headers={"X-Request-Id": requestId})
        assert response.status_code == 200
        assert response.headers.get("X-Request-Id") == requestId
        assert response.json()["requestId"] == requestId


def testAccessLogIncludesAuthenticatedUsername(caplog):
    from server import app

    with TestClient(app) as client:
        loginResponse = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123"},
        )
        assert loginResponse.status_code == 200

        token = client.cookies.get("access_token")
        assert token
        caplog.clear()

        response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200

        seen = False
        for rec in caplog.records:
            msg = rec.message
            if (
                '"msg": "access"' in msg
                and '"path": "/api/v1/auth/me"' in msg
                and '"is_authenticated": true' in msg
                and '"usernameMasked": "de**@demo.demo"' in msg
            ):
                seen = True
                break
        assert seen


def testUserAccessLogPersistsToDb():
    from server import app

    with TestClient(app) as client:
        loginResponse = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123"},
        )
        assert loginResponse.status_code == 200
        accessToken = client.cookies.get("access_token")
        assert accessToken

        meResponse = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {accessToken}"})
        assert meResponse.status_code == 200

    dbPath = resolveTestDbPath()
    con = sqlite3.connect(dbPath)
    try:
        row = con.execute(
            """
            SELECT USER_ID, REQ_PATH, RES_CD
              FROM T_USER_LOG
             WHERE USER_ID = ?
               AND REQ_PATH = ?
             ORDER BY REG_DT DESC
             LIMIT 1
            """,
            ("demo@demo.demo", "/api/v1/auth/me"),
        ).fetchone()
    finally:
        con.close()

    assert row is not None
    assert row[0] == "demo@demo.demo"
    assert row[1] == "/api/v1/auth/me"
    assert int(row[2]) == 200


def testUserAccessLogStoresIpLocationForPrivateRange():
    from server import app

    with TestClient(app) as client:
        loginResponse = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123"},
        )
        assert loginResponse.status_code == 200
        accessToken = client.cookies.get("access_token")
        assert accessToken

        meResponse = client.get(
            "/api/v1/auth/me",
            headers={
                "Authorization": f"Bearer {accessToken}",
                "X-Forwarded-For": "10.23.45.67",
            },
        )
        assert meResponse.status_code == 200

    dbPath = resolveTestDbPath()
    con = sqlite3.connect(dbPath)
    try:
        row = con.execute(
            """
            SELECT CLIENT_IP, IP_LOC_TXT, IP_LOC_SRC
              FROM T_USER_LOG
             WHERE USER_ID = ?
               AND REQ_PATH = ?
               AND CLIENT_IP = ?
             ORDER BY REG_DT DESC
             LIMIT 1
            """,
            ("demo@demo.demo", "/api/v1/auth/me", "10.23.45.67"),
        ).fetchone()
    finally:
        con.close()

    assert row is not None
    assert row[0] == "10.23.45.67"
    assert row[1] == "PRIVATE_NET"
    assert row[2] == "IP_LOCAL"


def testReadyzMaintenance(monkeypatch):
    from server import app
    monkeypatch.setenv("MAINTENANCE_MODE", "true")

    with TestClient(app) as client:
        response = client.get("/readyz")
        assert response.status_code == 503
        data = response.json()
        # maintenance mode should return error envelope
        assert data["status"] is False
        assert data["code"] == "OBS_503_NOT_READY"
        assert data["result"]["ok"] is False


def testReadyzFail503(monkeypatch):
    # Force DB ping failure by replacing dbManagers with a stub that raises
    from lib import Database as DB

    class FailingMgr:
        def __init__(self):
            self.databaseUrl = "sqlite:///test.db"

        async def fetchOne(self, sql):
            raise RuntimeError("db down")

    monkeypatch.setattr(DB, "dbManagers", {"main_db": FailingMgr()}, raising=False)

    from server import app
    with TestClient(app) as client:
        response = client.get("/readyz")
        assert response.status_code == 503
        j = response.json()
        assert j["status"] is False
        assert j["result"]["ok"] is False
        assert j["result"]["db"] == "down"


def testReadyzTimeout(monkeypatch):
    # Simulate slow DB to trigger timeout
    from lib import Database as DB

    class SlowMgr:
        def __init__(self):
            self.databaseUrl = "postgresql://"

        async def fetchOne(self, sql):
            await asyncio.sleep(1)
            return None

    monkeypatch.setenv("READYZ_TIMEOUT_MS", "50")
    monkeypatch.setattr(DB, "dbManagers", {"main_db": SlowMgr()}, raising=False)

    from server import app
    with TestClient(app) as client:
        response = client.get("/readyz")
        assert response.status_code == 503
        assert response.json()["result"]["db"] == "down"


def testOraclePingSql(monkeypatch):
    # Verify oracle ping uses SELECT 1 FROM DUAL by having stub capture SQL
    from lib import Database as DB

    class OracleMgr:
        def __init__(self):
            self.databaseUrl = "oracle+cx_oracle://"
            self.lastSql = None

        async def fetchOne(self, sql):
            self.lastSql = sql
            return None

    mgr = OracleMgr()
    monkeypatch.setattr(DB, "dbManagers", {"main_db": mgr}, raising=False)

    from server import app
    with TestClient(app) as client:
        response = client.get("/readyz")
        assert response.status_code in (200, 503)
        # ensure dialect-specific SQL selected
        assert mgr.lastSql == "SELECT 1 FROM DUAL"


def testLoggingShape(caplog):
    from server import app
    with TestClient(app) as client:
        caplog.clear()
        response = client.get("/healthz")
        assert response.status_code == 200
        # find at least one log containing JSON fields we emit
        seen = False
        for rec in caplog.records:
            msg = rec.message
            if (
                '"requestId"' in msg
                and '"latency_ms"' in msg
                and '"path"' in msg
                and '"sql_count"' in msg
            ):
                seen = True
                break
        assert seen


def testSqlCountWarnLogging(caplog, monkeypatch):
    import lib.Middleware as middlewareModule
    monkeypatch.setattr(middlewareModule, "getSqlWarnThreshold", lambda: 1)
    monkeypatch.setattr(middlewareModule, "getSqlCount", lambda: 3)

    from server import app
    with TestClient(app) as client:
        caplog.clear()
        response = client.get("/healthz")
        assert response.status_code == 200

    seen = False
    for rec in caplog.records:
        if '"msg": "sql_count_high"' in rec.message and '"sql_count": 3' in rec.message:
            seen = True
            break
    assert seen


def testSqlWarnThresholdEnvPriority(monkeypatch):
    import lib.Middleware as middlewareModule

    config = ConfigParser()
    config["SERVER"] = {"sql_warn_threshold": "7"}
    monkeypatch.setattr(middlewareModule, "getConfig", lambda: config)
    monkeypatch.setenv("SQL_WARN_THRESHOLD", "11")
    assert middlewareModule.getSqlWarnThreshold() == 11


def testSqlWarnThresholdConfigFallback(monkeypatch):
    import lib.Middleware as middlewareModule

    config = ConfigParser()
    config["SERVER"] = {"sql_warn_threshold": "9"}
    monkeypatch.setattr(middlewareModule, "getConfig", lambda: config)
    monkeypatch.delenv("SQL_WARN_THRESHOLD", raising=False)
    assert middlewareModule.getSqlWarnThreshold() == 9


def testSqlWarnThresholdDefaultFallback(monkeypatch):
    import lib.Middleware as middlewareModule

    config = ConfigParser()
    config["SERVER"] = {"sql_warn_threshold": "invalid"}
    monkeypatch.setattr(middlewareModule, "getConfig", lambda: config)
    monkeypatch.setenv("SQL_WARN_THRESHOLD", "-1")
    assert middlewareModule.getSqlWarnThreshold() == 30
