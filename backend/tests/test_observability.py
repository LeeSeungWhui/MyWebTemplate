import asyncio
import os
import sys
from fastapi.testclient import TestClient


# Ensure we can import backend modules in both test and runtime
baseDir = os.path.dirname(os.path.dirname(__file__))
if baseDir not in sys.path:
    sys.path.insert(0, baseDir)


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
            if '"requestId"' in msg and '"latency_ms"' in msg and '"path"' in msg:
                seen = True
                break
        assert seen
