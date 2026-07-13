import asyncio
from configparser import ConfigParser
from datetime import datetime, timedelta, timezone
import hashlib

import pytest
from fastapi import HTTPException
from jose import JWTError, jwt
from starlette.requests import Request

from lib.ServiceError import ServiceError
from lib.Auth import (
    ACCESS_TOKEN_EXPIRE_MAX_MINUTES,
    AUTH_CLOCK_SKEW_SECONDS,
    REFRESH_TOKEN_EXPIRE_MAX_MINUTES,
    AuthConfig,
    createAccessToken,
    createRefreshToken,
    decodeAuthToken,
    getCurrentUser,
    parseAuthExpireSeconds,
    resolveAuthRuntimePolicy,
    validateAuthExpireMinutes,
)
from service import AuthService


STRONG_SECRET = "Auth-Core-Strong-Secret-For-Tests-2026!"


def makeRequest() -> Request:
    return Request(
        {
            "type": "http",
            "method": "GET",
            "path": "/api/v1/auth/me",
            "headers": [],
            "scheme": "http",
            "server": ("testserver", 80),
            "client": ("127.0.0.1", 12345),
        }
    )


def configureTestAuth(*, tokenEnable: bool = True) -> None:
    AuthConfig.initConfig(
        secretKey=STRONG_SECRET,
        accessExpireMinutes=60,
        refreshExpireMinutes=7 * 24 * 60,
        tokenEnable=tokenEnable,
        runtime="TEST",
    )


def validPayload(tokenType: str) -> dict:
    now = datetime.now(timezone.utc)
    return {
        "sub": "user@example.com",
        "jti": "test-jti",
        "typ": tokenType,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=5)).timestamp()),
    }


def encodePayload(payload: dict) -> str:
    return jwt.encode(payload, STRONG_SECRET, algorithm=AuthConfig.algorithm)


@pytest.mark.parametrize("runtime", ["TEST", "test", "CI", " ci "])
def testTestAndCiMayDisableTokenAuthentication(runtime):
    normalizedRuntime, strictSecretValidation = resolveAuthRuntimePolicy(
        runtime=runtime,
        tokenEnable=False,
    )
    assert normalizedRuntime in {"TEST", "CI"}
    assert strictSecretValidation is False

    AuthConfig.initConfig(
        secretKey="test-secret-key",
        tokenEnable=False,
        runtime=runtime,
    )
    tokenData = asyncio.run(getCurrentUser(makeRequest(), None))
    assert tokenData.username == "anonymous"


@pytest.mark.parametrize("runtime", ["DEV", "STAGING", "PROD", "production", ""])
def testNonTestRuntimeRejectsDisabledTokenAuthentication(runtime):
    with pytest.raises(ValueError, match="token_enable=false"):
        AuthConfig.initConfig(
            secretKey=STRONG_SECRET,
            tokenEnable=False,
            runtime=runtime,
        )


def testDisabledTokenDefenseInDepthRejectsNonTestState():
    AuthConfig.tokenEnable = False
    AuthConfig.runtime = "PROD"
    with pytest.raises(HTTPException) as raised:
        asyncio.run(getCurrentUser(makeRequest(), None))
    assert raised.value.status_code == 500


@pytest.mark.parametrize("runtime", ["DEV", "STAGING", "PROD"])
def testWeakSecretOverrideRejectedOutsideTestAndCi(runtime):
    with pytest.raises(ValueError, match="ALLOW_WEAK_AUTH_SECRET"):
        AuthConfig.initConfig(
            secretKey="test-secret-key",
            runtime=runtime,
            allowWeakAuthSecret=True,
        )


@pytest.mark.parametrize("runtime", ["TEST", "CI"])
def testWeakSecretAllowedInTestAndCi(runtime):
    AuthConfig.initConfig(
        secretKey="test-secret-key",
        runtime=runtime,
        allowWeakAuthSecret=True,
    )
    assert AuthConfig.strictSecretValidation is False


@pytest.mark.parametrize("claim", ["exp", "iat", "jti", "sub", "typ"])
@pytest.mark.parametrize("tokenType", ["access", "refresh"])
def testAccessAndRefreshRequireEveryAuthClaim(claim, tokenType):
    configureTestAuth()
    payload = validPayload(tokenType)
    payload.pop(claim)
    token = encodePayload(payload)

    if tokenType == "access":
        with pytest.raises(JWTError):
            decodeAuthToken(token, expectedTokenType="access")
    else:
        assert AuthService.decodeRefreshTokenPayload(token) is None


@pytest.mark.parametrize("claim", ["sub", "jti"])
@pytest.mark.parametrize("value", ["", "   ", None, 123])
@pytest.mark.parametrize("tokenType", ["access", "refresh"])
def testAccessAndRefreshRejectInvalidIdentityClaims(claim, value, tokenType):
    configureTestAuth()
    payload = validPayload(tokenType)
    payload[claim] = value
    token = encodePayload(payload)

    if tokenType == "access":
        with pytest.raises(JWTError):
            decodeAuthToken(token, expectedTokenType="access")
    else:
        assert AuthService.decodeRefreshTokenPayload(token) is None


@pytest.mark.parametrize(
    ("issuedType", "expectedType"),
    [("access", "refresh"), ("refresh", "access"), ("other", "access")],
)
def testJwtTypeMustMatchExpectedType(issuedType, expectedType):
    configureTestAuth()
    with pytest.raises(JWTError):
        decodeAuthToken(
            encodePayload(validPayload(issuedType)),
            expectedTokenType=expectedType,
        )


@pytest.mark.parametrize("tokenType", ["access", "refresh"])
def testJwtRejectsIatBeyondClockSkew(tokenType):
    configureTestAuth()
    payload = validPayload(tokenType)
    payload["iat"] = int(
        (datetime.now(timezone.utc) + timedelta(seconds=AUTH_CLOCK_SKEW_SECONDS + 5)).timestamp()
    )
    token = encodePayload(payload)

    if tokenType == "access":
        with pytest.raises(JWTError):
            decodeAuthToken(token, expectedTokenType="access")
    else:
        assert AuthService.decodeRefreshTokenPayload(token) is None


def testIssuedAccessAndRefreshTokensRemainValid():
    configureTestAuth()
    accessToken = createAccessToken({"sub": " user@example.com "})
    refreshToken = createRefreshToken({"sub": " user@example.com "})

    accessPayload = decodeAuthToken(
        accessToken.accessToken,
        expectedTokenType="access",
    )
    refreshPayload = AuthService.decodeRefreshTokenPayload(refreshToken.accessToken)

    assert accessPayload["sub"] == "user@example.com"
    assert refreshPayload is not None
    assert refreshPayload["sub"] == "user@example.com"
    assert accessPayload["authVersion"] == 0
    assert refreshPayload["authVersion"] == 0


@pytest.mark.parametrize("value", [True, -1, "1", 1.5])
def testJwtRejectsInvalidAuthVersionClaim(value):
    configureTestAuth()
    payload = validPayload("access")
    payload["authVersion"] = value
    with pytest.raises(JWTError):
        decodeAuthToken(encodePayload(payload), expectedTokenType="access")


def testAccessAuthVersionInvalidatesOnlyChangedUser(monkeypatch):
    configureTestAuth()
    versions = {"changed@example.com": 2, "other@example.com": 0}

    class FakeDb:
        async def fetchOneQuery(self, queryName, values):
            return {"authVersion": versions.get(values["userId"], 0)}

    monkeypatch.setattr("lib.Auth.DB.getManager", lambda: FakeDb())
    oldToken = createAccessToken({"sub": "changed@example.com", "authVersion": 1})
    otherToken = createAccessToken({"sub": "other@example.com", "authVersion": 0})

    with pytest.raises(HTTPException) as rejected:
        asyncio.run(getCurrentUser(makeRequest(), oldToken.accessToken))
    assert rejected.value.status_code == 401
    accepted = asyncio.run(getCurrentUser(makeRequest(), otherToken.accessToken))
    assert accepted.username == "other@example.com"


def testRefreshAuthVersionInvalidatesOnlyChangedUser(monkeypatch):
    configureTestAuth()
    versions = {"changed@example.com": 2, "other@example.com": 0}

    class FakeDb:
        async def fetchOneQuery(self, queryName, values):
            assert queryName == "auth.userAuthVersion"
            return {"authVersion": versions.get(values["userId"], 0)}

    async def skipStateCleanup(_nowMs):
        return False

    monkeypatch.setattr(AuthService.DB, "getManager", lambda: FakeDb())
    monkeypatch.setattr(AuthService, "cleanupTokenStateStore", skipStateCleanup)
    AuthService.revokedRefreshJtiStore.clear()
    AuthService.refreshGraceStore.clear()
    changedToken = createRefreshToken(
        {"sub": "changed@example.com", "authVersion": 1, "remember": False}
    )
    otherToken = createRefreshToken(
        {"sub": "other@example.com", "authVersion": 0, "remember": False}
    )

    assert asyncio.run(AuthService.refresh(changedToken.accessToken)) is None
    refreshed = asyncio.run(AuthService.refresh(otherToken.accessToken))
    assert refreshed is not None
    assert refreshed["accessToken"]
    refreshedPayload = decodeAuthToken(
        refreshed["accessToken"], expectedTokenType="access"
    )
    assert refreshedPayload["authVersion"] == 0


def testPasswordResetRequestUsesHashOnlyAndKeepsGenericResult(monkeypatch):
    scheduled = []

    async def forbiddenDbWork(*_args, **_kwargs):
        raise AssertionError("request response path must not await account DB work")

    monkeypatch.setattr(AuthService, "createPasswordResetTokenInTransaction", forbiddenDbWork)

    existing = asyncio.run(
        AuthService.requestPasswordReset(
            {"email": "exists@example.com"},
            processingScheduler=lambda email: scheduled.append(email),
        )
    )
    missing = asyncio.run(
        AuthService.requestPasswordReset(
            {"email": "missing@example.com"},
            processingScheduler=lambda email: scheduled.append(email),
        )
    )

    assert existing == ({"accepted": True}, None)
    assert missing == ({"accepted": True}, None)
    assert scheduled == ["exists@example.com", "missing@example.com"]


def testPasswordResetBackgroundProcessorHashesAndThreadsDelivery(monkeypatch):
    captured = []
    threadCalls = []
    auditCalls = []

    async def fakeCreate(email, tokenHash, createdAtMs, expiresAtMs):
        captured.append((email, tokenHash, createdAtMs, expiresAtMs))
        return email

    def fakeDelivery(recipient, rawToken):
        captured.append((recipient, rawToken))
        return True

    async def fakeToThread(function, *args):
        threadCalls.append((function, args))
        return function(*args)

    monkeypatch.setattr(AuthService, "createPasswordResetTokenInTransaction", fakeCreate)
    monkeypatch.setattr(AuthService, "deliverPasswordResetMail", fakeDelivery)
    monkeypatch.setattr(AuthService.asyncio, "to_thread", fakeToThread)
    monkeypatch.setattr(AuthService, "readCurrentEpochMs", lambda: 1_000)
    monkeypatch.setattr(
        AuthService,
        "auditLog",
        lambda event, username, success, meta=None: auditCalls.append(
            (event, username, success, meta)
        ),
    )

    asyncio.run(AuthService.processPasswordResetRequest("exists@example.com"))
    rawToken = captured[1][1]
    assert len(rawToken) == 43
    assert captured[0][1] == hashlib.sha256(rawToken.encode()).hexdigest()
    assert captured[0][3] - captured[0][2] == AuthService.PASSWORD_RESET_TOKEN_TTL_MS
    assert len(threadCalls) == 1
    assert auditCalls[-1] == (
        "auth.password_reset.delivery",
        "exists@example.com",
        True,
        {"delivery": "sent"},
    )


def testPasswordResetCompleteValidationAndOneTimeResult(monkeypatch):
    rawToken = "A" * 43
    seen = []

    async def fakeComplete(tokenHash, newPassword, nowMs):
        seen.append((tokenHash, newPassword, nowMs))
        return len(seen) == 1

    monkeypatch.setattr(AuthService, "completePasswordResetInTransaction", fakeComplete)
    monkeypatch.setattr(AuthService, "readCurrentEpochMs", lambda: 2_000)
    first = asyncio.run(
        AuthService.completePasswordReset({"token": rawToken, "newPassword": "newpassword123"})
    )
    reused = asyncio.run(
        AuthService.completePasswordReset({"token": rawToken, "newPassword": "newpassword123"})
    )
    short = asyncio.run(
        AuthService.completePasswordReset({"token": rawToken, "newPassword": "short"})
    )

    assert first == ({"completed": True}, None)
    assert reused == (None, "AUTH_400_RESET_INVALID_OR_EXPIRED")
    assert short == (None, "AUTH_422_INVALID_INPUT")
    assert seen[0][0] == hashlib.sha256(rawToken.encode()).hexdigest()
    assert rawToken not in repr(seen)


def testPasswordChangeValidatesExactPayloadBeforeTransaction(monkeypatch):
    async def forbiddenChange(*_args, **_kwargs):
        raise AssertionError("invalid input must not start password change transaction")

    monkeypatch.setattr(AuthService, "changePasswordInTransaction", forbiddenChange)
    invalidCases = [
        (None, {"currentPassword": "current-password", "newPassword": "new-password"}),
        ("", {"currentPassword": "current-password", "newPassword": "new-password"}),
        ("user@example.com", None),
        ("user@example.com", {"currentPassword": "", "newPassword": "new-password"}),
        ("user@example.com", {"currentPassword": "current-password", "newPassword": "short"}),
        (
            "user@example.com",
            {"currentPassword": "current-password", "newPassword": "new-password", "extra": True},
        ),
    ]

    for userId, payload in invalidCases:
        result = asyncio.run(AuthService.changePassword(userId, payload))
        assert result == (None, "AUTH_422_INVALID_INPUT")


def testPasswordChangeRejectsEqualNewPasswordBeforeTransaction(monkeypatch):
    transactionCalls = []

    async def forbiddenChange(*args, **_kwargs):
        transactionCalls.append(args)
        raise AssertionError("equal passwords must not start a transaction")

    monkeypatch.setattr(AuthService, "changePasswordInTransaction", forbiddenChange)
    password = "same-password-123"

    result = asyncio.run(
        AuthService.changePassword(
            "user@example.com",
            {"currentPassword": password, "newPassword": password},
        )
    )

    assert result == (None, "AUTH_422_INVALID_INPUT")
    assert transactionCalls == []
    assert password not in repr(result)


def testPasswordChangeMismatchPerformsNoMutation(monkeypatch):
    class TxContext:
        async def __aenter__(self):
            return self

        async def __aexit__(self, excType, exc, traceback):
            return None

    class FakeDatabase:
        def transaction(self, **_options):
            return TxContext()

    class FakeManager:
        def __init__(self):
            self.database = FakeDatabase()
            self.calls = []
            self.currentHash = AuthService.hashPasswordPbkdf2("actual-current-password")

        async def fetchOneQuery(self, queryName, values):
            self.calls.append(("fetch", queryName, values))
            if queryName == "auth.userForPasswordChange":
                return {"userId": values["userId"], "userPw": self.currentHash}
            raise AssertionError("password mismatch must not update the user")

        async def executeQuery(self, queryName, values):
            raise AssertionError("password mismatch must not supersede reset tokens")

    manager = FakeManager()
    monkeypatch.setitem(AuthService.DB.dbManagers, "main_db", manager)
    AuthService.DB.setPrimaryDbName("main_db")

    changed = asyncio.run(
        AuthService.changePasswordInTransaction(
            "user@example.com",
            "wrong-current-password",
            "new-password-123",
            1_000,
        )
    )

    assert changed is False
    assert manager.calls == [
        ("fetch", "auth.userForPasswordChange", {"userId": "user@example.com"})
    ]


def testPasswordChangeSuccessUpdatesVersionThenSupersedesResetTokens(monkeypatch):
    class TxContext:
        async def __aenter__(self):
            return self

        async def __aexit__(self, excType, exc, traceback):
            return None

    class FakeDatabase:
        def transaction(self, **_options):
            return TxContext()

    class FakeManager:
        def __init__(self):
            self.database = FakeDatabase()
            self.calls = []
            self.currentHash = AuthService.hashPasswordPbkdf2("current-password")
            self.newHash = None

        async def fetchOneQuery(self, queryName, values):
            self.calls.append(queryName)
            if queryName == "auth.userForPasswordChange":
                return {"userId": values["userId"], "userPw": self.currentHash}
            if queryName == "auth.updatePasswordAndAuthVersion":
                self.newHash = values["userPw"]
                return {"authVersion": 2}
            raise AssertionError(queryName)

        async def executeQuery(self, queryName, values):
            self.calls.append(queryName)
            assert queryName == "auth.supersedePasswordResetTokens"
            assert values == {"userId": "user@example.com", "usedAtMs": 2_000}
            return True

    manager = FakeManager()
    monkeypatch.setitem(AuthService.DB.dbManagers, "main_db", manager)
    AuthService.DB.setPrimaryDbName("main_db")

    changed = asyncio.run(
        AuthService.changePasswordInTransaction(
            "user@example.com",
            "current-password",
            "new-password-123",
            2_000,
        )
    )

    assert changed is True
    assert manager.calls == [
        "auth.userForPasswordChange",
        "auth.updatePasswordAndAuthVersion",
        "auth.supersedePasswordResetTokens",
    ]
    assert manager.newHash != manager.currentHash
    assert AuthService.verifyPassword("new-password-123", manager.newHash)


def testPasswordChangeSupersedeFailureRollsBackPasswordAndAuthVersion(monkeypatch):
    class TxContext:
        def __init__(self, manager):
            self.manager = manager
            self.snapshot = None

        async def __aenter__(self):
            self.snapshot = (
                self.manager.currentHash,
                self.manager.authVersion,
                self.manager.resetTokenUsedAt,
            )
            return self

        async def __aexit__(self, excType, exc, traceback):
            if excType is not None:
                (
                    self.manager.currentHash,
                    self.manager.authVersion,
                    self.manager.resetTokenUsedAt,
                ) = self.snapshot
            return False

    class FakeDatabase:
        def __init__(self, manager):
            self.manager = manager

        def transaction(self, **_options):
            return TxContext(self.manager)

    class FakeManager:
        def __init__(self):
            self.currentHash = AuthService.hashPasswordPbkdf2("current-password")
            self.authVersion = 7
            self.resetTokenUsedAt = None
            self.calls = []
            self.database = FakeDatabase(self)

        async def fetchOneQuery(self, queryName, values):
            self.calls.append(queryName)
            if queryName == "auth.userForPasswordChange":
                return {"userId": values["userId"], "userPw": self.currentHash}
            if queryName == "auth.updatePasswordAndAuthVersion":
                self.currentHash = values["userPw"]
                self.authVersion += 1
                return {"authVersion": self.authVersion}
            raise AssertionError(queryName)

        async def executeQuery(self, queryName, values):
            self.calls.append(queryName)
            assert queryName == "auth.supersedePasswordResetTokens"
            self.resetTokenUsedAt = values["usedAtMs"]
            raise RuntimeError("reset token supersession failed")

    manager = FakeManager()
    originalHash = manager.currentHash
    monkeypatch.setitem(AuthService.DB.dbManagers, "main_db", manager)
    AuthService.DB.setPrimaryDbName("main_db")

    with pytest.raises(RuntimeError, match="reset token supersession failed"):
        asyncio.run(
            AuthService.changePasswordInTransaction(
                "user@example.com",
                "current-password",
                "new-password-123",
                3_000,
            )
        )

    assert manager.calls == [
        "auth.userForPasswordChange",
        "auth.updatePasswordAndAuthVersion",
        "auth.supersedePasswordResetTokens",
    ]
    assert manager.currentHash == originalHash
    assert AuthService.verifyPassword("current-password", manager.currentHash)
    assert not AuthService.verifyPassword("new-password-123", manager.currentHash)
    assert manager.authVersion == 7
    assert manager.resetTokenUsedAt is None


def testPasswordChangeConcurrentSameCurrentPasswordAllowsOnlyOneSuccess(monkeypatch):
    class TxContext:
        def __init__(self, lock):
            self.lock = lock

        async def __aenter__(self):
            await self.lock.acquire()
            return self

        async def __aexit__(self, excType, exc, traceback):
            self.lock.release()
            return False

    class FakeDatabase:
        def __init__(self, lock):
            self.lock = lock

        def transaction(self, **_options):
            return TxContext(self.lock)

    class FakeManager:
        def __init__(self, lock):
            self.database = FakeDatabase(lock)
            self.currentHash = AuthService.hashPasswordPbkdf2("current-password")
            self.authVersion = 0
            self.supersedeCount = 0

        async def fetchOneQuery(self, queryName, values):
            if queryName == "auth.userForPasswordChange":
                return {"userId": values["userId"], "userPw": self.currentHash}
            if queryName == "auth.updatePasswordAndAuthVersion":
                self.currentHash = values["userPw"]
                self.authVersion += 1
                return {"authVersion": self.authVersion}
            raise AssertionError(queryName)

        async def executeQuery(self, queryName, values):
            assert queryName == "auth.supersedePasswordResetTokens"
            assert values["userId"] == "user@example.com"
            self.supersedeCount += 1
            return True

    async def runConcurrent():
        manager = FakeManager(asyncio.Lock())
        monkeypatch.setitem(AuthService.DB.dbManagers, "main_db", manager)
        AuthService.DB.setPrimaryDbName("main_db")
        results = await asyncio.gather(
            AuthService.changePasswordInTransaction(
                "user@example.com",
                "current-password",
                "new-password-a",
                4_000,
            ),
            AuthService.changePasswordInTransaction(
                "user@example.com",
                "current-password",
                "new-password-b",
                4_001,
            ),
        )
        return manager, results

    manager, results = asyncio.run(runConcurrent())

    assert sorted(results) == [False, True]
    assert manager.authVersion == 1
    assert manager.supersedeCount == 1
    finalMatches = [
        AuthService.verifyPassword(candidate, manager.currentHash)
        for candidate in ("new-password-a", "new-password-b")
    ]
    assert finalMatches.count(True) == 1


def testPasswordChangeMapsDbNotReadyAndAuditsWithoutPlaintext(monkeypatch):
    async def dbNotReady(*_args, **_kwargs):
        raise ServiceError("AUTH_503_DB_NOT_READY")

    monkeypatch.setattr(AuthService, "changePasswordInTransaction", dbNotReady)
    unavailable = asyncio.run(
        AuthService.changePassword(
            "user@example.com",
            {"currentPassword": "current-secret", "newPassword": "new-secret-123"},
        )
    )
    assert unavailable == (None, "AUTH_503_DB_NOT_READY")

    auditCalls = []

    async def changed(*_args, **_kwargs):
        return True

    monkeypatch.setattr(AuthService, "changePasswordInTransaction", changed)
    monkeypatch.setattr(
        AuthService,
        "auditLog",
        lambda event, username, success, meta=None: auditCalls.append(
            (event, username, success, meta)
        ),
    )
    success = asyncio.run(
        AuthService.changePassword(
            "user@example.com",
            {"currentPassword": "current-secret", "newPassword": "new-secret-123"},
        )
    )

    assert success == ({"changed": True}, None)
    assert auditCalls == [
        ("auth.password_change", "user@example.com", True, {"changed": True})
    ]
    assert "current-secret" not in repr(auditCalls)
    assert "new-secret-123" not in repr(auditCalls)


def testPasswordResetConditionalConsumeAllowsOnlyOneConcurrentCompletion(monkeypatch):
    class TxContext:
        def __init__(self, lock):
            self.lock = lock

        async def __aenter__(self):
            await self.lock.acquire()
            return self

        async def __aexit__(self, excType, exc, traceback):
            self.lock.release()

    class FakeDatabase:
        def __init__(self, lock):
            self.lock = lock

        def transaction(self, **_options):
            return TxContext(self.lock)

    class FakeManager:
        def __init__(self, lock):
            self.database = FakeDatabase(lock)
            self.used = False
            self.authVersion = 0
            self.calls = []

        async def fetchOneQuery(self, queryName, values):
            self.calls.append(queryName)
            if queryName == "auth.passwordResetTokenOwner":
                return None if self.used else {"userId": "user@example.com"}
            if queryName == "auth.userForPasswordResetById":
                return {"userId": values["userId"]}
            if queryName == "auth.consumePasswordResetToken":
                if self.used:
                    return None
                self.used = True
                return {"userId": "user@example.com"}
            if queryName == "auth.updatePasswordAndAuthVersion":
                self.authVersion += 1
                assert values["userPw"].startswith("pbkdf2$")
                return {"authVersion": self.authVersion}
            raise AssertionError(queryName)

    async def runConcurrent():
        manager = FakeManager(asyncio.Lock())
        monkeypatch.setitem(AuthService.DB.dbManagers, "main_db", manager)
        AuthService.DB.setPrimaryDbName("main_db")
        return manager, await asyncio.gather(
            AuthService.completePasswordResetInTransaction("a" * 64, "newpassword123", 1000),
            AuthService.completePasswordResetInTransaction("a" * 64, "newpassword123", 1000),
        )

    manager, results = asyncio.run(runConcurrent())
    assert sorted(results) == [False, True]
    assert manager.authVersion == 1
    assert manager.calls[:4] == [
        "auth.passwordResetTokenOwner",
        "auth.userForPasswordResetById",
        "auth.consumePasswordResetToken",
        "auth.updatePasswordAndAuthVersion",
    ]


def testPasswordResetConcurrentRequestsLeaveOnlyLatestTokenActive(monkeypatch):
    class TxContext:
        def __init__(self, lock):
            self.lock = lock

        async def __aenter__(self):
            await self.lock.acquire()

        async def __aexit__(self, excType, exc, traceback):
            self.lock.release()

    class FakeDatabase:
        def __init__(self, lock):
            self.lock = lock

        def transaction(self, **_options):
            return TxContext(self.lock)

    class FakeManager:
        def __init__(self, lock):
            self.database = FakeDatabase(lock)
            self.active = None
            self.superseded = []

        async def fetchOneQuery(self, queryName, values):
            assert queryName == "auth.userForPasswordReset"
            return {"userId": values["email"], "userEml": values["email"]}

        async def executeQuery(self, queryName, values):
            if queryName == "auth.supersedePasswordResetTokens":
                if self.active:
                    self.superseded.append(self.active)
                self.active = None
                return True
            if queryName == "auth.insertPasswordResetToken":
                assert len(values["tokenHash"]) == 64
                self.active = values["tokenHash"]
                return True
            raise AssertionError(queryName)

    async def runConcurrent():
        manager = FakeManager(asyncio.Lock())
        monkeypatch.setitem(AuthService.DB.dbManagers, "main_db", manager)
        AuthService.DB.setPrimaryDbName("main_db")
        results = await asyncio.gather(
            AuthService.createPasswordResetTokenInTransaction(
                "user@example.com", "a" * 64, 1000, 2000
            ),
            AuthService.createPasswordResetTokenInTransaction(
                "user@example.com", "b" * 64, 1001, 2001
            ),
        )
        return manager, results

    manager, results = asyncio.run(runConcurrent())
    assert results == ["user@example.com", "user@example.com"]
    assert manager.active in {"a" * 64, "b" * 64}
    assert manager.superseded == [({"a" * 64, "b" * 64} - {manager.active}).pop()]


def testPasswordResetRequestAndCompletionRaceFinishesWithoutDeadlock(monkeypatch):
    oldHash = "a" * 64
    newHash = "b" * 64

    class TxContext:
        def __init__(self, lock):
            self.lock = lock

        async def __aenter__(self):
            await self.lock.acquire()

        async def __aexit__(self, excType, exc, traceback):
            self.lock.release()

    class FakeDatabase:
        def __init__(self, lock):
            self.lock = lock

        def transaction(self, **_options):
            return TxContext(self.lock)

    class FakeManager:
        def __init__(self, lock):
            self.database = FakeDatabase(lock)
            self.active = oldHash
            self.used = False
            self.authVersion = 0

        async def fetchOneQuery(self, queryName, values):
            if queryName == "auth.userForPasswordReset":
                return {"userId": values["email"], "userEml": values["email"]}
            if queryName == "auth.passwordResetTokenOwner":
                if values["tokenHash"] == self.active and not self.used:
                    return {"userId": "user@example.com"}
                return None
            if queryName == "auth.userForPasswordResetById":
                return {"userId": values["userId"]}
            if queryName == "auth.consumePasswordResetToken":
                if values["tokenHash"] != self.active or self.used:
                    return None
                self.used = True
                return {"userId": "user@example.com"}
            if queryName == "auth.updatePasswordAndAuthVersion":
                self.authVersion += 1
                return {"authVersion": self.authVersion}
            raise AssertionError(queryName)

        async def executeQuery(self, queryName, values):
            if queryName == "auth.supersedePasswordResetTokens":
                self.used = True
                return True
            if queryName == "auth.insertPasswordResetToken":
                self.active = values["tokenHash"]
                self.used = False
                return True
            raise AssertionError(queryName)

    async def runRace():
        manager = FakeManager(asyncio.Lock())
        monkeypatch.setitem(AuthService.DB.dbManagers, "main_db", manager)
        AuthService.DB.setPrimaryDbName("main_db")
        results = await asyncio.wait_for(
            asyncio.gather(
                AuthService.completePasswordResetInTransaction(
                    oldHash, "newpassword123", 1000
                ),
                AuthService.createPasswordResetTokenInTransaction(
                    "user@example.com", newHash, 1001, 2001
                ),
            ),
            timeout=1,
        )
        return manager, results

    manager, results = asyncio.run(runRace())
    assert results[0] in {True, False}
    assert results[1] == "user@example.com"
    assert manager.active == newHash
    assert manager.used is False


def testPasswordResetMailUsesFixedOriginAndInjectedSender():
    from lib import PasswordResetMail

    config = ConfigParser(interpolation=None)
    config.read_dict(
        {
            "PASSWORD_RESET": {
                "enabled": "true",
                "public_origin": "https://web.example.com",
                "smtp_host": "smtp.example.com",
                "from_address": "no-reply@example.com",
            }
        }
    )
    PasswordResetMail.configurePasswordResetMail(config, runtime="PROD")
    sent = []

    class CaptureSender:
        def send(self, recipient, resetLink):
            sent.append((recipient, resetLink))

    PasswordResetMail.setPasswordResetSender(CaptureSender())
    rawToken = "B+/ ?="
    assert PasswordResetMail.sendPasswordReset("user@example.com", rawToken) is True
    assert sent == [
        (
            "user@example.com",
            "https://web.example.com/reset-password#token=B%2B%2F+%3F%3D",
        )
    ]


def testPasswordResetSmtpUsesExplicitDefaultSslContext(monkeypatch):
    from lib import PasswordResetMail

    tlsContext = object()
    calls = []

    class FakeSmtp:
        def __init__(self, **kwargs):
            calls.append(("init", kwargs))

        def __enter__(self):
            return self

        def __exit__(self, excType, exc, traceback):
            return False

        def starttls(self, *, context):
            calls.append(("starttls", context))

        def send_message(self, _message):
            calls.append(("send", True))

    monkeypatch.setattr(PasswordResetMail.ssl, "create_default_context", lambda: tlsContext)
    monkeypatch.setattr(PasswordResetMail.smtplib, "SMTP", FakeSmtp)
    sender = PasswordResetMail.SmtpPasswordResetSender(
        PasswordResetMail.PasswordResetMailConfig(
            enabled=True,
            publicOrigin="https://web.example.com",
            smtpHost="smtp.example.com",
            fromAddress="no-reply@example.com",
            useTls=True,
        )
    )
    sender.send("user@example.com", "https://web.example.com/reset-password?token=safe")
    assert calls[0] == (
        "init",
        {"host": "smtp.example.com", "port": 587, "timeout": 10},
    )
    assert ("starttls", tlsContext) in calls

    calls.clear()
    monkeypatch.setattr(PasswordResetMail.smtplib, "SMTP_SSL", FakeSmtp)
    sslSender = PasswordResetMail.SmtpPasswordResetSender(
        PasswordResetMail.PasswordResetMailConfig(
            enabled=True,
            publicOrigin="https://web.example.com",
            smtpHost="smtp.example.com",
            fromAddress="no-reply@example.com",
            useTls=False,
            useSsl=True,
        )
    )
    sslSender.send("user@example.com", "https://web.example.com/reset-password?token=safe")
    assert calls[0] == (
        "init",
        {
            "host": "smtp.example.com",
            "port": 587,
            "timeout": 10,
            "context": tlsContext,
        },
    )


def testPasswordResetBackgroundAuditCoversDisabledAndFailureWithoutToken(monkeypatch):
    auditCalls = []
    logCalls = []

    async def fakeCreate(email, tokenHash, createdAtMs, expiresAtMs):
        return email

    async def disabledToThread(_function, *_args):
        return False

    monkeypatch.setattr(AuthService, "createPasswordResetTokenInTransaction", fakeCreate)
    monkeypatch.setattr(AuthService.asyncio, "to_thread", disabledToThread)
    monkeypatch.setattr(
        AuthService,
        "auditLog",
        lambda event, username, success, meta=None: auditCalls.append(
            (event, username, success, meta)
        ),
    )
    monkeypatch.setattr(AuthService.logger, "error", lambda *args, **kwargs: logCalls.append(args))
    asyncio.run(AuthService.processPasswordResetRequest("user@example.com"))
    assert auditCalls[-1][2:] == (True, {"delivery": "disabled"})

    async def failedToThread(_function, *_args):
        raise RuntimeError("provider detail must stay private")

    monkeypatch.setattr(AuthService.asyncio, "to_thread", failedToThread)
    asyncio.run(AuthService.processPasswordResetRequest("user@example.com"))
    assert auditCalls[-1][2] is False
    assert auditCalls[-1][3] == {"delivery": "failed", "reason": "RuntimeError"}
    assert "provider detail" not in repr(auditCalls)
    assert "provider detail" not in repr(logCalls)


def testPasswordResetProductionConfigFailsClosed():
    from lib import PasswordResetMail

    config = ConfigParser(interpolation=None)
    config.read_dict({"PASSWORD_RESET": {"enabled": "true"}})
    with pytest.raises(ValueError, match="requires public_origin"):
        PasswordResetMail.configurePasswordResetMail(config, runtime="PROD")

    config.read_dict(
        {
            "PASSWORD_RESET": {
                "enabled": "true",
                "public_origin": "http://web.example.com",
                "smtp_host": "smtp.example.com",
                "from_address": "no-reply@example.com",
            }
        }
    )
    with pytest.raises(ValueError, match="HTTPS"):
        PasswordResetMail.configurePasswordResetMail(config, runtime="PROD")

    config = ConfigParser(interpolation=None)
    config.read_dict(
        {
            "PASSWORD_RESET": {
                "enabled": "true",
                "public_origin": "https://web.example.com",
                "smtp_host": "smtp.example.com",
                "from_address": "no-reply@example.com",
                "use_tls": "false",
                "use_ssl": "false",
            }
        }
    )
    with pytest.raises(ValueError, match="requires TLS or SSL"):
        PasswordResetMail.configurePasswordResetMail(config, runtime="PROD")


@pytest.mark.parametrize(
    ("value", "tokenType"),
    [
        (-60, "access"),
        (0, "access"),
        (1, "access"),
        (59, "access"),
        (61, "access"),
        ((ACCESS_TOKEN_EXPIRE_MAX_MINUTES + 1) * 60, "access"),
        ((REFRESH_TOKEN_EXPIRE_MAX_MINUTES + 1) * 60, "refresh"),
    ],
)
def testExpirySecondsRejectInvalidValues(value, tokenType):
    with pytest.raises(ValueError):
        parseAuthExpireSeconds(value, tokenType=tokenType)


@pytest.mark.parametrize(
    ("value", "tokenType"),
    [
        (60, "access"),
        (ACCESS_TOKEN_EXPIRE_MAX_MINUTES * 60, "access"),
        (60, "refresh"),
        (REFRESH_TOKEN_EXPIRE_MAX_MINUTES * 60, "refresh"),
    ],
)
def testExpirySecondsAcceptBoundaryValues(value, tokenType):
    assert parseAuthExpireSeconds(value, tokenType=tokenType) == value // 60


@pytest.mark.parametrize("value", [0, -1, True, 1.5, "60"])
def testAuthConfigAndIssuanceRejectInvalidMinuteValues(value):
    configureTestAuth()
    with pytest.raises(ValueError):
        validateAuthExpireMinutes(value, tokenType="access")
    with pytest.raises(ValueError):
        createAccessToken({"sub": "user@example.com"}, expireMinutes=value)


def testAuthConfigValidatesExpiryBeforeMutatingState():
    configureTestAuth()
    originalAccessExpiry = AuthConfig.accessTokenExpireMinutes

    with pytest.raises(ValueError):
        AuthConfig.initConfig(
            secretKey=STRONG_SECRET,
            accessExpireMinutes=0,
            refreshExpireMinutes=60,
            runtime="TEST",
        )

    assert AuthConfig.accessTokenExpireMinutes == originalAccessExpiry


def testInvalidTokenReturns401WithoutErrorLogAmplification(monkeypatch):
    configureTestAuth()
    errorMessages = []
    debugMessages = []
    monkeypatch.setattr("lib.Auth.logger.error", lambda *args, **kwargs: errorMessages.append(args))
    monkeypatch.setattr("lib.Auth.logger.debug", lambda *args, **kwargs: debugMessages.append(args))

    with pytest.raises(HTTPException) as raised:
        asyncio.run(getCurrentUser(makeRequest(), "not-a-jwt"))

    assert raised.value.status_code == 401
    assert raised.value.headers == {"WWW-Authenticate": "Bearer"}
    assert errorMessages == []
    assert len(debugMessages) == 1
    assert "not-a-jwt" not in repr(debugMessages)
