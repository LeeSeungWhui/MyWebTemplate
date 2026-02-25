import os
import sys
import sqlite3
import uuid
from fastapi.testclient import TestClient

baseDir = os.path.dirname(os.path.dirname(__file__))
if baseDir not in sys.path:
    sys.path.insert(0, baseDir)


def authHeaderFromCookie(client):
    token = client.cookies.get("access_token")
    return {"Authorization": f"Bearer {token}"} if token else {}


def findCookie(headers, name):
    for cookie in headers.get_list("set-cookie"):
        if cookie.lower().startswith(f"{name}="):
            return cookie
    return ""


WEB_ORIGIN_HEADERS = {"Origin": "http://localhost:3000"}


def testLoginRefreshMeLogoutFlow():
    from server import app
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123", "rememberMe": True},
        )
        assert response.status_code == 200
        j = response.json()
        assert j["status"] is True
        assert j["result"]["tokenType"] == "cookie"
        assert "accessToken" not in j["result"]
        assert "refreshToken" not in j["result"]
        assert client.cookies.get("access_token")
        assert client.cookies.get("refresh_token")

        response = client.get("/api/v1/auth/me", headers=authHeaderFromCookie(client))
        assert response.status_code == 200
        assert response.json()["result"]["username"] == "demo@demo.demo"

        firstAccess = client.cookies.get("access_token")
        response = client.post("/api/v1/auth/refresh", headers=WEB_ORIGIN_HEADERS)
        assert response.status_code == 200
        refreshBody = response.json()
        assert refreshBody["result"]["tokenType"] == "cookie"
        assert "accessToken" not in refreshBody["result"]
        assert "refreshToken" not in refreshBody["result"]
        secondAccess = client.cookies.get("access_token")
        assert firstAccess != secondAccess

        response = client.post("/api/v1/auth/logout", headers=WEB_ORIGIN_HEADERS)
        assert response.status_code == 204
        response = client.get("/api/v1/auth/me", headers=authHeaderFromCookie(client))
        assert response.status_code == 401
        assert response.headers.get("WWW-Authenticate") == "Bearer"


def testAppLoginRefreshMeLogoutFlow():
    from server import app

    with TestClient(app) as client:
        loginResponse = client.post(
            "/api/v1/auth/app/login",
            json={"username": "demo@demo.demo", "password": "password123", "rememberMe": True},
        )
        assert loginResponse.status_code == 200
        loginBody = loginResponse.json()
        assert loginBody["status"] is True
        appAccessToken = loginBody["result"]["accessToken"]
        appRefreshToken = loginBody["result"]["refreshToken"]
        assert appAccessToken
        assert appRefreshToken
        assert loginBody["result"]["tokenType"] == "bearer"
        # App 계약은 쿠키를 사용하지 않는다.
        assert not findCookie(loginResponse.headers, "access_token")
        assert not findCookie(loginResponse.headers, "refresh_token")

        meResponse = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {appAccessToken}"})
        assert meResponse.status_code == 200
        assert meResponse.json()["result"]["username"] == "demo@demo.demo"

        refreshResponse = client.post(
            "/api/v1/auth/app/refresh",
            json={"refreshToken": appRefreshToken},
        )
        assert refreshResponse.status_code == 200
        refreshBody = refreshResponse.json()
        nextAccessToken = refreshBody["result"]["accessToken"]
        nextRefreshToken = refreshBody["result"]["refreshToken"]
        assert nextAccessToken
        assert nextRefreshToken
        assert nextAccessToken != appAccessToken
        assert not findCookie(refreshResponse.headers, "access_token")
        assert not findCookie(refreshResponse.headers, "refresh_token")

        logoutResponse = client.post(
            "/api/v1/auth/app/logout",
            json={"refreshToken": nextRefreshToken},
        )
        assert logoutResponse.status_code == 204

        # 로그아웃으로 폐기된 refresh 토큰은 재사용할 수 없다.
        rejected = client.post(
            "/api/v1/auth/app/refresh",
            json={"refreshToken": nextRefreshToken},
        )
        assert rejected.status_code == 401
        rejectedBody = rejected.json()
        assert rejectedBody["status"] is False
        assert rejectedBody["code"] == "AUTH_401_INVALID"


def testLoginInvalidAndWwwAuthenticateHeader():
    from server import app
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "wrongpassword"},
        )
        assert response.status_code == 401
        assert response.headers.get("WWW-Authenticate") == "Bearer"
        j = response.json()
        assert j["status"] is False and j["code"] == "AUTH_401_INVALID"


def testLoginMalformedJsonReturns422():
    from server import app
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/login",
            content='{"username":"demo@demo.demo","password":"password123"',
            headers={"Content-Type": "application/json"},
        )
        assert response.status_code == 422
        assert response.headers.get("WWW-Authenticate") == "Bearer"
        body = response.json()
        assert body["status"] is False
        assert body["code"] == "AUTH_422_INVALID_INPUT"


def testRequiresBearerHeaderNotCookie():
    from server import app
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123"},
        )
        assert response.status_code == 200

        responseNoHeader = client.get("/api/v1/auth/me")
        assert responseNoHeader.status_code == 401
        assert responseNoHeader.headers.get("WWW-Authenticate") == "Bearer"

        responseWithHeader = client.get("/api/v1/auth/me", headers=authHeaderFromCookie(client))
        assert responseWithHeader.status_code == 200


def testWebRefreshRequiresAllowedOriginHeader():
    from server import app
    with TestClient(app) as client:
        loginResponse = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123"},
        )
        assert loginResponse.status_code == 200

        missingOrigin = client.post("/api/v1/auth/refresh")
        assert missingOrigin.status_code == 403
        missingBody = missingOrigin.json()
        assert missingBody["status"] is False
        assert missingBody["code"] == "AUTH_403_ORIGIN_REQUIRED"

        deniedOrigin = client.post(
            "/api/v1/auth/refresh",
            headers={"Origin": "https://evil.example"},
        )
        assert deniedOrigin.status_code == 403
        deniedBody = deniedOrigin.json()
        assert deniedBody["status"] is False
        assert deniedBody["code"] == "AUTH_403_ORIGIN_DENIED"


def testWebLogoutRequiresAllowedOriginHeader():
    from server import app
    with TestClient(app) as client:
        loginResponse = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123"},
        )
        assert loginResponse.status_code == 200

        deniedOrigin = client.post(
            "/api/v1/auth/logout",
            headers={"Origin": "https://evil.example"},
        )
        assert deniedOrigin.status_code == 403
        deniedBody = deniedOrigin.json()
        assert deniedBody["status"] is False
        assert deniedBody["code"] == "AUTH_403_ORIGIN_DENIED"


def testWebOriginAllowsServerFrontendHostFallback(monkeypatch):
    from router import AuthRouter

    class FakeSection(dict):
        def get(self, key, fallback=None):
            return dict.get(self, key, fallback)

    fakeConfig = {
        "CORS": FakeSection(
            {
                "allow_origins": "http://localhost:3000,http://localhost",
                "allow_origin_regex": "",
            }
        ),
        "SERVER": FakeSection(
            {
                "frontendHost": "http://localhost:4000",
            }
        ),
    }

    AuthRouter.getCorsOriginRules.cache_clear()
    monkeypatch.setattr(AuthRouter, "getConfig", lambda: fakeConfig)
    try:
        assert AuthRouter.isAllowedWebOrigin("http://localhost:4000") is True
        assert AuthRouter.isAllowedWebOrigin("http://127.0.0.1:4000") is True
        assert AuthRouter.isAllowedWebOrigin("http://evil.example") is False
    finally:
        AuthRouter.getCorsOriginRules.cache_clear()


def testLoginRateLimit():
    from server import app
    with TestClient(app) as client:
        statusCodes = []
        for i in range(6):
            response = client.post(
                "/api/v1/auth/login",
                json={"username": "demo@demo.demo", "password": "nope-nope"},
            )
            statusCodes.append(response.status_code)
        assert 429 in statusCodes
        lastResponse = response
        assert lastResponse.headers.get("Retry-After")
        assert lastResponse.json()["code"] == "AUTH_429_RATE_LIMIT"


def testRateLimiterPrunesExpiredEmptyKey():
    from lib.RateLimit import RateLimiter

    limiter = RateLimiter(limit=5, windowSec=10, sweepEvery=1)
    nowRef = {"value": 0.0}
    limiter.now = lambda: nowRef["value"]

    ok, _ = limiter.hit("ip:1", commit=True)
    assert ok is True
    assert "ip:1" in limiter.store

    nowRef["value"] = 20.0
    ok, _ = limiter.hit("ip:1", commit=False)
    assert ok is True
    assert "ip:1" not in limiter.store


def testRateLimiterSweepsStaleKeysWithoutRevisit():
    from lib.RateLimit import RateLimiter

    limiter = RateLimiter(limit=5, windowSec=10, sweepEvery=1)
    nowRef = {"value": 0.0}
    limiter.now = lambda: nowRef["value"]

    # 서로 다른 키가 단발성으로 들어오면 store에 누적된다.
    for index in range(3):
        ok, _ = limiter.hit(f"ip:{index}", commit=True)
        assert ok is True
    assert len(limiter.store) == 3

    # 윈도우 이후 다음 요청 시 sweep이 동작해 stale key를 제거한다.
    nowRef["value"] = 20.0
    ok, _ = limiter.hit("ip:new", commit=True)
    assert ok is True
    assert list(limiter.store.keys()) == ["ip:new"]


def testRefreshReturns503WhenTokenStateStoreUnavailable(monkeypatch):
    from server import app
    from service import AuthService

    async def raiseUnavailable(_: str):
        raise RuntimeError("token state store unavailable")

    with TestClient(app) as client:
        loginResponse = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123", "rememberMe": True},
        )
        assert loginResponse.status_code == 200
        monkeypatch.setattr(AuthService, "refresh", raiseUnavailable)

        response = client.post("/api/v1/auth/refresh", headers=WEB_ORIGIN_HEADERS)
        assert response.status_code == 503
        assert response.headers.get("Cache-Control") == "no-store"
        body = response.json()
        assert body["status"] is False
        assert body["code"] == "AUTH_503_STATE_STORE"


def testRefreshAutoCreatesTokenStateTableWhenMissing(monkeypatch):
    from server import app
    from service import AuthService

    dbPath = os.path.join(baseDir, "data", "test.db")
    con = sqlite3.connect(dbPath)
    try:
        con.execute("DROP TABLE IF EXISTS T_TOKEN")
        con.commit()
    finally:
        con.close()

    monkeypatch.setenv("AUTH_ALLOW_MEMORY_TOKEN_STATE", "false")
    monkeypatch.setattr(AuthService, "tokenStateStoreReady", False)
    monkeypatch.setattr(AuthService, "tokenStateStoreWarned", False)

    with TestClient(app) as client:
        loginResponse = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123", "rememberMe": True},
        )
        assert loginResponse.status_code == 200

        refreshResponse = client.post("/api/v1/auth/refresh", headers=WEB_ORIGIN_HEADERS)
        assert refreshResponse.status_code == 200

    con = sqlite3.connect(dbPath)
    try:
        cursor = con.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND upper(name) = 'T_TOKEN'"
        )
        assert cursor.fetchone() is not None
    finally:
        con.close()


def testLogoutReturns503WhenTokenStateStoreUnavailable(monkeypatch):
    from server import app
    from service import AuthService

    async def raiseUnavailable(_: str | None):
        raise RuntimeError("token state store unavailable")

    with TestClient(app) as client:
        loginResponse = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123", "rememberMe": True},
        )
        assert loginResponse.status_code == 200
        monkeypatch.setattr(AuthService, "revokeRefreshToken", raiseUnavailable)

        response = client.post("/api/v1/auth/logout", headers=WEB_ORIGIN_HEADERS)
        assert response.status_code == 503
        assert response.headers.get("Cache-Control") == "no-store"
        body = response.json()
        assert body["status"] is False
        assert body["code"] == "AUTH_503_STATE_STORE"


def testRefreshPreservesSessionCookieWhenNotRemember():
    from server import app
    from lib.Auth import AuthConfig

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123", "rememberMe": False},
        )
        assert response.status_code == 200
        refreshCookieHeader = findCookie(response.headers, AuthConfig.refreshCookieName)
        assert refreshCookieHeader
        assert "max-age" not in refreshCookieHeader.lower()

        response = client.post("/api/v1/auth/refresh", headers=WEB_ORIGIN_HEADERS)
        assert response.status_code == 200
        refreshedCookieHeader = findCookie(response.headers, AuthConfig.refreshCookieName)
        assert refreshedCookieHeader
        assert "max-age" not in refreshedCookieHeader.lower()


def testRefreshTokenReuseGraceWindow(monkeypatch):
    from server import app
    from lib.Auth import AuthConfig
    from service import AuthService

    now = {"ms": 1_700_000_000_000}
    monkeypatch.setattr(AuthService, "_nowMs", lambda: now["ms"])

    with TestClient(app) as client:
        # startup에서 AuthConfig.initConfig가 실행되므로, 유예 시간은 클라이언트 컨텍스트 진입 후에 덮어쓴다.
        monkeypatch.setattr(AuthConfig, "refreshGraceMs", 500)
        response = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123", "rememberMe": True},
        )
        assert response.status_code == 200
        originalRefresh = client.cookies.get("refresh_token")
        assert originalRefresh

        # 첫 번째 refresh는 정상 동작해야 한다.
        refreshResponse1 = client.post("/api/v1/auth/refresh", headers=WEB_ORIGIN_HEADERS)
        assert refreshResponse1.status_code == 200
        accessAfterRefresh1 = client.cookies.get("access_token")
        assert accessAfterRefresh1

        # 유예 시간 내: 이전 refresh 토큰 재전송은 동일 토큰 페이로드로 재응답한다.
        client.cookies.set("refresh_token", originalRefresh)
        now["ms"] += 100
        refreshResponse2 = client.post("/api/v1/auth/refresh", headers=WEB_ORIGIN_HEADERS)
        assert refreshResponse2.status_code == 200
        assert client.cookies.get("access_token") == accessAfterRefresh1

        # 유예 시간 이후: 이전 refresh 토큰 재전송은 401이어야 한다.
        client.cookies.set("refresh_token", originalRefresh)
        now["ms"] += 1000
        response3 = client.post("/api/v1/auth/refresh", headers=WEB_ORIGIN_HEADERS)
        assert response3.status_code == 401
        assert response3.headers.get("WWW-Authenticate") == "Bearer"
        body = response3.json()
        assert body["status"] is False
        assert body["code"] == "AUTH_401_INVALID"


def testRefreshAfterLogoutIsRejected(monkeypatch):
    from server import app

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123", "rememberMe": True},
        )
        assert response.status_code == 200
        refreshCookie = client.cookies.get("refresh_token")
        assert refreshCookie

        # 서버와 클라이언트 양쪽에서 쿠키 삭제를 시뮬레ート하되, 테스트를 위해 토큰 값은 별도로 보존한다.
        response = client.post("/api/v1/auth/logout", headers=WEB_ORIGIN_HEADERS)
        assert response.status_code == 204

        # 클라이언트 측에서 예전 refresh 토큰을 다시 보내는 상황을 재현
        client.cookies.set("refresh_token", refreshCookie)
        response2 = client.post("/api/v1/auth/refresh", headers=WEB_ORIGIN_HEADERS)
        assert response2.status_code == 401
        assert response2.headers.get("WWW-Authenticate") == "Bearer"
        body = response2.json()
        assert body["status"] is False
        assert body["code"] == "AUTH_401_INVALID"


def testSignupSuccessThenLogin():
    from server import app

    with TestClient(app) as client:
        email = f"signup-{uuid.uuid4().hex[:8]}@demo.demo"
        signupResponse = client.post(
            "/api/v1/auth/signup",
            json={"name": "Signup User", "email": email, "password": "password123"},
        )
        assert signupResponse.status_code == 201
        signupBody = signupResponse.json()
        assert signupBody["status"] is True
        assert signupBody["result"]["userId"] == email

        loginResponse = client.post(
            "/api/v1/auth/login",
            json={"username": email, "password": "password123"},
        )
        assert loginResponse.status_code == 200


def testSignupDuplicateEmailReturns409():
    from server import app

    with TestClient(app) as client:
        email = f"dup-{uuid.uuid4().hex[:8]}@demo.demo"
        first = client.post(
            "/api/v1/auth/signup",
            json={"name": "Dup User", "email": email, "password": "password123"},
        )
        assert first.status_code == 201

        second = client.post(
            "/api/v1/auth/signup",
            json={"name": "Dup User", "email": email, "password": "password123"},
        )
        assert second.status_code == 409
        body = second.json()
        assert body["status"] is False
        assert body["code"] == "AUTH_409_USER_EXISTS"


def testSignupInvalidInputReturns422():
    from server import app

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/signup",
            json={"name": "A", "email": "not-email", "password": "123"},
        )
        assert response.status_code == 422
        body = response.json()
        assert body["status"] is False
        assert body["code"] == "AUTH_422_INVALID_INPUT"


def testSignupMalformedJsonReturns422():
    from server import app

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/signup",
            content='{"name":"홍길동","email":"hong@example.com","password":"password123"',
            headers={"Content-Type": "application/json"},
        )
        assert response.status_code == 422
        body = response.json()
        assert body["status"] is False
        assert body["code"] == "AUTH_422_INVALID_INPUT"
