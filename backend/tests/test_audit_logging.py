import os
import sys
from fastapi.testclient import TestClient


BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


def test_audit_login_and_logout_logs(caplog):
    from server import app

    with TestClient(app) as client:
        caplog.clear()
        # login success
        r = client.post(
            "/api/v1/auth/login",
            json={"username": "demo", "password": "password123"},
        )
        assert r.status_code == 204

        # find login success audit log
        seen_login = any("auth.login.success" in rec.message for rec in caplog.records)
        assert seen_login

        # issue csrf and logout
        csrf = client.get("/api/v1/auth/csrf").json()["result"]["csrf"]
        r2 = client.post("/api/v1/auth/logout", headers={"X-CSRF-Token": csrf})
        assert r2.status_code == 204

        seen_logout = any("auth.logout" in rec.message for rec in caplog.records)
        assert seen_logout

