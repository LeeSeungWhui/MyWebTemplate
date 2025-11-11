"""
파일: backend/service/AuthService.py
작성: LSH
설명: 인증 도메인 서비스. 비즈니스 로직만 포함한다(HTTP/세션은 라우터 책임).
"""

import uuid
from typing import Optional

import base64
import hashlib
import hmac
import bcrypt  # optional; used only if available

from lib.Auth import Token, createAccessToken
from lib import Database as DB
from lib.Response import successResponse


async def me(user):
    return successResponse(result={"username": user.username})


async def verify_user_credentials(username: str, password: str) -> Optional[dict]:
    """사용자명/비밀번호 검증(HTTP 비의존). 유효 시 사용자 레코드(dict) 반환."""
    db = DB.getManager()
    if not db:
        return None
    user = await db.fetchOneQuery("tmpl.user.selectByUsername", {"u": username})
    if not user:
        return None
    if not _verify_password(password, user.get("password_hash") or ""):
        return None
    return user


def build_session_result(user_id: Optional[str], name: Optional[str]) -> dict:
    """세션 JSON(result)만 구성한다."""
    authed = bool(user_id)
    result: dict[str, object] = {"authenticated": authed}
    if authed:
        result.update({"userId": user_id, "name": name})
    return result


def make_csrf_token() -> str:
    return uuid.uuid4().hex


async def issue_token_for_credentials(username: str, password: str) -> Optional[dict]:
    user = await verify_user_credentials(username, password)
    if not user:
        return None
    token: Token = createAccessToken({"sub": username})
    return successResponse(
        result={
            "access_token": token.accessToken,
            "token_type": token.tokenType,
            "expires_in": token.expiresIn,
        }
    )


def _verify_password(plain: str, stored: str) -> bool:
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
