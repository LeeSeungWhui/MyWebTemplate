import os
import sys
from fastapi.testclient import TestClient


BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


def test_login_refresh_me_logout_flow():
    from server import app
    with TestClient(app) as client:
        res = client.post(
            "/api/v1/auth/login",
            json={"username": "demo", "password": "password123", "rememberMe": True},
        )
        assert res.status_code == 200
        j = res.json()
        assert j["status"] is True
        assert j["result"]["access_token"]
        assert client.cookies.get("access_token")
        assert client.cookies.get("refresh_token")

        res = client.get("/api/v1/auth/me")
        assert res.status_code == 200
        assert res.json()["result"]["username"] == "demo"

        res = client.post("/api/v1/auth/refresh")
        assert res.status_code == 200
        assert client.cookies.get("access_token")

        res = client.post("/api/v1/auth/logout")
        assert res.status_code == 204
        res = client.get("/api/v1/auth/me")
        assert res.status_code == 401


def test_login_invalid_and_www_authenticate_header():
    from server import app
    with TestClient(app) as client:
        res = client.post(
            "/api/v1/auth/login",
            json={"username": "demo", "password": "wrongpassword"},
        )
        assert res.status_code == 401
        assert res.headers.get("WWW-Authenticate") == "Bearer"
        j = res.json()
        assert j["status"] is False and j["code"] == "AUTH_401_INVALID"


def test_bearer_token_issue():
    from server import app
    with TestClient(app) as client:
        res = client.post(
            "/api/v1/auth/token",
            json={"username": "demo", "password": "password123"},
        )
        assert res.status_code == 200
        j = res.json()
        assert j["status"] is True
        assert j["result"]["token_type"] == "bearer"
        assert j["result"]["access_token"]


def test_unauthorized_access_returns_www_authenticate_header():
    from server import app
    with TestClient(app) as client:
        res = client.get("/api/v1/auth/me")
        assert res.status_code == 401
        assert res.headers.get("WWW-Authenticate") == "Bearer"


def test_login_rate_limit():
    from server import app
    with TestClient(app) as client:
        codes = []
        for _ in range(6):
            res = client.post(
                "/api/v1/auth/login",
                json={"username": "demo", "password": "nope-nope"},
            )
            codes.append(res.status_code)
        assert 429 in codes
        last = res
        assert last.headers.get("Retry-After")
        assert last.json()["code"] == "AUTH_429_RATE_LIMIT"


def test_access_cookie_rotates_on_refresh():
    from server import app
    with TestClient(app) as client:
        res = client.post(
            "/api/v1/auth/login",
            json={"username": "demo", "password": "password123"},
        )
        assert res.status_code == 200
        first_access = client.cookies.get("access_token")
        res = client.post("/api/v1/auth/refresh")
        assert res.status_code == 200
        second_access = client.cookies.get("access_token")
        assert first_access != second_access
