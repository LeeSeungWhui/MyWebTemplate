"""
파일명: backend/lib/Auth.py
작성자: LSH
갱신일: 2025-09-07
설명: JWT 발급/검증과 인증 공통 설정.
"""

from datetime import datetime, timedelta
import uuid
from typing import Optional

from fastapi import Depends, HTTPException, status
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
    SECRET_KEY: Optional[str] = None
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    TOKEN_ENABLE: bool = True

    @classmethod
    def initConfig(
        cls, secretKey: str, expireMinutes: int = 60, tokenEnable: bool = True
    ):
        cls.SECRET_KEY = secretKey
        cls.ACCESS_TOKEN_EXPIRE_MINUTES = expireMinutes
        cls.TOKEN_ENABLE = tokenEnable


oauth2Scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


def createAccessToken(data: dict) -> Token:
    """
    설명: 페이로드에 만료(exp)를 추가해 JWT 액세스 토큰 생성.
    갱신일: 2025-09-07
    """
    if not AuthConfig.SECRET_KEY:
        raise Exception("SECRET_KEY가 설정되지 않았습니다.")

    toEncode = data.copy()
    now = datetime.utcnow()
    expire = now + timedelta(
        minutes=AuthConfig.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    # Standard claims: exp, iat, jti
    toEncode.update({
        "exp": expire,
        "iat": int(now.timestamp()),
        "jti": uuid.uuid4().hex,
    })

    encodedJwt = jwt.encode(
        toEncode, AuthConfig.SECRET_KEY, algorithm=AuthConfig.ALGORITHM
    )

    return Token(
        accessToken=encodedJwt, expiresIn=AuthConfig.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


async def getCurrentUser(token: str = Depends(oauth2Scheme)):
    """
    설명: Bearer 토큰을 검증하고 인증된 사용자 식별자를 반환.
    갱신일: 2025-09-07
    """
    # 토큰 인증이 비활성화되어 있으면 더미 유저 반환
    if not AuthConfig.TOKEN_ENABLE:
        return TokenData(username="anonymous")

    credentialsException = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # SECRET_KEY가 None일 수 있다는 Pylance 경고를 없애기 위해 런타임 가드를 추가한다.
        secret = AuthConfig.SECRET_KEY
        if not secret:
            logger.error("AuthConfig.SECRET_KEY not configured")
            raise HTTPException(status_code=500, detail="server misconfigured")
        payload = jwt.decode(token, secret, algorithms=[AuthConfig.ALGORITHM])
        # payload.get는 Optional[Any]를 반환하므로 런타임 타입 검사로 보수적으로 확인한다.
        username = payload.get("sub")
        if not isinstance(username, str) or not username:
            raise credentialsException
        tokenData = TokenData(username=username)
    except JWTError as e:
        logger.error(f"JWT 검증 실패: {str(e)}")
        raise credentialsException

    return tokenData
