import asyncio
import os
import sys
from fastapi.testclient import TestClient


# Ensure we can import backend modules in both test and runtime
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


def test_healthz_ok():
    from server import app

    with TestClient(app) as client:
        r = client.get("/healthz")
        assert r.status_code == 200
        assert r.headers.get("Cache-Control") == "no-store"
        assert r.headers.get("X-Request-Id")

        data = r.json()
        assert data["status"] is True
        assert data["result"]["ok"] is True
        assert data["requestId"]


def test_readyz_ok():
    from server import app

    with TestClient(app) as client:
        r = client.get("/readyz")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] is True
        # db may not exist in tests, but default sqlite is configured; allow either
        assert "ok" in data["result"]


def test_request_id_propagation():
    from server import app

    with TestClient(app) as client:
        rid = "test-rid-123"
        r = client.get("/healthz", headers={"X-Request-Id": rid})
        assert r.status_code == 200
        assert r.headers.get("X-Request-Id") == rid
        assert r.json()["requestId"] == rid


def test_readyz_maintenance(monkeypatch):
    from server import app
    monkeypatch.setenv("MAINTENANCE_MODE", "true")

    with TestClient(app) as client:
        r = client.get("/readyz")
        assert r.status_code == 503
        data = r.json()
        # maintenance mode should return error envelope
        assert data["status"] is False
        assert data["code"] == "OBS_503_NOT_READY"
        assert data["result"]["ok"] is False


def test_readyz_fail_503(monkeypatch):
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
        r = client.get("/readyz")
        assert r.status_code == 503
        j = r.json()
        assert j["status"] is False
        assert j["result"]["ok"] is False
        assert j["result"]["db"] == "down"


def test_readyz_timeout(monkeypatch):
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
        r = client.get("/readyz")
        assert r.status_code == 503
        assert r.json()["result"]["db"] == "down"


def test_oracle_ping_sql(monkeypatch):
    # Verify oracle ping uses SELECT 1 FROM DUAL by having stub capture SQL
    from lib import Database as DB

    class OracleMgr:
        def __init__(self):
            self.databaseUrl = "oracle+cx_oracle://"
            self.last_sql = None

        async def fetchOne(self, sql):
            self.last_sql = sql
            return None

    mgr = OracleMgr()
    monkeypatch.setattr(DB, "dbManagers", {"main_db": mgr}, raising=False)

    from server import app
    with TestClient(app) as client:
        r = client.get("/readyz")
        assert r.status_code in (200, 503)
        # ensure dialect-specific SQL selected
        assert mgr.last_sql == "SELECT 1 FROM DUAL"


def test_logging_shape(caplog):
    from server import app
    with TestClient(app) as client:
        import logging

        caplog.set_level(logging.DEBUG)
        caplog.clear()
        r = client.get("/healthz")
        assert r.status_code == 200
        seen = False
        for rec in caplog.records:
            msg = rec.message
            if '"requestId"' in msg and '"latency_ms"' in msg and '"path"' in msg:
                seen = True
                break
        assert seen


def test_healthz_readyz_logs_debug(caplog):
    from server import app
    with TestClient(app) as client:
        import logging

        caplog.set_level(logging.DEBUG)
        caplog.clear()
        client.get('/healthz')
        client.get('/readyz')
        health_debug = any(rec.levelname == 'DEBUG' and '"path": "/healthz"' in rec.message for rec in caplog.records)
        ready_debug = any(rec.levelname == 'DEBUG' and '"path": "/readyz"' in rec.message for rec in caplog.records)
        assert health_debug and ready_debug
