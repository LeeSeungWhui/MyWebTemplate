"""
파일명: backend/lib/Auth.py
작성자: LSH
갱신일: 2026-01-18
설명: JWT 발급/검증과 인증 공통 설정
"""

from datetime import datetime, timedelta, timezone
import uuid

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from lib.Logger import logger
from pydantic import BaseModel


AUTH_TEST_RUNTIMES = frozenset({"TEST", "CI"})
AUTH_CLOCK_SKEW_SECONDS = 60
ACCESS_TOKEN_EXPIRE_MAX_MINUTES = 24 * 60
REFRESH_TOKEN_EXPIRE_MAX_MINUTES = 90 * 24 * 60


class Token(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    expiresIn: int


class TokenData(BaseModel):
    username: str | None = None


class AuthConfig:

    # JWT 시크릿은 배포 환경에서 강한 랜덤 키를 사용해야 한다.
    secretKey: str | None = None
    algorithm: str = "HS256"
    accessTokenExpireMinutes: int = 60
    refreshTokenExpireMinutes: int = 60 * 24 * 7

    # refresh 토큰 회전 직후, 동일 refresh 토큰 재시도(탭 경합/네트워크 재시도)를 허용하는 유예 시간(ms)
    refreshGraceMs: int = 10_000
    accessCookieName: str = "access_token"
    refreshCookieName: str = "refresh_token"
    tokenEnable: bool = True
    strictSecretValidation: bool = False
    runtime: str = "DEV"

    @classmethod
    def initConfig(
        cls,
        secretKey: str,
        accessExpireMinutes: int = 60,
        refreshExpireMinutes: int = 60 * 24 * 7,
        refreshGraceMs: int = 10_000,
        tokenEnable: bool = True,
        accessCookie: str = "access_token",
        refreshCookie: str = "refresh_token",
        strictSecretValidation: bool | None = None,
        runtime: str = "DEV",
        allowWeakAuthSecret: bool = False,
    ):
        """
        설명: 인증 토큰 만료/쿠키/보안 강제 옵션을 전역 설정에 반영
        부작용: AuthConfig 클래스 전역 속성(secret/expire/cookie/security 정책)이 모두 갱신
        갱신일: 2026-02-24
        """
        normalizedRuntime, resolvedStrictSecretValidation = resolveAuthRuntimePolicy(
            runtime=runtime,
            tokenEnable=tokenEnable,
            allowWeakAuthSecret=allowWeakAuthSecret,
        )
        if (
            strictSecretValidation is not None
            and bool(strictSecretValidation) != resolvedStrictSecretValidation
        ):
            raise ValueError("AUTH strict secret policy does not match runtime policy")
        if resolvedStrictSecretValidation and not isStrongAuthSecret(secretKey):
            raise ValueError("AUTH secret_key does not meet the required strength policy")

        validatedAccessExpireMinutes = validateAuthExpireMinutes(
            accessExpireMinutes,
            tokenType="access",
        )
        validatedRefreshExpireMinutes = validateAuthExpireMinutes(
            refreshExpireMinutes,
            tokenType="refresh",
        )

        cls.secretKey = secretKey
        cls.accessTokenExpireMinutes = validatedAccessExpireMinutes
        cls.refreshTokenExpireMinutes = validatedRefreshExpireMinutes
        cls.refreshGraceMs = int(refreshGraceMs or 0)
        cls.accessCookieName = accessCookie
        cls.refreshCookieName = refreshCookie
        cls.tokenEnable = tokenEnable
        cls.strictSecretValidation = resolvedStrictSecretValidation
        cls.runtime = normalizedRuntime

# OpenAPI 문서용 tokenUrl은 Bearer 토큰(JSON 계약) 로그인 엔드포인트와 일치시킨다.
oauth2Scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/app/login", auto_error=False)


def isStrongAuthSecret(secretKey: str | None) -> bool:
    """
    설명: 운영용 JWT 시크릿 강도(길이/금지 키워드/문자 다양성) 평가
    반환값: 보안 기준을 만족하면 True, 아니면 False
    갱신일: 2026-02-24
    """
    raw = str(secretKey or "").strip()
    if len(raw) < 32:
        return False
    forbidden = {
        "replace-with-strong-random-secret",
        "changeme",
        "change-me",
        "secret",
        "default",
        "test-secret-key",
        "password",
    }
    if raw.lower() in forbidden:
        return False

    hasLower = any(ch.islower() for ch in raw)
    hasUpper = any(ch.isupper() for ch in raw)
    hasDigit = any(ch.isdigit() for ch in raw)
    hasPunct = any(not ch.isalnum() for ch in raw)
    score = sum([hasLower, hasUpper, hasDigit, hasPunct])
    return score >= 3


def resolveAuthRuntimePolicy(
    *,
    runtime: str,
    tokenEnable: bool,
    allowWeakAuthSecret: bool = False,
) -> tuple[str, bool]:
    """
    설명: 인증 비활성화와 약한 secret 예외를 TEST/CI로 제한하고 strict 여부를 계산
    반환값: 정규화된 runtime과 strict secret 검증 여부
    갱신일: 2026-07-11
    """
    normalizedRuntime = str(runtime or "").strip().upper() or "DEV"
    isTestRuntime = normalizedRuntime in AUTH_TEST_RUNTIMES
    if not tokenEnable and not isTestRuntime:
        raise ValueError("AUTH token_enable=false is allowed only in TEST or CI")
    if allowWeakAuthSecret and not isTestRuntime:
        raise ValueError("ALLOW_WEAK_AUTH_SECRET is allowed only in TEST or CI")
    return normalizedRuntime, bool(tokenEnable and not isTestRuntime)


def validateAuthExpireMinutes(value: object, *, tokenType: str) -> int:
    """
    설명: access/refresh 토큰 만료 분 값을 양수 정수와 타입별 상한으로 검증
    반환값: 검증된 만료 분 정수
    갱신일: 2026-07-11
    """
    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError(f"AUTH {tokenType} expiry must be an integer number of minutes")
    if tokenType == "access":
        maximum = ACCESS_TOKEN_EXPIRE_MAX_MINUTES
    elif tokenType == "refresh":
        maximum = REFRESH_TOKEN_EXPIRE_MAX_MINUTES
    else:
        raise ValueError("AUTH token type must be access or refresh")
    if value <= 0 or value > maximum:
        raise ValueError(
            f"AUTH {tokenType} expiry must be between 1 and {maximum} minutes"
        )
    return value


def parseAuthExpireSeconds(value: object, *, tokenType: str) -> int:
    """
    설명: 설정 파일의 초 단위 만료 값을 분 정렬과 타입별 상한까지 검증해 분으로 변환
    반환값: 검증된 만료 분 정수
    갱신일: 2026-07-11
    """
    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError(f"AUTH {tokenType} expiry must be an integer number of seconds")
    if value < 60 or value % 60 != 0:
        raise ValueError(
            f"AUTH {tokenType} expiry must be at least 60 seconds and minute-aligned"
        )
    return validateAuthExpireMinutes(value // 60, tokenType=tokenType)


def decodeAuthToken(token: str, *, expectedTokenType: str) -> dict:
    """
    설명: access/refresh 공통 JWT 필수 claim, 타입, 미래 iat 경계를 검증
    반환값: 검증되고 subject/jti 공백이 정규화된 JWT payload
    갱신일: 2026-07-11
    """
    secret = AuthConfig.secretKey
    if not secret:
        raise JWTError("auth secret is not configured")
    if expectedTokenType not in {"access", "refresh"}:
        raise JWTError("unsupported token type")

    payload = jwt.decode(
        token,
        secret,
        algorithms=[AuthConfig.algorithm],
        options={
            "require_exp": True,
            "require_iat": True,
            "require_jti": True,
            "require_sub": True,
        },
    )
    if payload.get("typ") != expectedTokenType:
        raise JWTError("unexpected token type")

    subject = payload.get("sub")
    tokenJti = payload.get("jti")
    issuedAt = payload.get("iat")
    if not isinstance(subject, str) or not subject.strip():
        raise JWTError("invalid token subject")
    if not isinstance(tokenJti, str) or not tokenJti.strip():
        raise JWTError("invalid token jti")
    if isinstance(issuedAt, bool) or not isinstance(issuedAt, (int, float)):
        raise JWTError("invalid token iat")
    nowTimestamp = datetime.now(timezone.utc).timestamp()
    if issuedAt > nowTimestamp + AUTH_CLOCK_SKEW_SECONDS:
        raise JWTError("token iat is in the future")

    payload["sub"] = subject.strip()
    payload["jti"] = tokenJti.strip()
    return payload


def bindAuthUsernameToRequestState(request: Request, username: str | None) -> None:
    """
    설명: 인증된 사용자 식별자를 request. state에 바인딩(미들웨어 접근 로그용)
    부작용: request.state.authUsername 속성이 설정
    갱신일: 2026-02-22
    """
    try:
        setattr(request.state, "authUsername", username)
    except Exception:
        pass


def createAccessToken(data: dict, *, tokenType: str = "access", expireMinutes: int | None = None) -> Token:
    """
    설명: 페이로드에 만료(exp)를 추가해 JWT 액세스/리프레시 토큰 생성
    반환값: 인코딩된 JWT와 expiresIn 값을 포함한 Token 모델
    갱신일: 2026-02-26
    """
    if not AuthConfig.secretKey:
        raise Exception("SECRET_KEY가 설정되지 않았습니다.")
    if AuthConfig.strictSecretValidation and not isStrongAuthSecret(AuthConfig.secretKey):
        raise Exception("SECRET_KEY가 보안 기준을 충족하지 않습니다.")

    toEncode = data.copy()
    now = datetime.now(timezone.utc)
    configuredExpireMinutes = (
        expireMinutes
        if expireMinutes is not None
        else (
            AuthConfig.refreshTokenExpireMinutes
            if tokenType == "refresh"
            else AuthConfig.accessTokenExpireMinutes
        )
    )
    expireMinutes = validateAuthExpireMinutes(
        configuredExpireMinutes,
        tokenType=tokenType,
    )
    expire = now + timedelta(minutes=expireMinutes)

    # 표준 클레임: exp, iat, jti, typ
    toEncode.update(
        {
            "exp": expire,
            "iat": int(now.timestamp()),
            "jti": uuid.uuid4().hex,
            "typ": tokenType,
        }
    )

    encodedJwt = jwt.encode(toEncode, AuthConfig.secretKey, algorithm=AuthConfig.algorithm)

    return Token(accessToken=encodedJwt, expiresIn=expireMinutes * 60)


def createRefreshToken(data: dict) -> Token:
    """
    설명: 리프레시 토큰을 생성. 호출 맥락의 제약을 기준으로 동작 기준 확정
    반환값: typ=refresh와 refresh 만료시간이 반영된 Token 모델
    갱신일: 2026-02-24
    """
    return createAccessToken(
        data,
        tokenType="refresh",
        expireMinutes=AuthConfig.refreshTokenExpireMinutes,
    )


async def getCurrentUser(request: Request, token: str | None = Depends(oauth2Scheme)):
    """
    설명: Bearer 토큰을 검증하고 인증된 사용자 식별자 반환
    갱신일: 2026-02-26
    처리 규칙: 입력값을 검증하고 실패 시 예외/기본값 경로로 수렴
    """
    credentialsException = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # 테스트용 인증 비활성화는 TEST/CI에서만 허용한다.
    if not AuthConfig.tokenEnable:
        if AuthConfig.runtime not in AUTH_TEST_RUNTIMES:
            logger.error("AuthConfig token authentication disabled outside TEST/CI")
            raise HTTPException(status_code=500, detail="server misconfigured")
        tokenData = TokenData(username="anonymous")
        bindAuthUsernameToRequestState(request, tokenData.username)
        return tokenData

    if not token:
        raise credentialsException

    try:

        # SECRET_KEY가 None일 수 있다는 Pylance 경고를 없애기 위해 런타임 가드를 추가한다.
        secret = AuthConfig.secretKey
        if not secret:
            logger.error("AuthConfig.secretKey not configured")
            raise HTTPException(status_code=500, detail="server misconfigured")
        if AuthConfig.strictSecretValidation and not isStrongAuthSecret(secret):
            logger.error("AuthConfig.secretKey too weak for strict mode")
            raise HTTPException(status_code=500, detail="server misconfigured")
        payload = decodeAuthToken(token, expectedTokenType="access")
        username = payload["sub"]
        tokenData = TokenData(username=username)
    except JWTError as e:
        logger.debug("JWT verification rejected: %s", type(e).__name__)
        raise credentialsException

    bindAuthUsernameToRequestState(request, tokenData.username)
    return tokenData
