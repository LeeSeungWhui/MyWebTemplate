"""
파일명: backend/tests/test_auth.py
작성자: LSH
갱신일: 2026-04-08
설명: 인증 Web/App 계약, 비밀번호 재설정 요청, 회원가입 API 통합테스트
"""

import os
import sys
import uuid
import importlib
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier

from fastapi.testclient import TestClient

from conftest import pgTestSettings
from db_support import executePg, fetchRowPg, fetchValPg
from lib.ServiceError import ServiceError

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


def testIsSecureRequestIgnoresForwardedProtoWhenProxyHeadersUntrusted(monkeypatch):
    from router import AuthRouter
    from starlette.requests import Request

    monkeypatch.delenv("TRUST_PROXY_HEADERS", raising=False)
    monkeypatch.delenv("ENV", raising=False)

    scope = {
        "type": "http",
        "method": "POST",
        "path": "/api/v1/auth/login",
        "headers": [(b"x-forwarded-proto", b"https")],
        "scheme": "http",
        "server": ("testserver", 80),
        "client": ("127.0.0.1", 12345),
    }
    request = Request(scope)
    assert AuthRouter.isSecureRequest(request) is False


def testIsSecureRequestTrustsForwardedProtoWhenProxyHeadersEnabled(monkeypatch):
    from router import AuthRouter
    from starlette.requests import Request

    monkeypatch.setenv("TRUST_PROXY_HEADERS", "true")
    monkeypatch.delenv("ENV", raising=False)

    scope = {
        "type": "http",
        "method": "POST",
        "path": "/api/v1/auth/login",
        "headers": [(b"x-forwarded-proto", b"https")],
        "scheme": "http",
        "server": ("testserver", 80),
        "client": ("127.0.0.1", 12345),
    }
    request = Request(scope)
    assert AuthRouter.isSecureRequest(request) is True


def testAuthenticateUserStripsPasswordFields(monkeypatch):
    import asyncio
    from service import AuthService

    storedHash = AuthService.hashPasswordPbkdf2("password123")

    class FakeDb:
        async def fetchOneQuery(self, queryName, params):
            return {
                "USER_ID": "demo@demo.demo",
                "USER_PW": storedHash,
                "USER_NM": "Demo User",
            }

    monkeypatch.setattr("service.AuthService.DB.getManager", lambda: FakeDb())

    authUser, username = asyncio.run(
        AuthService.authenticateUser({"username": "demo@demo.demo", "password": "password123"})
    )
    assert username == "demo@demo.demo"
    assert authUser is not None
    assert "userPw" not in authUser
    assert "passwordHash" not in authUser


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


def testLoginNormalizesUppercaseEmail():
    from server import app
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/login",
            json={"username": "DEMO@DEMO.DEMO", "password": "password123"},
        )
        assert response.status_code == 200
        meResponse = client.get("/api/v1/auth/me", headers=authHeaderFromCookie(client))
        assert meResponse.status_code == 200
        assert meResponse.json()["result"]["username"] == "demo@demo.demo"


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


def testAuthJsonEndpointsRejectUnknownFields():
    from server import app

    with TestClient(app) as client:
        cases = [
            ("/api/v1/auth/login", {"username": "demo@demo.demo", "password": "password123", "extra": "x"}),
            ("/api/v1/auth/signup", {"name": "Demo User", "email": f"extra-{uuid.uuid4().hex[:8]}@demo.demo", "password": "password123", "extra": "x"}),
            ("/api/v1/auth/passwordResetRequest", {"email": "demo@demo.demo", "extra": "x"}),
            ("/api/v1/auth/password-reset/request", {"email": "demo@demo.demo", "extra": "x"}),
            ("/api/v1/auth/passwordReset/request", {"email": "demo@demo.demo", "extra": "x"}),
            ("/api/v1/auth/password-reset/complete", {"token": "A" * 43, "newPassword": "password123", "extra": "x"}),
            ("/api/v1/auth/app/login", {"username": "demo@demo.demo", "password": "password123", "extra": "x"}),
            ("/api/v1/auth/app/refresh", {"refreshToken": "token", "extra": "x"}),
            ("/api/v1/auth/app/logout", {"refreshToken": "token", "extra": "x"}),
        ]

        for path, payload in cases:
            response = client.post(path, json=payload)
            assert response.status_code == 422, path
            body = response.json()
            assert body["status"] is False, path
            assert body["code"] == "AUTH_422_INVALID_INPUT", path


def testRememberMeNonBooleanStillBehavesAsFalse():
    from server import app

    with TestClient(app) as client:
        webResponse = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123", "rememberMe": "true"},
        )
        assert webResponse.status_code == 200
        assert webResponse.json()["result"]["tokenType"] == "cookie"
        refreshCookie = findCookie(webResponse.headers, "refresh_token")
        assert refreshCookie
        assert "Max-Age=" not in refreshCookie

        appResponse = client.post(
            "/api/v1/auth/app/login",
            json={"username": "demo@demo.demo", "password": "password123", "rememberMe": "true"},
        )
        assert appResponse.status_code == 200
        appBody = appResponse.json()
        assert appBody["status"] is True
        assert appBody["result"]["tokenType"] == "bearer"


def testAppLogoutAllowsEmptyBodyButRejectsUnknownFields():
    from server import app

    with TestClient(app) as client:
        emptyBodyResponse = client.post("/api/v1/auth/app/logout")
        assert emptyBodyResponse.status_code == 204

        tokenOnlyResponse = client.post(
            "/api/v1/auth/app/logout",
            json={"refreshToken": "sample-token"},
        )
        assert tokenOnlyResponse.status_code == 204

        extraFieldResponse = client.post(
            "/api/v1/auth/app/logout",
            json={"refreshToken": "sample-token", "extra": "x"},
        )
        assert extraFieldResponse.status_code == 422
        body = extraFieldResponse.json()
        assert body["status"] is False
        assert body["code"] == "AUTH_422_INVALID_INPUT"


def testAppRefreshNonStringRefreshTokenStillReturns401():
    from server import app

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/app/refresh",
            json={"refreshToken": 123},
        )
        assert response.status_code == 401
        body = response.json()
        assert body["status"] is False
        assert body["code"] == "AUTH_401_INVALID"


def testAppLogoutNonStringRefreshTokenStillSucceedsAsEmpty():
    from server import app

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/app/logout",
            json={"refreshToken": 123},
        )
        assert response.status_code == 204


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


def testPasswordResetRequestAlwaysReturnsSuccessForValidEmail():
    from server import app
    with TestClient(app) as client:
        existingResponse = client.post(
            "/api/v1/auth/password-reset/request",
            json={"email": "demo@demo.demo"},
        )
        assert existingResponse.status_code == 200
        existingBody = existingResponse.json()
        assert existingBody["status"] is True
        assert existingBody["result"]["accepted"] is True

        missingResponse = client.post(
            "/api/v1/auth/password-reset/request",
            json={"email": "missing@demo.demo"},
        )
        assert missingResponse.status_code == 200
        missingBody = missingResponse.json()
        assert missingBody["status"] is True
        assert missingBody["result"]["accepted"] is True


def testPasswordResetRequestSupportsFrontendCamelAlias():
    from server import app
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/passwordReset/request",
            json={"email": "demo@demo.demo"},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["status"] is True
        assert body["result"]["accepted"] is True


def testPasswordResetRequestSupportsSingleSegmentFrontendOperation():
    from server import app
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/passwordResetRequest",
            json={"email": "demo@demo.demo"},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["status"] is True
        assert body["result"]["accepted"] is True


def testPasswordResetCompletionInvalidatesSessionsAndPreventsReuse(monkeypatch):
    from server import app
    from service import AuthService

    captured = []

    def captureDelivery(recipient, rawToken):
        captured.append((recipient, rawToken))
        return True

    monkeypatch.setattr(AuthService, "deliverPasswordResetMail", captureDelivery)

    with TestClient(app) as client:
        otherEmail = f"other-reset-{uuid.uuid4().hex[:8]}@demo.demo"
        assert client.post(
            "/api/v1/auth/signup",
            json={"name": "Other User", "email": otherEmail, "password": "password123"},
        ).status_code == 201
        otherLogin = client.post(
            "/api/v1/auth/app/login",
            json={"username": otherEmail, "password": "password123"},
        )
        assert otherLogin.status_code == 200
        otherAccess = otherLogin.json()["result"]["accessToken"]

        oldLogin = client.post(
            "/api/v1/auth/app/login",
            json={"username": "demo@demo.demo", "password": "password123"},
        )
        assert oldLogin.status_code == 200
        oldAccess = oldLogin.json()["result"]["accessToken"]
        oldRefresh = oldLogin.json()["result"]["refreshToken"]

        requestResponse = client.post(
            "/api/v1/auth/password-reset/request",
            json={"email": "demo@demo.demo"},
        )
        assert requestResponse.status_code == 200
        assert captured and captured[0][0] == "demo@demo.demo"
        supersededToken = captured[0][1]
        assert client.post(
            "/api/v1/auth/password-reset/request",
            json={"email": "demo@demo.demo"},
        ).status_code == 200
        assert len(captured) == 2
        expiredToken = captured[1][1]
        assert client.post(
            "/api/v1/auth/password-reset/complete",
            json={"token": supersededToken, "newPassword": "new-password-123"},
        ).status_code == 400
        executePg(
            pgTestSettings,
            "UPDATE T_PASSWORD_RESET_TOKEN SET EXPIRES_AT_MS = $1 WHERE TOKEN_HASH = $2",
            0,
            AuthService.hashPasswordResetToken(expiredToken),
        )
        assert client.post(
            "/api/v1/auth/password-reset/complete",
            json={"token": expiredToken, "newPassword": "new-password-123"},
        ).status_code == 400
        assert client.post(
            "/api/v1/auth/password-reset/request",
            json={"email": "demo@demo.demo"},
        ).status_code == 200
        rawToken = captured[2][1]
        storedHash = fetchValPg(
            pgTestSettings,
            "SELECT TOKEN_HASH FROM T_PASSWORD_RESET_TOKEN WHERE USER_ID = $1 AND USED_AT_MS IS NULL",
            "demo@demo.demo",
        )
        assert storedHash == AuthService.hashPasswordResetToken(rawToken)
        assert rawToken != storedHash

        completeResponse = client.post(
            "/api/v1/auth/password-reset/complete",
            json={"token": rawToken, "newPassword": "new-password-123"},
        )
        assert completeResponse.status_code == 200
        assert completeResponse.json()["result"] == {"completed": True}
        assert "accessToken" not in completeResponse.text
        assert "refreshToken" not in completeResponse.text

        reused = client.post(
            "/api/v1/auth/password-reset/complete",
            json={"token": rawToken, "newPassword": "another-password-123"},
        )
        assert reused.status_code == 400
        assert reused.json()["code"] == "AUTH_400_RESET_INVALID_OR_EXPIRED"

        assert client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {oldAccess}"},
        ).status_code == 401
        assert client.post(
            "/api/v1/auth/app/refresh",
            json={"refreshToken": oldRefresh},
        ).status_code == 401
        assert client.post(
            "/api/v1/auth/app/login",
            json={"username": "demo@demo.demo", "password": "password123"},
        ).status_code == 401
        assert client.post(
            "/api/v1/auth/app/login",
            json={"username": "demo@demo.demo", "password": "new-password-123"},
        ).status_code == 200
        assert client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {otherAccess}"},
        ).status_code == 200


def testPasswordChangePostgresEndToEndPreservesOtherUser(monkeypatch):
    from server import app
    from service import AuthService

    runId = uuid.uuid4().hex
    targetEmail = f"rs009-target-{runId}@demo.demo"
    controlEmail = f"rs009-control-{runId}@demo.demo"
    targetOldPassword = f"rs009-old-{uuid.uuid4().hex}"
    targetNewPassword = f"rs009-new-{uuid.uuid4().hex}"
    controlPassword = f"rs009-control-{uuid.uuid4().hex}"
    resetAttemptPassword = f"rs009-reset-{uuid.uuid4().hex}"
    capturedResetTokens = {}
    refreshRotationJtis = set()

    def captureDelivery(recipient, rawToken):
        capturedResetTokens[recipient] = rawToken
        return True

    def snapshotUserAndReset(userId, tokenHash):
        row = fetchRowPg(
            pgTestSettings,
            """
            SELECT U.USER_PW AS "USER_PW"
                 , U.AUTH_VERSION AS "AUTH_VERSION"
                 , R.TOKEN_HASH AS "TOKEN_HASH"
                 , R.CREATED_AT_MS AS "CREATED_AT_MS"
                 , R.EXPIRES_AT_MS AS "EXPIRES_AT_MS"
                 , R.USED_AT_MS AS "USED_AT_MS"
              FROM T_USER U
              JOIN T_PASSWORD_RESET_TOKEN R
                ON R.USER_ID = U.USER_ID
               AND R.TOKEN_HASH = $2
             WHERE U.USER_ID = $1
            """,
            userId,
            tokenHash,
        )
        assert row is not None
        return dict(row)

    monkeypatch.setattr(AuthService, "deliverPasswordResetMail", captureDelivery)

    try:
        with TestClient(app) as client:
            for name, email, password in (
                ("RS009 Target", targetEmail, targetOldPassword),
                ("RS009 Control", controlEmail, controlPassword),
            ):
                signupResponse = client.post(
                    "/api/v1/auth/signup",
                    json={"name": name, "email": email, "password": password},
                )
                assert signupResponse.status_code == 201

            targetLogin = client.post(
                "/api/v1/auth/app/login",
                json={"username": targetEmail, "password": targetOldPassword},
            )
            assert targetLogin.status_code == 200
            targetOldAccess = targetLogin.json()["result"]["accessToken"]
            targetOldRefresh = targetLogin.json()["result"]["refreshToken"]
            targetOldRefreshPayload = AuthService.decodeRefreshTokenPayload(targetOldRefresh)
            assert targetOldRefreshPayload is not None
            targetOldRefreshJti = targetOldRefreshPayload.get("jti")
            assert isinstance(targetOldRefreshJti, str) and targetOldRefreshJti
            refreshRotationJtis.add(targetOldRefreshJti)

            controlLogin = client.post(
                "/api/v1/auth/app/login",
                json={"username": controlEmail, "password": controlPassword},
            )
            assert controlLogin.status_code == 200
            controlAccess = controlLogin.json()["result"]["accessToken"]

            for email in (targetEmail, controlEmail):
                resetResponse = client.post(
                    "/api/v1/auth/password-reset/request",
                    json={"email": email},
                )
                assert resetResponse.status_code == 200
            assert set(capturedResetTokens) == {targetEmail, controlEmail}

            targetRawResetToken = capturedResetTokens[targetEmail]
            controlRawResetToken = capturedResetTokens[controlEmail]
            targetResetHash = AuthService.hashPasswordResetToken(targetRawResetToken)
            controlResetHash = AuthService.hashPasswordResetToken(controlRawResetToken)
            targetBefore = snapshotUserAndReset(targetEmail, targetResetHash)
            controlBefore = snapshotUserAndReset(controlEmail, controlResetHash)
            assert targetBefore["USED_AT_MS"] is None
            assert controlBefore["USED_AT_MS"] is None

            wrongCurrentResponse = client.post(
                "/api/v1/auth/password-change",
                json={
                    "currentPassword": f"wrong-{uuid.uuid4().hex}",
                    "newPassword": targetNewPassword,
                },
                headers={
                    **WEB_ORIGIN_HEADERS,
                    "Authorization": f"Bearer {targetOldAccess}",
                },
            )
            assert wrongCurrentResponse.status_code == 400
            assert wrongCurrentResponse.json()["code"] == "AUTH_400_CURRENT_PASSWORD_INVALID"
            assert not findCookie(wrongCurrentResponse.headers, "access_token")
            assert not findCookie(wrongCurrentResponse.headers, "refresh_token")
            assert snapshotUserAndReset(targetEmail, targetResetHash) == targetBefore
            assert snapshotUserAndReset(controlEmail, controlResetHash) == controlBefore

            assert client.get(
                "/api/v1/auth/me",
                headers={"Authorization": f"Bearer {targetOldAccess}"},
            ).status_code == 200
            rotatedTargetSession = client.post(
                "/api/v1/auth/app/refresh",
                json={"refreshToken": targetOldRefresh},
            )
            assert rotatedTargetSession.status_code == 200
            targetPreChangeAccess = rotatedTargetSession.json()["result"]["accessToken"]
            targetPreChangeRefresh = rotatedTargetSession.json()["result"]["refreshToken"]

            successResponse = client.post(
                "/api/v1/auth/password-change",
                json={
                    "currentPassword": targetOldPassword,
                    "newPassword": targetNewPassword,
                },
                headers={
                    **WEB_ORIGIN_HEADERS,
                    "Authorization": f"Bearer {targetPreChangeAccess}",
                },
            )
            assert successResponse.status_code == 200
            successBody = successResponse.json()
            assert successBody["result"] == {"changed": True}
            assert "token" not in str(successBody).lower()
            for cookieName in ("access_token", "refresh_token"):
                expiredCookie = findCookie(successResponse.headers, cookieName)
                assert expiredCookie
                assert "max-age=0" in expiredCookie.lower()

            targetAfter = snapshotUserAndReset(targetEmail, targetResetHash)
            controlAfter = snapshotUserAndReset(controlEmail, controlResetHash)
            assert targetAfter["USER_PW"] != targetBefore["USER_PW"]
            assert isinstance(targetAfter["USER_PW"], str)
            assert targetAfter["USER_PW"].startswith("pbkdf2$")
            assert len(targetAfter["USER_PW"].split("$")) == 4
            assert targetAfter["USER_PW"] != targetNewPassword
            assert AuthService.verifyPassword(targetNewPassword, targetAfter["USER_PW"])
            assert targetAfter["AUTH_VERSION"] == targetBefore["AUTH_VERSION"] + 1
            assert targetAfter["TOKEN_HASH"] == targetBefore["TOKEN_HASH"]
            assert targetAfter["CREATED_AT_MS"] == targetBefore["CREATED_AT_MS"]
            assert targetAfter["EXPIRES_AT_MS"] == targetBefore["EXPIRES_AT_MS"]
            assert targetAfter["USED_AT_MS"] is not None
            assert controlAfter == controlBefore

            assert client.get(
                "/api/v1/auth/me",
                headers={"Authorization": f"Bearer {targetPreChangeAccess}"},
            ).status_code == 401
            rejectedRefresh = client.post(
                "/api/v1/auth/app/refresh",
                json={"refreshToken": targetPreChangeRefresh},
            )
            assert rejectedRefresh.status_code == 401
            assert client.post(
                "/api/v1/auth/app/login",
                json={"username": targetEmail, "password": targetOldPassword},
            ).status_code == 401
            rejectedReset = client.post(
                "/api/v1/auth/password-reset/complete",
                json={
                    "token": targetRawResetToken,
                    "newPassword": resetAttemptPassword,
                },
            )
            assert rejectedReset.status_code == 400
            assert rejectedReset.json()["code"] == "AUTH_400_RESET_INVALID_OR_EXPIRED"
            assert client.post(
                "/api/v1/auth/app/login",
                json={"username": targetEmail, "password": targetNewPassword},
            ).status_code == 200
            controlMe = client.get(
                "/api/v1/auth/me",
                headers={"Authorization": f"Bearer {controlAccess}"},
            )
            assert controlMe.status_code == 200
            assert controlMe.json()["result"]["username"] == controlEmail
    finally:
        if AuthService.tokenStateStoreReady:
            for refreshJti in refreshRotationJtis:
                executePg(
                    pgTestSettings,
                    """
                    DELETE FROM T_TOKEN WHERE TOKEN_JTI = $1
                       AND STATE_TP IN ($2, $3)
                    """,
                    refreshJti,
                    AuthService.TOKEN_STATE_REVOKED,
                    AuthService.TOKEN_STATE_GRACE,
                )
        for refreshJti in refreshRotationJtis:
            AuthService.revokedRefreshJtiStore.pop(refreshJti, None)
            AuthService.refreshGraceStore.pop(refreshJti, None)
        executePg(
            pgTestSettings,
            "DELETE FROM T_PASSWORD_RESET_TOKEN WHERE USER_ID IN ($1, $2)",
            targetEmail,
            controlEmail,
        )
        executePg(
            pgTestSettings,
            "DELETE FROM T_USER_LOG WHERE USER_ID IN ($1, $2)",
            targetEmail,
            controlEmail,
        )
        executePg(
            pgTestSettings,
            "DELETE FROM T_USER WHERE USER_ID IN ($1, $2)",
            targetEmail,
            controlEmail,
        )


def testOpenapiDocumentsAuthRequestContracts():
    from server import app

    app.openapi_schema = None
    with TestClient(app) as client:
        response = client.get("/openapi.json")

    assert response.status_code == 200
    schema = response.json()
    schemas = schema["components"]["schemas"]
    expectedRequestSchemas = {
        "AuthLoginRequest": {"required": ["username", "password"], "hasRememberMe": True},
        "AuthSignupRequest": {"required": ["name", "email", "password"]},
        "PasswordResetRequest": {"required": ["email"]},
        "PasswordResetCompleteRequest": {"required": ["token", "newPassword"]},
        "PasswordChangeRequest": {"required": ["currentPassword", "newPassword"]},
        "AuthAppLoginRequest": {"required": ["username", "password"], "hasRememberMe": True},
        "AuthAppRefreshRequest": {"required": ["refreshToken"]},
        "AuthAppLogoutRequest": {"required": []},
    }
    for schemaName, expectation in expectedRequestSchemas.items():
        assert schemaName in schemas
        requestSchema = schemas[schemaName]
        assert requestSchema["additionalProperties"] is False
        assert requestSchema.get("required", []) == expectation["required"]
        if expectation.get("hasRememberMe"):
            rememberMe = requestSchema["properties"]["rememberMe"]
            assert rememberMe["type"] == "boolean"
    assert "AuthSignupResult" in schemas
    assert schemas["AuthSignupResult"]["required"] == ["userId", "userNm"]
    assert "AuthSignupResponse" in schemas
    assert "PasswordResetRequestResponse" in schemas
    assert "PasswordResetCompleteResponse" in schemas
    assert schemas["PasswordChangeRequest"]["properties"] == {
        "currentPassword": {"type": "string", "minLength": 1},
        "newPassword": {"type": "string", "minLength": 8},
    }
    assert schemas["PasswordChangeResult"] == {
        "type": "object",
        "properties": {"changed": {"type": "boolean", "const": True}},
        "required": ["changed"],
        "additionalProperties": False,
    }
    assert schemas["PasswordChangeResponse"]["allOf"] == [
        {"$ref": "#/components/schemas/StandardResponse"},
        {
            "type": "object",
            "properties": {
                "result": {"$ref": "#/components/schemas/PasswordChangeResult"},
            },
        },
    ]

    requestBodyCases = {
        "/api/v1/auth/login": ("AuthLoginRequest", True),
        "/api/v1/auth/signup": ("AuthSignupRequest", True),
        "/api/v1/auth/passwordResetRequest": ("PasswordResetRequest", True),
        "/api/v1/auth/password-reset/request": ("PasswordResetRequest", True),
        "/api/v1/auth/passwordReset/request": ("PasswordResetRequest", True),
        "/api/v1/auth/password-reset/complete": ("PasswordResetCompleteRequest", True),
        "/api/v1/auth/passwordResetComplete": ("PasswordResetCompleteRequest", True),
        "/api/v1/auth/password-change": ("PasswordChangeRequest", True),
        "/api/v1/auth/app/login": ("AuthAppLoginRequest", True),
        "/api/v1/auth/app/refresh": ("AuthAppRefreshRequest", True),
        "/api/v1/auth/app/logout": ("AuthAppLogoutRequest", False),
    }
    for path, (schemaName, required) in requestBodyCases.items():
        operation = schema["paths"][path]["post"]
        requestBody = operation["requestBody"]
        assert requestBody["required"] is required
        assert requestBody["content"]["application/json"]["schema"] == {
            "$ref": f"#/components/schemas/{schemaName}"
        }

    loginOperation = schema["paths"]["/api/v1/auth/login"]["post"]
    loginResponse = loginOperation["responses"]["200"]
    assert loginResponse["content"]["application/json"]["schema"] == {
        "$ref": "#/components/schemas/AuthWebSessionResponse"
    }
    assert "Set-Cookie" in loginResponse["headers"]

    signupOperation = schema["paths"]["/api/v1/auth/signup"]["post"]
    assert "201" in signupOperation["responses"]
    assert signupOperation["responses"]["201"]["content"]["application/json"]["schema"] == {
        "$ref": "#/components/schemas/AuthSignupResponse"
    }
    assert any(param.get("$ref") == "#/components/parameters/IdempotencyKey" for param in signupOperation["parameters"])

    appLoginOperation = schema["paths"]["/api/v1/auth/app/login"]["post"]
    assert appLoginOperation["responses"]["200"]["content"]["application/json"]["schema"] == {
        "$ref": "#/components/schemas/AuthAppTokenResponse"
    }

    appRefreshOperation = schema["paths"]["/api/v1/auth/app/refresh"]["post"]
    assert appRefreshOperation["responses"]["200"]["content"]["application/json"]["schema"] == {
        "$ref": "#/components/schemas/AuthAppTokenResponse"
    }

    appLogoutOperation = schema["paths"]["/api/v1/auth/app/logout"]["post"]
    assert "204" in appLogoutOperation["responses"]

    for path in [
        "/api/v1/auth/passwordResetRequest",
        "/api/v1/auth/password-reset/request",
        "/api/v1/auth/passwordReset/request",
    ]:
        operation = schema["paths"][path]["post"]
        responseSchema = operation["responses"]["200"]["content"]["application/json"]["schema"]
        assert responseSchema == {"$ref": "#/components/schemas/PasswordResetRequestResponse"}
        samples = operation.get("x-codeSamples", [])
        assert any(
            sample.get("lang") == "JavaScript"
            and sample.get("label") == "openapi-client-axios"
            and path in sample.get("source", "")
            for sample in samples
        )

    completeOperation = schema["paths"]["/api/v1/auth/password-reset/complete"]["post"]
    assert completeOperation["responses"]["200"]["content"]["application/json"]["schema"] == {
        "$ref": "#/components/schemas/PasswordResetCompleteResponse"
    }
    assert "Set-Cookie" in completeOperation["responses"]["200"]["headers"]

    changeOperation = schema["paths"]["/api/v1/auth/password-change"]["post"]
    change200 = changeOperation["responses"]["200"]
    assert change200["content"]["application/json"]["schema"] == {
        "$ref": "#/components/schemas/PasswordChangeResponse"
    }
    assert "Set-Cookie" in change200["headers"]
    assert "Cache-Control" in change200["headers"]
    assert {"bearerAuth": []} in changeOperation["security"]
    assert {"OAuth2PasswordBearer": []} in changeOperation["security"]
    assert any(
        param.get("$ref") == "#/components/parameters/OriginHeader"
        for param in changeOperation["parameters"]
    )
    assert any(
        param.get("$ref") == "#/components/parameters/RefererHeader"
        for param in changeOperation["parameters"]
    )
    assert {"400", "401", "403", "422", "429", "500", "503"}.issubset(
        changeOperation["responses"]
    )
    assert changeOperation["responses"]["429"] == {
        "$ref": "#/components/responses/RateLimitErrorResponse"
    }
    assert "token" not in str(schemas["PasswordChangeResult"]).lower()
    assert "token" not in str(schemas["PasswordChangeResponse"]).lower()

    refreshOperation = schema["paths"]["/api/v1/auth/refresh"]["post"]
    refreshParams = refreshOperation["parameters"]
    assert any(param.get("$ref") == "#/components/parameters/OriginHeader" for param in refreshParams)
    assert any(param.get("$ref") == "#/components/parameters/RefererHeader" for param in refreshParams)

    meOperation = schema["paths"]["/api/v1/auth/me"]["get"]
    assert {"bearerAuth": []} in meOperation["security"]

    for path in requestBodyCases:
        samples = schema["paths"][path]["post"].get("x-codeSamples", [])
        assert any(
            sample.get("lang") == "JavaScript"
            and sample.get("label") == "openapi-client-axios"
            for sample in samples
        )


def testPasswordResetRequestRejectsInvalidEmail():
    from server import app
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/password-reset/request",
            json={"email": "not-an-email"},
        )
        assert response.status_code == 422
        body = response.json()
        assert body["status"] is False
        assert body["code"] == "AUTH_422_INVALID_INPUT"


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

    for index in range(3):
        ok, _ = limiter.hit(f"ip:{index}", commit=True)
        assert ok is True
    assert len(limiter.store) == 3

    nowRef["value"] = 20.0
    ok, _ = limiter.hit("ip:new", commit=True)
    assert ok is True
    assert list(limiter.store.keys()) == ["ip:new"]


def testRateLimiterReservationIsAtomicAcrossThreadsAndFinalizesExactly():
    from lib.RateLimit import RateLimiter

    limiter = RateLimiter(limit=1, windowSec=60)
    keys = (
        "auth.password_change:ip:127.0.0.1",
        "auth.password_change:user:demo@example.com",
    )
    startBarrier = Barrier(2)

    def reserveOnce():
        startBarrier.wait(timeout=5)
        return limiter.reserve(keys)

    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = [executor.submit(reserveOnce) for _ in range(2)]
        results = [future.result(timeout=5) for future in futures]

    accepted = [result for result in results if result[0] is True]
    rejected = [result for result in results if result[0] is False]
    assert len(accepted) == 1
    assert len(rejected) == 1
    assert accepted[0][2] is not None
    assert rejected[0][1] >= 1
    assert rejected[0][2] is None
    assert set(limiter.store) == set(keys)
    assert all(len(limiter.store[key]) == 1 for key in keys)

    reservationId = accepted[0][2]
    assert limiter.finalizeReservation(reservationId, keep=False) is True
    assert limiter.finalizeReservation(reservationId, keep=False) is False
    assert limiter.store == {}

    ok, retryAfter, keptReservationId = limiter.reserve(keys)
    assert (ok, retryAfter) == (True, 0)
    assert limiter.finalizeReservation(keptReservationId, keep=True) is True
    assert keptReservationId not in limiter.reservations
    assert set(limiter.store) == set(keys)
    assert all(len(limiter.store[key]) == 1 for key in keys)


def testRateLimiterReservationRejectsAllKeysWithoutPartialMutation():
    from lib.RateLimit import RateLimiter

    limiter = RateLimiter(limit=1, windowSec=60)
    ipKey = "auth.password_change:ip:127.0.0.1"
    userKey = "auth.password_change:user:demo@example.com"
    ok, _ = limiter.hit(userKey, commit=True)
    assert ok is True

    reserved, retryAfter, reservationId = limiter.reserve((ipKey, userKey))

    assert reserved is False
    assert retryAfter >= 1
    assert reservationId is None
    assert ipKey not in limiter.store
    assert len(limiter.store[userKey]) == 1
    assert limiter.reservations == {}


def testRateLimiterLimitEnvFallback(monkeypatch):
    import lib.RateLimit as rateLimitModule

    monkeypatch.setenv("AUTH_RATE_LIMIT", "abc")
    reloaded = importlib.reload(rateLimitModule)
    assert reloaded.globalRateLimiter.limit == 5


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


def testRefreshReturns503WhenTokenStateCleanupFails(monkeypatch):
    from server import app
    from service import AuthService

    class BrokenTokenStateDbManager:
        async def executeQuery(self, queryName, bindValues=None):
            if queryName == "auth.deleteExpiredTokenState":
                raise RuntimeError("cleanup failed")
            return True

    async def alwaysReadyStore():
        return True

    monkeypatch.setattr(AuthService, "ensureTokenStateStore", alwaysReadyStore)
    monkeypatch.setattr(AuthService, "getTokenStateStoreDbManager", lambda: BrokenTokenStateDbManager())

    with TestClient(app) as client:
        loginResponse = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123", "rememberMe": True},
        )
        assert loginResponse.status_code == 200

        response = client.post("/api/v1/auth/refresh", headers=WEB_ORIGIN_HEADERS)
        assert response.status_code == 503
        assert response.headers.get("Cache-Control") == "no-store"
        body = response.json()
        assert body["status"] is False
        assert body["code"] == "AUTH_503_STATE_STORE"


def testRefreshReturns503WhenTokenStateWriteFails(monkeypatch):
    from server import app
    from service import AuthService

    class BrokenTokenStateDbManager:
        async def executeQuery(self, queryName, bindValues=None):
            if queryName == "auth.deleteExpiredTokenState":
                return True
            if queryName in {"auth.insertTokenState", "auth.updateTokenState", "auth.deleteTokenState"}:
                raise RuntimeError("write failed")
            return True

        async def fetchOneQuery(self, queryName, bindValues=None):
            return None

    async def alwaysReadyStore():
        return True

    monkeypatch.setattr(AuthService, "ensureTokenStateStore", alwaysReadyStore)
    monkeypatch.setattr(AuthService, "getTokenStateStoreDbManager", lambda: BrokenTokenStateDbManager())

    with TestClient(app) as client:
        loginResponse = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123", "rememberMe": True},
        )
        assert loginResponse.status_code == 200

        response = client.post("/api/v1/auth/refresh", headers=WEB_ORIGIN_HEADERS)
        assert response.status_code == 503
        assert response.headers.get("Cache-Control") == "no-store"
        body = response.json()
        assert body["status"] is False
        assert body["code"] == "AUTH_503_STATE_STORE"


def testRefreshAutoCreatesTokenStateTableWhenMissing(monkeypatch):
    from server import app
    from service import AuthService

    executePg(pgTestSettings, "DROP TABLE IF EXISTS T_TOKEN")

    monkeypatch.setattr(AuthService, "tokenStateStoreReady", False)

    with TestClient(app) as client:
        loginResponse = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123", "rememberMe": True},
        )
        assert loginResponse.status_code == 200

        refreshResponse = client.post("/api/v1/auth/refresh", headers=WEB_ORIGIN_HEADERS)
        assert refreshResponse.status_code == 200

    tableName = fetchValPg(pgTestSettings, "SELECT to_regclass('public.t_token')")
    assert tableName is not None


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


def testLogoutReturns503WhenTokenStateCleanupFails(monkeypatch):
    from server import app
    from service import AuthService

    class BrokenTokenStateDbManager:
        async def executeQuery(self, queryName, bindValues=None):
            if queryName == "auth.deleteExpiredTokenState":
                raise RuntimeError("cleanup failed")
            return True

    async def alwaysReadyStore():
        return True

    monkeypatch.setattr(AuthService, "ensureTokenStateStore", alwaysReadyStore)
    monkeypatch.setattr(AuthService, "getTokenStateStoreDbManager", lambda: BrokenTokenStateDbManager())

    with TestClient(app) as client:
        loginResponse = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123", "rememberMe": True},
        )
        assert loginResponse.status_code == 200

        response = client.post("/api/v1/auth/logout", headers=WEB_ORIGIN_HEADERS)
        assert response.status_code == 503
        assert response.headers.get("Cache-Control") == "no-store"
        body = response.json()
        assert body["status"] is False
        assert body["code"] == "AUTH_503_STATE_STORE"


def testLogoutReturns503WhenTokenStateWriteFails(monkeypatch):
    from server import app
    from service import AuthService

    class BrokenTokenStateDbManager:
        async def executeQuery(self, queryName, bindValues=None):
            if queryName == "auth.deleteExpiredTokenState":
                return True
            if queryName in {"auth.insertTokenState", "auth.updateTokenState", "auth.deleteTokenState"}:
                raise RuntimeError("write failed")
            return True

        async def fetchOneQuery(self, queryName, bindValues=None):
            return None

    async def alwaysReadyStore():
        return True

    monkeypatch.setattr(AuthService, "ensureTokenStateStore", alwaysReadyStore)
    monkeypatch.setattr(AuthService, "getTokenStateStoreDbManager", lambda: BrokenTokenStateDbManager())

    with TestClient(app) as client:
        loginResponse = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123", "rememberMe": True},
        )
        assert loginResponse.status_code == 200

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


def testLoginRememberMeNonBooleanDoesNotPersistRefreshCookie():
    from server import app
    from lib.Auth import AuthConfig

    with TestClient(app) as client:
        for rememberValue in ["false", "0", {}, []]:
            response = client.post(
                "/api/v1/auth/login",
                json={
                    "username": "demo@demo.demo",
                    "password": "password123",
                    "rememberMe": rememberValue,
                },
            )
            assert response.status_code == 200
            refreshCookieHeader = findCookie(response.headers, AuthConfig.refreshCookieName)
            assert refreshCookieHeader
            assert "max-age" not in refreshCookieHeader.lower()


def testAppLoginRememberMeNonBooleanIssuesNonPersistentTokenPayload():
    from server import app
    from service import AuthService

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/app/login",
            json={"username": "demo@demo.demo", "password": "password123", "rememberMe": "false"},
        )
        assert response.status_code == 200
        refreshToken = response.json()["result"]["refreshToken"]
        payload = AuthService.decodeRefreshTokenPayload(refreshToken)
        assert payload is not None
        assert payload.get("remember") is False


def testRefreshDbGraceStateDoesNotPersistRawTokenPayload(monkeypatch):
    from server import app
    from lib.Auth import AuthConfig
    from service import AuthService

    capturedTokenStateParams = []

    class CapturingTokenStateDbManager:
        async def executeQuery(self, queryName, bindValues=None):
            if queryName in {"auth.insertTokenState", "auth.updateTokenState"}:
                capturedTokenStateParams.append(dict(bindValues or {}))
            return True

        async def fetchOneQuery(self, queryName, bindValues=None):
            return None

    async def alwaysReadyStore():
        return True

    AuthService.refreshGraceStore.clear()
    AuthService.revokedRefreshJtiStore.clear()
    monkeypatch.setattr(AuthConfig, "refreshGraceMs", 500)
    monkeypatch.setattr(AuthService, "ensureTokenStateStore", alwaysReadyStore)
    monkeypatch.setattr(AuthService, "getTokenStateStoreDbManager", lambda: CapturingTokenStateDbManager())

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123", "rememberMe": True},
        )
        assert response.status_code == 200

        refreshResponse = client.post("/api/v1/auth/refresh", headers=WEB_ORIGIN_HEADERS)
        assert refreshResponse.status_code == 200

    graceWrites = [
        params
        for params in capturedTokenStateParams
        if params.get("stateType") == AuthService.TOKEN_STATE_GRACE
    ]
    assert graceWrites
    assert all(params.get("tokenPayloadJson") is None for params in graceWrites)


def testRefreshTokenReuseGraceWindow(monkeypatch):
    from server import app
    from lib.Auth import AuthConfig
    from service import AuthService

    now = {"ms": 1_700_000_000_000}
    monkeypatch.setattr(AuthService, "readCurrentEpochMs", lambda: now["ms"])

    with TestClient(app) as client:
        monkeypatch.setattr(AuthConfig, "refreshGraceMs", 500)
        response = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123", "rememberMe": True},
        )
        assert response.status_code == 200
        originalRefresh = client.cookies.get("refresh_token")
        assert originalRefresh

        refreshResponse1 = client.post("/api/v1/auth/refresh", headers=WEB_ORIGIN_HEADERS)
        assert refreshResponse1.status_code == 200
        accessAfterRefresh1 = client.cookies.get("access_token")
        assert accessAfterRefresh1

        client.cookies.set("refresh_token", originalRefresh)
        now["ms"] += 100
        refreshResponse2 = client.post("/api/v1/auth/refresh", headers=WEB_ORIGIN_HEADERS)
        assert refreshResponse2.status_code == 200
        assert client.cookies.get("access_token") == accessAfterRefresh1

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

        response = client.post("/api/v1/auth/logout", headers=WEB_ORIGIN_HEADERS)
        assert response.status_code == 204

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


def testSignupIdempotencyReplayAndPayloadMismatch():
    from server import app

    with TestClient(app) as client:
        email = f"idem-{uuid.uuid4().hex[:8]}@demo.demo"
        headers = {"Idempotency-Key": f"idem-signup:{uuid.uuid4().hex}"}
        payload = {"name": "Idem User", "email": email, "password": "password123"}

        first = client.post("/api/v1/auth/signup", json=payload, headers=headers)
        assert first.status_code == 201
        firstBody = first.json()
        assert firstBody["status"] is True

        replay = client.post("/api/v1/auth/signup", json=payload, headers=headers)
        assert replay.status_code == 201
        replayBody = replay.json()
        assert replayBody["status"] is True
        assert replayBody["result"] == firstBody["result"]

        mismatch = client.post(
            "/api/v1/auth/signup",
            json={**payload, "name": "Changed User"},
            headers=headers,
        )
        assert mismatch.status_code == 409
        mismatchBody = mismatch.json()
        assert mismatchBody["status"] is False
        assert mismatchBody["code"] == "IDEMPOTENCY_409_PAYLOAD_MISMATCH"


def testSignupInvalidIdempotencyKeyReturns422():
    from server import app

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/signup",
            json={
                "name": "Invalid Idem User",
                "email": f"bad-idem-{uuid.uuid4().hex[:8]}@demo.demo",
                "password": "password123",
            },
            headers={"Idempotency-Key": "short"},
        )
        assert response.status_code == 422
        body = response.json()
        assert body["status"] is False
        assert body["code"] == "IDEMPOTENCY_422_INVALID_INPUT"


def testSignupDuplicateWithIdempotencyKeyDoesNotPoisonPendingEntry():
    from server import app

    with TestClient(app) as client:
        email = f"dup-idem-{uuid.uuid4().hex[:8]}@demo.demo"
        headers = {"Idempotency-Key": f"idem-signup-dup:{uuid.uuid4().hex}"}
        payload = {"name": "Dup User", "email": email, "password": "password123"}

        first = client.post("/api/v1/auth/signup", json=payload)
        assert first.status_code == 201

        duplicate = client.post("/api/v1/auth/signup", json=payload, headers=headers)
        assert duplicate.status_code == 409
        assert duplicate.json()["code"] == "AUTH_409_USER_EXISTS"

        retry = client.post("/api/v1/auth/signup", json=payload, headers=headers)
        assert retry.status_code == 409
        assert retry.json()["code"] == "AUTH_409_USER_EXISTS"


def testSignupDuplicateCleanupFailureDoesNotMaskOriginalConflict(monkeypatch):
    from server import app
    import lib.Idempotency as Idempotency

    async def failCancel(scopeType, idempotencyKey):
        raise RuntimeError("cleanup failed")

    monkeypatch.setattr(Idempotency, "cancelIdempotencyRequest", failCancel)

    with TestClient(app) as client:
        email = f"dup-cleanup-{uuid.uuid4().hex[:8]}@demo.demo"
        headers = {"Idempotency-Key": f"idem-signup-cleanup:{uuid.uuid4().hex}"}
        payload = {"name": "Dup User", "email": email, "password": "password123"}

        first = client.post("/api/v1/auth/signup", json=payload)
        assert first.status_code == 201

        duplicate = client.post("/api/v1/auth/signup", json=payload, headers=headers)
        assert duplicate.status_code == 409
        body = duplicate.json()
        assert body["status"] is False
        assert body["code"] == "AUTH_409_USER_EXISTS"


def testLoginDbBackendNotRunningReturns503(monkeypatch):
    from server import app
    from service import AuthService

    class FakeDb:
        async def fetchOneQuery(self, queryName, bindValues=None):
            raise ServiceError("DB_NOT_READY")

    monkeypatch.setattr(AuthService.DB, "getManager", lambda: FakeDb())

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "password123"},
        )
        assert response.status_code == 503
        body = response.json()
        assert body["status"] is False
        assert body["code"] == "AUTH_503_DB_NOT_READY"


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
