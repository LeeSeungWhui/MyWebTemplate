"""
파일명: backend/lib/Auth.py
작성자: LSH
갱신일: 2025-09-07
설명: JWT 발급/검증과 인증 공통 설정.
"""

from datetime import datetime, timedelta
import uuid
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from lib.Logger import logger
from pydantic import BaseModel


class Token(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    expiresIn: int


class TokenData(BaseModel):
    username: Optional[str] = None


class AuthConfig:
    # Pylance 정적 타입 경고 방지를 위해 Optional[str]로 선언
    secretKey: Optional[str] = None
    algorithm: str = "HS256"
    accessTokenExpireMinutes: int = 60
    refreshTokenExpireMinutes: int = 60 * 24 * 7
    # refresh 토큰 회전 직후, 동일 refresh 토큰 재시도(탭 경합/네트워크 재시도)를 허용하는 유예 시간(ms)
    refreshGraceMs: int = 10_000
    accessCookieName: str = "access_token"
    refreshCookieName: str = "refresh_token"
    tokenEnable: bool = True

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
    ):
        cls.secretKey = secretKey
        cls.accessTokenExpireMinutes = accessExpireMinutes
        cls.refreshTokenExpireMinutes = refreshExpireMinutes
        cls.refreshGraceMs = int(refreshGraceMs or 0)
        cls.accessCookieName = accessCookie
        cls.refreshCookieName = refreshCookie
        cls.tokenEnable = tokenEnable


oauth2Scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token", auto_error=False)


def createAccessToken(
    data: dict, *, tokenType: str = "access", expireMinutes: Optional[int] = None
) -> Token:
    """
    설명: 페이로드에 만료(exp)를 추가해 JWT 액세스/리프레시 토큰 생성.
    갱신일: 2025-11-XX
    """
    if not AuthConfig.secretKey:
        raise Exception("SECRET_KEY가 설정되지 않았습니다.")

    toEncode = data.copy()
    now = datetime.utcnow()
    expireMinutes = (
        expireMinutes
        if expireMinutes is not None
        else AuthConfig.accessTokenExpireMinutes
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

    encodedJwt = jwt.encode(
        toEncode, AuthConfig.secretKey, algorithm=AuthConfig.algorithm
    )

    return Token(
        accessToken=encodedJwt, expiresIn=expireMinutes * 60
    )


def createRefreshToken(data: dict) -> Token:
    """설명: 리프레시 토큰 생성."""
    return createAccessToken(
        data,
        tokenType="refresh",
        expireMinutes=AuthConfig.refreshTokenExpireMinutes,
    )


async def getCurrentUser(
    request: Request, token: Optional[str] = Depends(oauth2Scheme)
):
    """
    설명: Bearer 토큰을 검증하고 인증된 사용자 식별자를 반환.
    갱신일: 2025-11-XX
    """
    credentialsException = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # 토큰 인증이 비활성화되어 있으면 더미 유저 반환
    if not AuthConfig.tokenEnable:
        return TokenData(username="anonymous")

    if not token:
        raise credentialsException

    try:
        # SECRET_KEY가 None일 수 있다는 Pylance 경고를 없애기 위해 런타임 가드를 추가한다.
        secret = AuthConfig.secretKey
        if not secret:
            logger.error("AuthConfig.secretKey not configured")
            raise HTTPException(status_code=500, detail="server misconfigured")
        payload = jwt.decode(token, secret, algorithms=[AuthConfig.algorithm])
        # payload.get는 Optional[Any]를 반환하므로 런타임 타입 검사로 보수적으로 확인한다.
        username = payload.get("sub")
        tokenType = payload.get("typ")
        if tokenType != "access":
            raise credentialsException
        if not isinstance(username, str) or not username:
            raise credentialsException
        tokenData = TokenData(username=username)
    except JWTError as e:
        logger.error(f"JWT 검증 실패: {str(e)}")
        raise credentialsException

    return tokenData
