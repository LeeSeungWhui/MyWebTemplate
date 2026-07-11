from fastapi import FastAPI
from fastapi.testclient import TestClient
from starlette.requests import Request

from lib.Auth import AuthConfig
from lib import RateLimit
from router import AuthRouter
from service import AuthService


ALLOWED_ORIGIN = "http://localhost:3000"
WEB_ORIGIN_HEADERS = {"Origin": ALLOWED_ORIGIN}


def makeApp() -> FastAPI:
    app = FastAPI()
    app.include_router(AuthRouter.router)
    return app


def makeRequest() -> Request:
    return Request(
        {
            "type": "http",
            "method": "POST",
            "path": "/api/v1/auth/login",
            "headers": [],
            "scheme": "http",
            "server": ("testserver", 80),
            "client": ("127.0.0.1", 12345),
        }
    )


def tokenPayload(*, remember: bool = False) -> dict:
    return {
        "accessToken": "access-token",
        "refreshToken": "refresh-token",
        "tokenType": "bearer",
        "expiresIn": 3600,
        "refreshExpiresIn": 604800,
        "remember": remember,
    }


def allowLocalOrigin(monkeypatch) -> None:
    monkeypatch.setattr(
        AuthRouter,
        "getCorsOriginRules",
        lambda: ((ALLOWED_ORIGIN,), None),
    )


def testProdRuntimeForcesSecureCookieSetAndLogout503Delete(monkeypatch):
    allowLocalOrigin(monkeypatch)
    monkeypatch.setattr(AuthConfig, "runtime", " production ")
    monkeypatch.setattr(AuthConfig, "accessCookieName", "custom_access")
    monkeypatch.setattr(AuthConfig, "refreshCookieName", "custom_refresh")

    async def fakeLogin(payload, remember):
        return {"token": tokenPayload(remember=True)}

    async def failRevoke(_):
        raise RuntimeError("state store unavailable")

    monkeypatch.setattr(AuthService, "login", fakeLogin)
    monkeypatch.setattr(AuthService, "revokeRefreshToken", failRevoke)
    monkeypatch.setattr(AuthRouter, "checkRateLimit", lambda *args, **kwargs: None)

    with TestClient(makeApp()) as client:
        loginResponse = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123"},
        )
        assert loginResponse.status_code == 200
        setCookies = loginResponse.headers.get_list("set-cookie")
        assert len(setCookies) == 2
        assert all("secure" in cookie.lower() for cookie in setCookies)
        assert any(cookie.lower().startswith("custom_access=") for cookie in setCookies)
        assert any(cookie.lower().startswith("custom_refresh=") for cookie in setCookies)

        logoutResponse = client.post("/api/v1/auth/logout", headers=WEB_ORIGIN_HEADERS)
        assert logoutResponse.status_code == 503
        assert logoutResponse.headers.get("Cache-Control") == "no-store"
        assert logoutResponse.json()["code"] == "AUTH_503_STATE_STORE"
        deleteCookies = logoutResponse.headers.get_list("set-cookie")
        assert len(deleteCookies) == 2
        assert all(
            "secure" in cookie.lower() and "max-age=0" in cookie.lower()
            for cookie in deleteCookies
        )
        assert any(cookie.lower().startswith("custom_access=") for cookie in deleteCookies)
        assert any(cookie.lower().startswith("custom_refresh=") for cookie in deleteCookies)

    assert AuthRouter.isSecureRequest(makeRequest()) is True


def testOriginRegexUsesFullmatchAndMalformedRegexFailsClosed(monkeypatch):
    monkeypatch.setattr(
        AuthRouter,
        "getCorsOriginRules",
        lambda: ((), r"https://allowed\.example"),
    )
    assert AuthRouter.isAllowedWebOrigin("https://allowed.example") is True
    assert AuthRouter.isAllowedWebOrigin("https://allowed.example.evil") is False

    monkeypatch.setattr(AuthRouter, "getCorsOriginRules", lambda: ((), "["))
    assert AuthRouter.isAllowedWebOrigin("https://allowed.example") is False


def testNamespacedRateLimiterSeparatesSignupAndPasswordReset(monkeypatch):
    limiter = RateLimit.RateLimiter(limit=5, windowSec=60)
    monkeypatch.setattr(RateLimit, "globalRateLimiter", limiter)
    request = makeRequest()

    assert RateLimit.checkRateLimit(
        request,
        username="demo@example.com",
        commit=True,
        namespace="auth.signup",
    ) is None
    assert RateLimit.checkRateLimit(
        request,
        username="demo@example.com",
        commit=True,
        namespace="auth.password_reset",
    ) is None

    assert set(limiter.store) == {
        "auth.signup:ip:127.0.0.1",
        "auth.signup:user:demo@example.com",
        "auth.password_reset:ip:127.0.0.1",
        "auth.password_reset:user:demo@example.com",
    }


def testWebAndAppLoginUseCanonicalEquivalentThrottleKey(monkeypatch):
    calls = []

    def captureRateLimit(request, username=None, *, commit=True, namespace="auth.login"):
        calls.append((username, commit, namespace))
        return None

    async def rejectLogin(payload, remember):
        return None

    monkeypatch.setattr(AuthRouter, "checkRateLimit", captureRateLimit)
    monkeypatch.setattr(AuthService, "login", rejectLogin)

    with TestClient(makeApp()) as client:
        for path in ("/api/v1/auth/login", "/api/v1/auth/app/login"):
            response = client.post(
                path,
                json={"username": "  DEMO@EXAMPLE.COM  ", "password": "wrongpass"},
            )
            assert response.status_code == 401

    assert calls == [
        ("demo@example.com", False, "auth.login"),
        ("demo@example.com", True, "auth.login"),
        ("demo@example.com", False, "auth.login"),
        ("demo@example.com", True, "auth.login"),
    ]


def testSignupAndAllPasswordResetRoutesCommitNormalizedNamespacedThrottle(monkeypatch):
    calls = []

    def captureRateLimit(request, username=None, *, commit=True, namespace="auth.login"):
        calls.append((username, commit, namespace))
        return None

    async def fakeSignup(payload, idempotencyKey=None):
        return {"userId": "demo@example.com", "userNm": "Demo"}, None

    async def fakePasswordReset(payload):
        return {"accepted": True}, None

    monkeypatch.setattr(AuthRouter, "checkRateLimit", captureRateLimit)
    monkeypatch.setattr(AuthService, "signup", fakeSignup)
    monkeypatch.setattr(AuthService, "requestPasswordReset", fakePasswordReset)

    with TestClient(makeApp()) as client:
        response = client.post(
            "/api/v1/auth/signup",
            json={"name": "Demo", "email": "  DEMO@EXAMPLE.COM ", "password": "password123"},
        )
        assert response.status_code == 201

        for path in (
            "/api/v1/auth/passwordResetRequest",
            "/api/v1/auth/password-reset/request",
            "/api/v1/auth/passwordReset/request",
        ):
            response = client.post(path, json={"email": "  DEMO@EXAMPLE.COM "})
            assert response.status_code == 200
            assert response.json()["result"]["accepted"] is True

    assert calls == [
        ("demo@example.com", True, "auth.signup"),
        ("demo@example.com", True, "auth.password_reset"),
        ("demo@example.com", True, "auth.password_reset"),
        ("demo@example.com", True, "auth.password_reset"),
    ]


def testJsonMediaTypeAndSuppliedWebOriginPolicy(monkeypatch):
    allowLocalOrigin(monkeypatch)

    async def fakeLogin(payload, remember):
        return {"token": tokenPayload()}

    async def fakeRevoke(_):
        return None

    monkeypatch.setattr(AuthService, "login", fakeLogin)
    monkeypatch.setattr(AuthService, "revokeRefreshToken", fakeRevoke)
    monkeypatch.setattr(AuthRouter, "checkRateLimit", lambda *args, **kwargs: None)

    loginBody = '{"username":"demo@demo.demo","password":"password123"}'
    hostileBodies = {
        "/api/v1/auth/login": loginBody,
        "/api/v1/auth/signup": '{"name":"Demo","email":"demo@example.com","password":"password123"}',
        "/api/v1/auth/password-reset/request": '{"email":"demo@example.com"}',
    }
    with TestClient(makeApp()) as client:
        for path, body in hostileBodies.items():
            response = client.post(
                path,
                content=body,
                headers={"Content-Type": "text/plain", "Origin": "https://evil.example"},
            )
            assert response.status_code == 403
            assert response.json()["code"] == "AUTH_403_ORIGIN_DENIED"
            assert response.headers.get("WWW-Authenticate") is None

        nonJson = client.post(
            "/api/v1/auth/login",
            content=loginBody,
            headers={"Content-Type": "text/plain"},
        )
        assert nonJson.status_code == 422

        problemJson = client.post(
            "/api/v1/auth/app/login",
            content=loginBody,
            headers={"Content-Type": "application/problem+json; charset=utf-8"},
        )
        assert problemJson.status_code == 200

        originPrecedence = client.post(
            "/api/v1/auth/login",
            content=loginBody,
            headers={
                "Content-Type": "application/json",
                "Origin": "malformed-origin",
                "Referer": f"{ALLOWED_ORIGIN}/login",
            },
        )
        assert originPrecedence.status_code == 403
        assert originPrecedence.headers.get("WWW-Authenticate") is None

        emptyLogout = client.post("/api/v1/auth/app/logout")
        assert emptyLogout.status_code == 204
        nonJsonLogout = client.post(
            "/api/v1/auth/app/logout",
            content='{"refreshToken":"token"}',
            headers={"Content-Type": "text/plain"},
        )
        assert nonJsonLogout.status_code == 422


def testSignupFallbackSanitizesArbitraryServiceCode(monkeypatch):
    async def failSignup(payload, idempotencyKey=None):
        return None, "INTERNAL_DATABASE_DETAIL"

    monkeypatch.setattr(AuthService, "signup", failSignup)
    monkeypatch.setattr(AuthRouter, "checkRateLimit", lambda *args, **kwargs: None)

    with TestClient(makeApp()) as client:
        response = client.post(
            "/api/v1/auth/signup",
            json={"name": "Demo", "email": "demo@example.com", "password": "password123"},
        )

    assert response.status_code == 500
    assert response.json()["code"] == "AUTH_500_SIGNUP_FAILED"
    assert "INTERNAL_DATABASE_DETAIL" not in response.text


def testPasswordResetFallbackSanitizesArbitraryServiceCode(monkeypatch):
    async def failPasswordReset(payload):
        return None, "INTERNAL_PROVIDER_DETAIL"

    monkeypatch.setattr(AuthService, "requestPasswordReset", failPasswordReset)
    monkeypatch.setattr(AuthRouter, "checkRateLimit", lambda *args, **kwargs: None)

    with TestClient(makeApp()) as client:
        response = client.post(
            "/api/v1/auth/password-reset/request",
            json={"email": "demo@example.com"},
        )

    assert response.status_code == 500
    assert response.headers.get("Cache-Control") == "no-store"
    assert response.json()["code"] == "AUTH_500_PASSWORD_RESET_FAILED"
    assert "INTERNAL_PROVIDER_DETAIL" not in response.text
