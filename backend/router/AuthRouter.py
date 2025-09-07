"""
파일명: backend/router/AuthRouter.py
작성자: Codex CLI
갱신일: 2025-09-07
설명: 인증/세션/토큰 발급 라우트. 표준 응답·CSRF·레이트리밋 적용.
"""

import os
import time
import uuid
from collections import deque
from typing import Optional

import bcrypt
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse, Response

from lib.Auth import AuthConfig, Token, createAccessToken, getCurrentUser
from lib.Database import dbManagers
from lib.Response import errorResponse, successResponse
from lib.Logger import logger


router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def _cfg(key: str, default: Optional[str] = None) -> str:
    try:
        from .. import server as server_mod  # when imported as package
    except Exception:  # pragma: no cover
        import server as server_mod  # when running as module from backend/
    section = server_mod.config["AUTH"]
    return section.get(key, default) if default is not None else section[key]


# Simple in-memory rate limiter (per-process)
class _RateLimiter:
    def __init__(self, limit: int = 5, window_sec: int = 60):
        self.limit = limit
        self.window = window_sec
        self.store = {}

    def _now(self):
        return time.monotonic()

    def hit(self, key: str):
        now = self._now()
        dq = self.store.get(key)
        if dq is None:
            dq = deque()
            self.store[key] = dq
        # drop old
        while dq and now - dq[0] > self.window:
            dq.popleft()
        if len(dq) >= self.limit:
            # seconds until reset
            retry_after = max(1, int(self.window - (now - dq[0])))
            return False, retry_after
        dq.append(now)
        return True, 0


_rl = _RateLimiter(limit=int(os.getenv("AUTH_RATE_LIMIT", "5")), window_sec=60)


def _rate_limit(request: Request, username: Optional[str] = None) -> Optional[Response]:
    ip = getattr(request.client, "host", "unknown")
    keys = [f"ip:{ip}"]
    if username:
        keys.append(f"user:{username}")
    for k in keys:
        ok, retry_after = _rl.hit(k)
        if not ok:
            return JSONResponse(
                status_code=429,
                content=errorResponse(
                    message="too many requests", code="AUTH_429_RATE_LIMIT"
                ),
                headers={"Retry-After": str(retry_after)},
            )
    return None


async def _ensure_auth_tables():
    if "main_db" not in dbManagers:
        return
    db = dbManagers["main_db"]
    await db.execute(
        """
        CREATE TABLE IF NOT EXISTS member (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT
        )
        """
    )
    # seed demo account if absent
    row = await db.fetchOne("SELECT username FROM member WHERE username = :u", {"u": "demo"})
    if not row:
        hashed = bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode()
        await db.execute(
            "INSERT INTO member (username, password_hash, name) VALUES (:u,:p,:n)",
            {"u": "demo", "p": hashed, "n": "Demo User"},
        )


def _validate_input(username: str, password: str) -> Optional[Response]:
    if not isinstance(username, str) or not isinstance(password, str):
        return JSONResponse(
            status_code=422,
            content=errorResponse(
                message="invalid input", result=None, code="AUTH_422_INVALID_INPUT"
            ),
            headers={"WWW-Authenticate": "Cookie"},
        )
    if len(username) < 3 or len(password) < 8:
        return JSONResponse(
            status_code=422,
            content=errorResponse(
                message="invalid input", result=None, code="AUTH_422_INVALID_INPUT"
            ),
            headers={"WWW-Authenticate": "Cookie"},
        )
    return None


def _require_csrf(request: Request) -> Optional[Response]:
    header_name = _cfg("csrf_header", "X-CSRF-Token")
    expected = request.session.get("csrf")
    provided = request.headers.get(header_name)
    if not expected or not provided or expected != provided:
        return JSONResponse(
            status_code=403,
            content=errorResponse(
                message="csrf required", result=None, code="AUTH_403_CSRF_REQUIRED"
            ),
            headers={"WWW-Authenticate": "Cookie"},
        )
    return None


@router.post("/login", status_code=204)
async def login(request: Request):
    """
    설명: 쿠키 세션 로그인. 성공 시 세션 회전 및 CSRF 발급.
    갱신일: 2025-09-07
    """
    await _ensure_auth_tables()
    body = await request.json()
    username = body.get("username")
    password = body.get("password")
    remember = bool(body.get("rememberMe", False))

    invalid = _validate_input(username, password)
    if invalid is not None:
        return invalid

    if "main_db" not in dbManagers:
        return JSONResponse(
            status_code=500,
            content=errorResponse(message="db unavailable", code="AUTH_500_DB"),
        )
    db = dbManagers["main_db"]
    user = await db.fetchOne(
        "SELECT username, password_hash, name FROM member WHERE username = :u",
        {"u": username},
    )
    if not user:
        logger.info("auth.login.fail username")
        limited = _rate_limit(request, username=username)
        if limited is not None:
            return limited
        return JSONResponse(
            status_code=401,
            content=errorResponse(message="invalid credentials", code="AUTH_401_INVALID"),
            headers={"WWW-Authenticate": "Cookie"},
        )
    if not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        logger.info("auth.login.fail password")
        limited = _rate_limit(request, username=username)
        if limited is not None:
            return limited
        return JSONResponse(
            status_code=401,
            content=errorResponse(message="invalid credentials", code="AUTH_401_INVALID"),
            headers={"WWW-Authenticate": "Cookie"},
        )

    # rotate session by clearing and setting new data
    request.session.clear()
    request.session["userId"] = user["username"]
    request.session["name"] = user.get("name") or None
    # issue csrf
    csrf = uuid.uuid4().hex
    request.session["csrf"] = csrf

    response = Response(status_code=204)
    # SessionMiddleware will set cookie when session modified. For remember, we can't change max_age per request here.
    # Optionally set a helper cookie for UI to know long-lived session preference.
    if remember:
        response.set_cookie("rememberMe", "1", max_age=60 * 60 * 24 * 30, httponly=False)
    return response


@router.post("/logout", status_code=204)
async def logout(request: Request):
    """
    설명: CSRF 검증 후 세션 로그아웃 및 쿠키 삭제.
    갱신일: 2025-09-07
    """
    # CSRF required for cookie-mode unsafe request
    csrf_error = _require_csrf(request)
    if csrf_error is not None:
        return csrf_error

    request.session.clear()
    response = Response(status_code=204)
    # delete session cookie
    session_cookie = _cfg("session_cookie", "sid")
    response.delete_cookie(session_cookie)
    return response


@router.get("/session")
async def get_session(request: Request):
    """
    설명: 세션 인증 상태 조회. 캐시 금지 헤더 포함.
    갱신일: 2025-09-07
    """
    authed = "userId" in request.session
    result = {"authenticated": bool(authed)}
    if authed:
        result.update({"userId": request.session.get("userId"), "name": request.session.get("name")})
    resp = successResponse(result=result)
    r = JSONResponse(content=resp, status_code=200)
    r.headers["Cache-Control"] = "no-store"
    return r


@router.post("/token")
async def issue_token(request: Request):
    """
    설명: 베어러 액세스 토큰 발급. 잘못된 시도에만 레이트리밋 적용.
    갱신일: 2025-09-07
    """
    body = await request.json()
    username = body.get("username")
    password = body.get("password")

    invalid = _validate_input(username, password)
    if invalid is not None:
        # align to bearer realm
        invalid.headers = {"WWW-Authenticate": "Bearer"}
        return invalid

    await _ensure_auth_tables()
    if "main_db" not in dbManagers:
        return JSONResponse(
            status_code=500,
            content=errorResponse(message="db unavailable", code="AUTH_500_DB"),
        )
    db = dbManagers["main_db"]
    user = await db.fetchOne(
        "SELECT username, password_hash, name FROM member WHERE username = :u",
        {"u": username},
    )
    if not user or not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        logger.info("auth.token.fail invalid")
        # rate limit only on invalid creds
        limited = _rate_limit(request, username=username)
        if limited is not None:
            return limited
        return JSONResponse(
            status_code=401,
            content=errorResponse(message="invalid credentials", code="AUTH_401_INVALID"),
            headers={"WWW-Authenticate": "Bearer"},
        )

    token: Token = createAccessToken({"sub": username})
    return successResponse(
        result={
            "access_token": token.accessToken,
            "token_type": token.tokenType,
            "expires_in": token.expiresIn,
        }
    )


@router.get("/csrf")
async def issue_csrf(request: Request):
    """
    설명: CSRF 토큰 발급(세션 저장). 프론트 보호용.
    갱신일: 2025-09-07
    """
    csrf = uuid.uuid4().hex
    request.session["csrf"] = csrf
    return successResponse(result={"csrf": csrf})


@router.get("/me")
async def me(user=Depends(getCurrentUser)):
    """
    설명: 베어러 토큰 검증 후 사용자 정보 반환.
    갱신일: 2025-09-07
    """
    return successResponse(result={"username": user.username})
