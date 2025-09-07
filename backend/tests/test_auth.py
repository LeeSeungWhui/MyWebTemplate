import os
import sys
from fastapi.testclient import TestClient


BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


def test_session_unauthenticated_has_no_store():
    from server import app
    with TestClient(app) as client:
        r = client.get("/api/v1/auth/session")
        assert r.status_code == 200
        assert r.headers.get("Cache-Control") == "no-store"
        j = r.json()
        assert j["status"] is True
        assert j["result"]["authenticated"] is False


def test_login_session_and_logout_csrf():
    from server import app
    with TestClient(app) as client:
        # login success
        r = client.post(
            "/api/v1/auth/login",
            json={"username": "demo", "password": "password123"},
        )
        assert r.status_code == 204
        # session should be authenticated
        r = client.get("/api/v1/auth/session")
        assert r.status_code == 200
        j = r.json()
        assert j["result"]["authenticated"] is True
        assert j["result"]["userId"] == "demo"

        # logout without csrf -> 403
        r = client.post("/api/v1/auth/logout")
        assert r.status_code == 403
        assert r.json()["code"] == "AUTH_403_CSRF_REQUIRED"

        # issue csrf and logout success
        r = client.get("/api/v1/auth/csrf")
        assert r.status_code == 200
        csrf = r.json()["result"]["csrf"]
        r = client.post("/api/v1/auth/logout", headers={"X-CSRF-Token": csrf})
        assert r.status_code == 204

        # session becomes unauthenticated
        r = client.get("/api/v1/auth/session")
        assert r.status_code == 200
        assert r.json()["result"]["authenticated"] is False


def test_logout_requires_csrf():
    from server import app
    with TestClient(app) as client:
        # create session via csrf endpoint to ensure cookie exists
        r = client.get("/api/v1/auth/csrf")
        assert r.status_code == 200
        # now try logout without csrf
        r = client.post("/api/v1/auth/logout")
        assert r.status_code == 403
        assert r.json()["code"] == "AUTH_403_CSRF_REQUIRED"


def test_login_invalid_and_www_authenticate_cookie_header():
    from server import app
    with TestClient(app) as client:
        r = client.post(
            "/api/v1/auth/login",
            json={"username": "demo", "password": "wrongpassword"},
        )
        assert r.status_code == 401
        assert r.headers.get("WWW-Authenticate") == "Cookie"
        j = r.json()
        assert j["status"] is False and j["code"] == "AUTH_401_INVALID"


def test_bearer_token_issue():
    from server import app
    with TestClient(app) as client:
        r = client.post(
            "/api/v1/auth/token",
            json={"username": "demo", "password": "password123"},
        )
        assert r.status_code == 200
        j = r.json()
        assert j["status"] is True
        assert j["result"]["token_type"] == "bearer"
        assert j["result"]["access_token"]


def test_unauthorized_access_returns_www_authenticate_header():
    from server import app
    with TestClient(app) as client:
        r = client.get("/api/v1/auth/me")
        assert r.status_code == 401
        assert r.headers.get("WWW-Authenticate") == "Bearer"


def test_login_rate_limit():
    from server import app
    with TestClient(app) as client:
        # 6 rapid wrong attempts should trigger 429 (limit=5/min)
        codes = []
        for _ in range(6):
            r = client.post(
                "/api/v1/auth/login",
                json={"username": "demo", "password": "nope-nope"},
            )
            codes.append(r.status_code)
        assert 429 in codes
        # and response should include Retry-After
        last = r
        assert last.headers.get("Retry-After")
        assert last.json()["code"] == "AUTH_429_RATE_LIMIT"


def test_session_endpoint_has_no_store_cache_control():
    from server import app
    with TestClient(app) as client:
        r = client.get("/api/v1/auth/session")
        assert r.headers.get("Cache-Control") == "no-store"


def test_session_cookie_rotates_on_login():
    from server import app
    with TestClient(app) as client:
        # prime a session cookie via csrf endpoint
        r = client.get("/api/v1/auth/csrf")
        assert r.status_code == 200
        before = client.cookies.get("sid")
        # login
        r = client.post(
            "/api/v1/auth/login",
            json={"username": "demo", "password": "password123"},
        )
        assert r.status_code == 204
        after = client.cookies.get("sid")
        assert before != after
