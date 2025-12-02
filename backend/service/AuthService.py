"""
파일: backend/service/AuthService.py
작성: LSH
설명: 인증 도메인 서비스. 비즈니스 로직만 포함한다(HTTP/세션은 라우터 책임).
"""

import uuid
from typing import Optional, Tuple

import base64
import hashlib
import hmac
import bcrypt  # optional; used only if available

from jose import JWTError, jwt

from lib.Auth import AuthConfig, Token, createAccessToken, createRefreshToken
from lib import Database as DB
from lib.Response import successResponse


async def me(user):
    return successResponse(result={"username": user.username})


async def login(payload: dict, rememberMe: bool = False) -> Optional[dict]:
    """로그인 요청을 처리하고 사용자/토큰 정보를 함께 반환."""
    authUser, username = await authenticateUser(payload)
    if not authUser or not username:
        return None
    tokenPayload = issueTokens(username, rememberMe)
    return {"user": authUser, "token": tokenPayload}


def session(payload: dict) -> dict:
    """세션 조회 요청 payload(dict)로 응답 result를 구성."""
    userId = (payload or {}).get("userId")
    name = (payload or {}).get("name")
    authed = bool(userId)
    result: dict[str, object] = {"authenticated": authed}
    if authed:
        result.update({"userId": userId, "name": name})
    return result


def csrf(_: Optional[dict] = None) -> dict:
    """CSRF 토큰 응답 payload를 반환."""
    return {"csrf": uuid.uuid4().hex}


async def refresh(refreshToken: str) -> Optional[dict]:
    """리프레시 토큰으로 새 액세스/리프레시 토큰을 발급한다."""
    try:
        secret = AuthConfig.SECRET_KEY
        if not secret:
            return None
        payload = jwt.decode(refreshToken, secret, algorithms=[AuthConfig.ALGORITHM])
        username = payload.get("sub")
        tokenType = payload.get("typ")
        remember = bool(payload.get("remember"))
        if tokenType != "refresh" or not isinstance(username, str) or not username:
            return None
        return issueTokens(username, remember)
    except JWTError:
        return None


def verifyPassword(plain: str, stored: str) -> bool:
    try:
        if stored and stored.startswith("pbkdf2$"):
            parts = stored.split("$")
            iters = int(parts[1])
            salt = base64.b64decode(parts[2])
            expected = base64.b64decode(parts[3])
            dk = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt, iters)
            return hmac.compare_digest(dk, expected)
        # bcrypt 해시($2a$/$2b$)일 경우에만 시도. getattr로 안전 호출해 Pylance 경고를 피한다.
        if stored.startswith("$2a$") or stored.startswith("$2b$"):
            fn = getattr(bcrypt, "checkpw", None)
            if callable(fn):
                try:
                    return bool(fn(plain.encode("utf-8"), stored.encode("utf-8")))
                except Exception:
                    return False
        return False
    except Exception:
        return False


async def authenticateUser(payload: dict) -> Tuple[Optional[dict], Optional[str]]:
    """payload에서 자격 증명을 추출해 사용자/아이디를 반환."""
    if not isinstance(payload, dict):
        return None, None
    username = payload.get("username")
    password = payload.get("password")
    if not isinstance(username, str) or not isinstance(password, str):
        return None, None
    db = DB.getManager()
    if not db:
        return None, None
    user = await db.fetchOneQuery("auth.userByUsername", {"u": username})
    if not user:
        return None, None
    if not verifyPassword(password, user.get("password_hash") or ""):
        return None, None
    return user, username


def issueTokens(username: str, remember: bool = False) -> dict:
    """주어진 사용자명으로 액세스/리프레시 토큰 페이로드를 생성."""
    accessToken: Token = createAccessToken(
        {"sub": username, "remember": remember}, tokenType="access"
    )
    refreshToken: Token = createRefreshToken(
        {"sub": username, "remember": remember}
    )
    return {
        "access_token": accessToken.accessToken,
        "refresh_token": refreshToken.accessToken,
        "token_type": accessToken.tokenType,
        "expires_in": accessToken.expiresIn,
        "refresh_expires_in": refreshToken.expiresIn,
        "remember": remember,
    }
