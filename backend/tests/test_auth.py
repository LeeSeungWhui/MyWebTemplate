import os
import sys
from fastapi.testclient import TestClient

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


def _auth_header_from_cookie(client):
    token = client.cookies.get("access_token")
    return {"Authorization": f"Bearer {token}"} if token else {}


def _find_cookie(headers, name):
    for cookie in headers.get_list("set-cookie"):
        if cookie.lower().startswith(f"{name}="):
            return cookie
    return ""


def test_login_refresh_me_logout_flow():
    from server import app
    with TestClient(app) as client:
        res = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123", "rememberMe": True},
        )
        assert res.status_code == 200
        j = res.json()
        assert j["status"] is True
        assert j["result"]["access_token"]
        assert client.cookies.get("access_token")
        assert client.cookies.get("refresh_token")

        res = client.get("/api/v1/auth/me", headers=_auth_header_from_cookie(client))
        assert res.status_code == 200
        assert res.json()["result"]["username"] == "demo@demo.demo"

        first_access = client.cookies.get("access_token")
        res = client.post("/api/v1/auth/refresh")
        assert res.status_code == 200
        second_access = client.cookies.get("access_token")
        assert first_access != second_access

        res = client.post("/api/v1/auth/logout")
        assert res.status_code == 204
        res = client.get("/api/v1/auth/me", headers=_auth_header_from_cookie(client))
        assert res.status_code == 401
        assert res.headers.get("WWW-Authenticate") == "Bearer"


def test_login_invalid_and_www_authenticate_header():
    from server import app
    with TestClient(app) as client:
        res = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "wrongpassword"},
        )
        assert res.status_code == 401
        assert res.headers.get("WWW-Authenticate") == "Bearer"
        j = res.json()
        assert j["status"] is False and j["code"] == "AUTH_401_INVALID"


def test_requires_bearer_header_not_cookie():
    from server import app
    with TestClient(app) as client:
        res = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123"},
        )
        assert res.status_code == 200

        res_no_header = client.get("/api/v1/auth/me")
        assert res_no_header.status_code == 401
        assert res_no_header.headers.get("WWW-Authenticate") == "Bearer"

        res_with_header = client.get("/api/v1/auth/me", headers=_auth_header_from_cookie(client))
        assert res_with_header.status_code == 200


def test_login_rate_limit():
    from server import app
    with TestClient(app) as client:
        codes = []
        for _ in range(6):
            res = client.post(
                "/api/v1/auth/login",
                json={"username": "demo@demo.demo", "password": "nope-nope"},
            )
            codes.append(res.status_code)
        assert 429 in codes
        last = res
        assert last.headers.get("Retry-After")
        assert last.json()["code"] == "AUTH_429_RATE_LIMIT"


def test_refresh_preserves_session_cookie_when_not_remember():
    from server import app
    from lib.Auth import AuthConfig

    with TestClient(app) as client:
        res = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123", "rememberMe": False},
        )
        assert res.status_code == 200
        refresh_cookie = _find_cookie(res.headers, AuthConfig.REFRESH_COOKIE_NAME)
        assert refresh_cookie
        assert "max-age" not in refresh_cookie.lower()

        res = client.post("/api/v1/auth/refresh")
        assert res.status_code == 200
        refreshed_cookie = _find_cookie(res.headers, AuthConfig.REFRESH_COOKIE_NAME)
        assert refreshed_cookie
        assert "max-age" not in refreshed_cookie.lower()


def test_refresh_token_reuse_is_rejected():
    from server import app

    with TestClient(app) as client:
        res = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123", "rememberMe": True},
        )
        assert res.status_code == 200
        original_refresh = client.cookies.get("refresh_token")
        assert original_refresh

        # 첫 번째 refresh는 정상적으로 동작해야 한다.
        res1 = client.post("/api/v1/auth/refresh")
        assert res1.status_code == 200

        # 이전 refresh 토큰을 다시 사용하면 401이 반환되어야 한다.
        client.cookies.set("refresh_token", original_refresh)
        res2 = client.post("/api/v1/auth/refresh")
        assert res2.status_code == 401
        assert res2.headers.get("WWW-Authenticate") == "Bearer"
        body = res2.json()
        assert body["status"] is False
        assert body["code"] == "AUTH_401_INVALID"


def test_refresh_after_logout_is_rejected(monkeypatch):
    from server import app

    with TestClient(app) as client:
        res = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123", "rememberMe": True},
        )
        assert res.status_code == 200
        refresh_cookie = client.cookies.get("refresh_token")
        assert refresh_cookie

        # 서버와 클라이언트 양쪽에서 쿠키 삭제를 시뮬레ート하되, 테스트를 위해 토큰 값은 별도로 보존한다.
        res = client.post("/api/v1/auth/logout")
        assert res.status_code == 204

        # 클라이언트 측에서 예전 refresh 토큰을 다시 보내는 상황을 재현
        client.cookies.set("refresh_token", refresh_cookie)
        res2 = client.post("/api/v1/auth/refresh")
        assert res2.status_code == 401
        assert res2.headers.get("WWW-Authenticate") == "Bearer"
        body = res2.json()
        assert body["status"] is False
        assert body["code"] == "AUTH_401_INVALID"
