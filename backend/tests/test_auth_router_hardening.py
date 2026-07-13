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


def makeAuthenticatedApp(username: str = "demo@example.com") -> FastAPI:
    app = makeApp()

    class CurrentUser:
        def __init__(self, value: str):
            self.username = value

    async def currentUser():
        return CurrentUser(username)

    app.dependency_overrides[AuthRouter.getCurrentUser] = currentUser
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

    async def fakePasswordReset(payload, processingScheduler=None):
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
    async def failPasswordReset(payload, processingScheduler=None):
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


def testPasswordResetCompleteClearsCookiesAndReturnsNoToken(monkeypatch):
    async def complete(payload):
        assert payload == {"token": "A" * 43, "newPassword": "newpassword123"}
        return {"completed": True}, None

    monkeypatch.setattr(AuthService, "completePasswordReset", complete)
    monkeypatch.setattr(AuthConfig, "accessCookieName", "access_token")
    monkeypatch.setattr(AuthConfig, "refreshCookieName", "refresh_token")

    with TestClient(makeApp()) as client:
        client.cookies.set("access_token", "old-access")
        client.cookies.set("refresh_token", "old-refresh")
        response = client.post(
            "/api/v1/auth/password-reset/complete",
            json={"token": "A" * 43, "newPassword": "newpassword123"},
        )

    assert response.status_code == 200
    assert response.headers.get("Cache-Control") == "no-store"
    assert response.json()["result"] == {"completed": True}
    assert "token" not in response.text.lower()
    deletedCookies = response.headers.get_list("set-cookie")
    assert len(deletedCookies) == 2
    assert all("max-age=0" in cookie.lower() for cookie in deletedCookies)

    with TestClient(makeApp()) as client:
        compatResponse = client.post(
            "/api/v1/auth/passwordResetComplete",
            json={"token": "A" * 43, "newPassword": "newpassword123"},
        )

    assert compatResponse.status_code == 200
    assert compatResponse.json()["result"] == {"completed": True}


def testPasswordResetCompleteConvergesInvalidTokenAndValidatesBody(monkeypatch):
    async def invalid(payload):
        if len(payload.get("token", "")) != 43 or len(payload.get("newPassword", "")) < 8:
            return None, "AUTH_422_INVALID_INPUT"
        return None, "AUTH_400_RESET_INVALID_OR_EXPIRED"

    monkeypatch.setattr(AuthService, "completePasswordReset", invalid)
    with TestClient(makeApp()) as client:
        invalidResponse = client.post(
            "/api/v1/auth/password-reset/complete",
            json={"token": "B" * 43, "newPassword": "newpassword123"},
        )
        malformedResponse = client.post(
            "/api/v1/auth/password-reset/complete",
            json={"token": "short", "newPassword": "short"},
        )

    assert invalidResponse.status_code == 400
    assert invalidResponse.json()["code"] == "AUTH_400_RESET_INVALID_OR_EXPIRED"
    assert malformedResponse.status_code == 422
    assert malformedResponse.json()["code"] == "AUTH_422_INVALID_INPUT"


def testPasswordChangeCallsServiceExactlyAndClearsCookiesWithoutTokens(monkeypatch):
    allowLocalOrigin(monkeypatch)
    calls = []
    rateLimitEvents = []
    reservationHandle = object()

    def captureReservation(request, username=None, *, namespace="auth.login"):
        rateLimitEvents.append(("reserve", username, namespace))
        return None, reservationHandle

    def captureFinalization(handle, *, keep):
        rateLimitEvents.append(("finalize", handle, keep))
        return True

    async def change(userId, payload):
        calls.append((userId, payload))
        return {"changed": True}, None

    monkeypatch.setattr(AuthRouter, "reserveRateLimit", captureReservation)
    monkeypatch.setattr(AuthRouter, "finalizeRateLimitReservation", captureFinalization)
    monkeypatch.setattr(AuthService, "changePassword", change)
    monkeypatch.setattr(AuthConfig, "accessCookieName", "access_token")
    monkeypatch.setattr(AuthConfig, "refreshCookieName", "refresh_token")

    with TestClient(makeAuthenticatedApp()) as client:
        client.cookies.set("access_token", "old-access")
        client.cookies.set("refresh_token", "old-refresh")
        response = client.post(
            "/api/v1/auth/password-change",
            headers=WEB_ORIGIN_HEADERS,
            json={"currentPassword": "password123", "newPassword": "newpassword123"},
        )

    assert calls == [
        (
            "demo@example.com",
            {"currentPassword": "password123", "newPassword": "newpassword123"},
        )
    ]
    assert rateLimitEvents == [
        ("reserve", "demo@example.com", "auth.password_change"),
        ("finalize", reservationHandle, False),
    ]
    assert response.status_code == 200
    assert response.headers.get("Cache-Control") == "no-store"
    assert response.json()["result"] == {"changed": True}
    assert "token" not in response.text.lower()
    deletedCookies = response.headers.get_list("set-cookie")
    assert len(deletedCookies) == 2
    assert all("max-age=0" in cookie.lower() for cookie in deletedCookies)


def testPasswordChangeMismatchPrechecksCanonicalUserAndIpThenCommits(monkeypatch):
    allowLocalOrigin(monkeypatch)
    events = []
    reservationHandle = object()

    def captureReservation(request, username=None, *, namespace="auth.login"):
        events.append(("reserve", request.client.host, username, namespace))
        return None, reservationHandle

    def captureFinalization(handle, *, keep):
        events.append(("finalize", handle, keep))
        return True

    async def reject(userId, payload):
        events.append(("service", userId, payload["currentPassword"]))
        return None, "AUTH_400_CURRENT_PASSWORD_INVALID"

    monkeypatch.setattr(AuthRouter, "reserveRateLimit", captureReservation)
    monkeypatch.setattr(AuthRouter, "finalizeRateLimitReservation", captureFinalization)
    monkeypatch.setattr(AuthService, "changePassword", reject)

    with TestClient(makeAuthenticatedApp("  DEMO@EXAMPLE.COM  ")) as client:
        response = client.post(
            "/api/v1/auth/password-change",
            headers=WEB_ORIGIN_HEADERS,
            json={"currentPassword": "wrong-password", "newPassword": "newpassword123"},
        )

    assert response.status_code == 400
    assert response.json()["code"] == "AUTH_400_CURRENT_PASSWORD_INVALID"
    assert events == [
        ("reserve", "testclient", "demo@example.com", "auth.password_change"),
        ("service", "  DEMO@EXAMPLE.COM  ", "wrong-password"),
        ("finalize", reservationHandle, True),
    ]


def testPasswordChangeRateLimitStopsSecondServiceCallWithStandard429(monkeypatch):
    allowLocalOrigin(monkeypatch)
    limiter = RateLimit.RateLimiter(limit=1, windowSec=60)
    serviceCalls = []

    async def reject(userId, payload):
        serviceCalls.append((userId, payload["currentPassword"]))
        return None, "AUTH_400_CURRENT_PASSWORD_INVALID"

    monkeypatch.setattr(RateLimit, "globalRateLimiter", limiter)
    monkeypatch.setattr(AuthService, "changePassword", reject)

    with TestClient(makeAuthenticatedApp("  DEMO@EXAMPLE.COM  ")) as client:
        first = client.post(
            "/api/v1/auth/password-change",
            headers=WEB_ORIGIN_HEADERS,
            json={"currentPassword": "wrong-password", "newPassword": "newpassword123"},
        )
        limited = client.post(
            "/api/v1/auth/password-change",
            headers=WEB_ORIGIN_HEADERS,
            json={"currentPassword": "wrong-again", "newPassword": "newpassword123"},
        )

    assert first.status_code == 400
    assert limited.status_code == 429
    assert limited.json()["code"] == "AUTH_429_RATE_LIMIT"
    assert limited.headers.get("Retry-After")
    assert limited.headers.get("Cache-Control") == "no-store"
    assert serviceCalls == [("  DEMO@EXAMPLE.COM  ", "wrong-password")]
    assert set(limiter.store) == {
        "auth.password_change:ip:testclient",
        "auth.password_change:user:demo@example.com",
    }


def testPasswordChangeRejectsOriginMediaMalformedAndUnknownFieldsBeforeService(monkeypatch):
    allowLocalOrigin(monkeypatch)
    calls = []

    async def change(userId, payload):
        calls.append((userId, payload))
        return {"changed": True}, None

    monkeypatch.setattr(AuthService, "changePassword", change)
    app = makeAuthenticatedApp()
    validPayload = {"currentPassword": "password123", "newPassword": "newpassword123"}

    with TestClient(app) as client:
        missingOrigin = client.post("/api/v1/auth/password-change", json=validPayload)
        deniedOrigin = client.post(
            "/api/v1/auth/password-change",
            headers={"Origin": "https://evil.example"},
            json=validPayload,
        )
        wrongMedia = client.post(
            "/api/v1/auth/password-change",
            headers={**WEB_ORIGIN_HEADERS, "Content-Type": "text/plain"},
            content="not-json",
        )
        malformed = client.post(
            "/api/v1/auth/password-change",
            headers={**WEB_ORIGIN_HEADERS, "Content-Type": "application/json"},
            content="{",
        )
        unknown = client.post(
            "/api/v1/auth/password-change",
            headers=WEB_ORIGIN_HEADERS,
            json={**validPayload, "userId": "other@example.com"},
        )

    assert missingOrigin.status_code == 403
    assert deniedOrigin.status_code == 403
    for response in (wrongMedia, malformed, unknown):
        assert response.status_code == 422
        assert response.json()["code"] == "AUTH_422_INVALID_INPUT"
    assert calls == []


def testPasswordChangeRejectsUnauthenticatedBeforeServiceWithStandardHeaders(monkeypatch):
    from fastapi import HTTPException
    from server import httpExceptionHandler

    calls = []

    async def change(userId, payload):
        calls.append((userId, payload))
        return {"changed": True}, None

    monkeypatch.setattr(AuthService, "changePassword", change)
    app = makeApp()
    app.add_exception_handler(HTTPException, httpExceptionHandler)

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/password-change",
            headers=WEB_ORIGIN_HEADERS,
            json={"currentPassword": "password123", "newPassword": "newpassword123"},
        )

    assert response.status_code == 401
    assert response.headers.get("WWW-Authenticate") == "Bearer"
    assert response.headers.get("Cache-Control") == "no-store"
    assert response.json()["status"] is False
    assert response.json()["code"] == "AUTH_401_UNAUTHORIZED"
    assert calls == []


def testPasswordChangeMapsExpectedAndUnexpectedServiceErrorsSafely(monkeypatch):
    allowLocalOrigin(monkeypatch)
    rateLimitEvents = []
    reservationSequence = {"value": 0}

    def captureReservation(request, username=None, *, namespace="auth.login"):
        reservationSequence["value"] += 1
        handle = f"reservation-{reservationSequence['value']}"
        rateLimitEvents.append(("reserve", username, namespace, handle))
        return None, handle

    def captureFinalization(handle, *, keep):
        rateLimitEvents.append(("finalize", handle, keep))
        return True

    async def change(userId, payload):
        assert userId == "demo@example.com"
        errorByPassword = {
            "wrong-password": "AUTH_400_CURRENT_PASSWORD_INVALID",
            "short": "AUTH_422_INVALID_INPUT",
            "db-not-ready": "AUTH_503_DB_NOT_READY",
            "internal": "INTERNAL_DATABASE_DETAIL",
        }
        return None, errorByPassword[payload["currentPassword"]]

    monkeypatch.setattr(AuthRouter, "reserveRateLimit", captureReservation)
    monkeypatch.setattr(AuthRouter, "finalizeRateLimitReservation", captureFinalization)
    monkeypatch.setattr(AuthService, "changePassword", change)
    app = makeAuthenticatedApp()

    with TestClient(app) as client:
        responses = {
            currentPassword: client.post(
                "/api/v1/auth/password-change",
                headers=WEB_ORIGIN_HEADERS,
                json={"currentPassword": currentPassword, "newPassword": "newpassword123"},
            )
            for currentPassword in ("wrong-password", "short", "db-not-ready", "internal")
        }

    expected = {
        "wrong-password": (400, "AUTH_400_CURRENT_PASSWORD_INVALID"),
        "short": (422, "AUTH_422_INVALID_INPUT"),
        "db-not-ready": (503, "AUTH_503_DB_NOT_READY"),
        "internal": (500, "AUTH_500_PASSWORD_CHANGE_FAILED"),
    }
    for currentPassword, (statusCode, responseCode) in expected.items():
        response = responses[currentPassword]
        assert response.status_code == statusCode
        assert response.headers.get("Cache-Control") == "no-store"
        assert response.json()["code"] == responseCode
        assert "INTERNAL_DATABASE_DETAIL" not in response.text
    assert rateLimitEvents == [
        ("reserve", "demo@example.com", "auth.password_change", "reservation-1"),
        ("finalize", "reservation-1", True),
        ("reserve", "demo@example.com", "auth.password_change", "reservation-2"),
        ("finalize", "reservation-2", False),
        ("reserve", "demo@example.com", "auth.password_change", "reservation-3"),
        ("finalize", "reservation-3", False),
        ("reserve", "demo@example.com", "auth.password_change", "reservation-4"),
        ("finalize", "reservation-4", False),
    ]


def testPasswordChangeReleasesReservationWhenServiceRaises(monkeypatch):
    allowLocalOrigin(monkeypatch)
    reservationHandle = object()
    finalizations = []

    def captureReservation(request, username=None, *, namespace="auth.login"):
        return None, reservationHandle

    def captureFinalization(handle, *, keep):
        finalizations.append((handle, keep))
        return True

    async def explode(userId, payload):
        raise RuntimeError("unexpected password-change failure")

    monkeypatch.setattr(AuthRouter, "reserveRateLimit", captureReservation)
    monkeypatch.setattr(AuthRouter, "finalizeRateLimitReservation", captureFinalization)
    monkeypatch.setattr(AuthService, "changePassword", explode)

    try:
        with TestClient(makeAuthenticatedApp()) as client:
            client.post(
                "/api/v1/auth/password-change",
                headers=WEB_ORIGIN_HEADERS,
                json={"currentPassword": "password123", "newPassword": "newpassword123"},
            )
    except RuntimeError as exc:
        assert str(exc) == "unexpected password-change failure"
    else:
        raise AssertionError("service exception must escape the test app")

    assert finalizations == [(reservationHandle, False)]


def testPasswordChangeOpenapiDocumentsCanonicalSecureNoTokenContract():
    from server import app

    app.openapi_schema = None
    with TestClient(app) as client:
        response = client.get("/openapi.json")

    assert response.status_code == 200
    schema = response.json()
    schemas = schema["components"]["schemas"]

    requestSchema = schemas["PasswordChangeRequest"]
    assert requestSchema == {
        "type": "object",
        "properties": {
            "currentPassword": {"type": "string", "minLength": 1},
            "newPassword": {"type": "string", "minLength": 8},
        },
        "required": ["currentPassword", "newPassword"],
        "additionalProperties": False,
    }
    assert schemas["PasswordChangeResult"] == {
        "type": "object",
        "properties": {"changed": {"type": "boolean", "const": True}},
        "required": ["changed"],
        "additionalProperties": False,
    }
    assert "token" not in str(schemas["PasswordChangeResult"]).lower()
    assert "token" not in str(schemas["PasswordChangeResponse"]).lower()

    operation = schema["paths"]["/api/v1/auth/password-change"]["post"]
    assert operation["requestBody"] == {
        "required": True,
        "content": {
            "application/json": {
                "schema": {"$ref": "#/components/schemas/PasswordChangeRequest"}
            }
        },
    }
    assert operation["security"] == [{"bearerAuth": []}, {"OAuth2PasswordBearer": []}]
    parameterRefs = {item.get("$ref") for item in operation["parameters"]}
    assert "#/components/parameters/OriginHeader" in parameterRefs
    assert "#/components/parameters/RefererHeader" in parameterRefs

    responses = operation["responses"]
    assert {"200", "400", "401", "403", "422", "429", "500", "503"} <= set(responses)
    assert responses["429"] == {
        "$ref": "#/components/responses/RateLimitErrorResponse"
    }
    assert responses["200"]["content"]["application/json"]["schema"] == {
        "$ref": "#/components/schemas/PasswordChangeResponse"
    }
    assert "Set-Cookie" in responses["200"]["headers"]
    assert "Cache-Control" in responses["200"]["headers"]


def testPasswordResetMailFailureDoesNotChangePublicRequestResponse(monkeypatch):
    async def createToken(email, tokenHash, createdAtMs, expiresAtMs):
        assert len(tokenHash) == 64
        return email

    def failDelivery(_recipient, _rawToken):
        raise RuntimeError("smtp unavailable")

    logCalls = []
    monkeypatch.setattr(AuthService, "createPasswordResetTokenInTransaction", createToken)
    monkeypatch.setattr(AuthService.PasswordResetMail, "sendPasswordReset", failDelivery)
    monkeypatch.setattr(AuthService.logger, "error", lambda *args, **kwargs: logCalls.append(args))
    monkeypatch.setattr(AuthRouter, "checkRateLimit", lambda *args, **kwargs: None)

    with TestClient(makeApp()) as client:
        response = client.post(
            "/api/v1/auth/password-reset/request",
            json={"email": "demo@example.com"},
        )

    assert response.status_code == 200
    assert response.json()["result"] == {"accepted": True}
    assert logCalls
    assert all("smtp unavailable" not in repr(call) for call in logCalls)


def testPasswordResetRequestSchedulesOneBackgroundTaskForEveryValidEmail(monkeypatch):
    processed = []

    async def captureProcessing(email):
        processed.append(email)

    monkeypatch.setattr(AuthService, "processPasswordResetRequest", captureProcessing)
    monkeypatch.setattr(AuthRouter, "checkRateLimit", lambda *args, **kwargs: None)

    with TestClient(makeApp()) as client:
        existing = client.post(
            "/api/v1/auth/password-reset/request",
            json={"email": "exists@example.com"},
        )
        missing = client.post(
            "/api/v1/auth/password-reset/request",
            json={"email": "missing@example.com"},
        )

    assert existing.status_code == missing.status_code == 200
    assert existing.json() == missing.json()
    assert processed == ["exists@example.com", "missing@example.com"]
