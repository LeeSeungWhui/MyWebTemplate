import asyncio
from datetime import datetime, timedelta, timezone

import pytest
from fastapi import HTTPException
from jose import JWTError, jwt
from starlette.requests import Request

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
