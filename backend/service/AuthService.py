"""
파일: backend/service/AuthService.py
작성: LSH
설명: 인증 도메인 서비스. 비즈니스 로직만 포함한다(HTTP/세션은 라우터 책임).
"""

import uuid
from typing import Optional, Tuple, Dict, Any

import base64
import hashlib
import hmac
import json
from datetime import datetime, timezone

import bcrypt  # optional; used only if available

from jose import JWTError, jwt

from lib.Auth import AuthConfig, Token, createAccessToken, createRefreshToken
from lib import Database as DB
from lib.Logger import logger
from lib.RequestContext import getRequestId
from lib.Response import successResponse

# 인메모리 리프레시 토큰 블랙리스트(재사용/로그아웃 차단용)
revokedRefreshJtiStore: set[str] = set()


def _nowMs() -> int:
    return int(datetime.now(timezone.utc).timestamp() * 1000)


def auditLog(event: str, username: Optional[str], success: bool, meta: Optional[Dict[str, Any]] = None) -> None:
    """
    설명: 로그인/리프레시/로그아웃 등 인증 이벤트 감사 로그를 남긴다.
    갱신일: 2025-12-03
    """
    try:
        payload: Dict[str, Any] = {
            "ts": _nowMs(),
            "event": event,
            "username": username,
            "success": bool(success),
            "requestId": getRequestId(),
        }
        if meta and isinstance(meta, dict):
            payload.update(meta)
        logger.info(json.dumps(payload, ensure_ascii=False))
    except Exception:
        # 로깅 실패가 인증 흐름을 막지 않도록 방어
        try:
            logger.info("auth_audit_fallback %s %s %s %s", event, username, success, meta)
        except Exception:
            pass


async def me(user):
    return successResponse(result={"username": user.username})


async def login(payload: dict, rememberMe: bool = False) -> Optional[dict]:
    """로그인 요청을 처리하고 사용자/토큰 정보를 함께 반환."""
    candidateUsername: Optional[str] = None
    if isinstance(payload, dict):
        rawUsername = payload.get("username")
        if isinstance(rawUsername, str):
            candidateUsername = rawUsername

    authUser, username = await authenticateUser(payload)
    if not authUser or not username:
        auditLog("auth.login", candidateUsername, False, {"reason": "invalid_credentials"})
        return None
    tokenPayload = issueTokens(username, rememberMe)
    auditLog("auth.login", username, True, {"remember": bool(rememberMe)})
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
    """리프레시 토큰으로 새 액세스/리프레시 토큰을 발급한다(토큰 회전 + 재사용 차단)."""
    payload = decodeRefreshTokenPayload(refreshToken)
    if not payload:
        auditLog("auth.refresh", None, False, {"reason": "invalid_refresh"})
        return None

    username = payload.get("sub")
    remember = bool(payload.get("remember"))
    jti = payload.get("jti")

    if not isinstance(username, str) or not username:
        auditLog("auth.refresh", None, False, {"reason": "missing_sub"})
        return None
    if not isinstance(jti, str) or not jti:
        auditLog("auth.refresh", username, False, {"reason": "missing_jti"})
        return None
    if jti in revokedRefreshJtiStore:
        # 이미 사용됐거나 로그아웃된 리프레시 토큰 재사용 시도
        auditLog("auth.refresh", username, False, {"reason": "reused_token"})
        return None

    # 현재 리프레시 토큰은 더 이상 사용하지 못하도록 블랙리스트에 추가
    revokedRefreshJtiStore.add(jti)

    tokenPayload = issueTokens(username, remember)
    auditLog("auth.refresh", username, True, {"remember": bool(remember)})
    return tokenPayload


def revokeRefreshToken(refreshToken: Optional[str]) -> None:
    """
    설명: 로그아웃 시 리프레시 토큰을 블랙리스트에 추가해 재사용을 차단한다.
    갱신일: 2025-12-03
    """
    if not refreshToken:
        auditLog("auth.logout", None, True, {"reason": "no_refresh_cookie"})
        return

    payload = decodeRefreshTokenPayload(refreshToken)
    if not payload:
        auditLog("auth.logout", None, False, {"reason": "invalid_refresh"})
        return

    username = payload.get("sub") if isinstance(payload.get("sub"), str) else None
    jti = payload.get("jti")
    if isinstance(jti, str) and jti:
        revokedRefreshJtiStore.add(jti)
    auditLog("auth.logout", username, True, {})


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


def decodeRefreshTokenPayload(refreshToken: str) -> Optional[Dict[str, Any]]:
    """
    설명: 리프레시 토큰을 디코드해 페이로드를 반환한다. typ이 refresh가 아니면 None.
    갱신일: 2025-12-03
    """
    try:
        secret = AuthConfig.secretKey
        if not secret:
            return None
        payload = jwt.decode(refreshToken, secret, algorithms=[AuthConfig.algorithm])
        tokenType = payload.get("typ")
        if tokenType != "refresh":
            return None
        return payload
    except JWTError:
        return None


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
