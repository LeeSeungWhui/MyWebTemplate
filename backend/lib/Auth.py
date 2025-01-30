from datetime import datetime, timedelta
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
    SECRET_KEY: str = None
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


oauth2Scheme = OAuth2PasswordBearer(tokenUrl="token")


def createAccessToken(data: dict) -> Token:
    if not AuthConfig.SECRET_KEY:
        raise Exception("SECRET_KEY가 설정되지 않았습니다.")

    toEncode = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=AuthConfig.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    toEncode.update({"exp": expire})

    encodedJwt = jwt.encode(
        toEncode, AuthConfig.SECRET_KEY, algorithm=AuthConfig.ALGORITHM
    )

    return Token(
        accessToken=encodedJwt, expiresIn=AuthConfig.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


async def getCurrentUser(token: str = Depends(oauth2Scheme)):
    # 토큰 인증이 비활성화되어 있으면 더미 유저 반환
    if not AuthConfig.TOKEN_ENABLE:
        return TokenData(username="anonymous")

    credentialsException = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token, AuthConfig.SECRET_KEY, algorithms=[AuthConfig.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentialsException
        tokenData = TokenData(username=username)
    except JWTError as e:
        logger.error(f"JWT 검증 실패: {str(e)}")
        raise credentialsException

    return tokenData
