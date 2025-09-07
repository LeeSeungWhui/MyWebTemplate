"""
파일: backend/service/AuthService.py
작성: Codex CLI
설명: 인증 도메인 서비스. 라우터에서 호출되어 로그인/로그아웃/토큰 발급 등 처리.
"""

import os
import json
import time
import uuid
from collections import deque
from typing import Optional

import bcrypt
from fastapi import Request
from fastapi.responses import JSONResponse, Response

from lib.Auth import AuthConfig, Token, createAccessToken
from lib.Database import dbManagers
from lib.Response import errorResponse, successResponse
from lib.Logger import logger
from lib.I18n import detect_locale, t as i18n_t
from lib.RequestContext import get_request_id


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
    await db.executeQuery("auth.ensureUserTable")
    # seed demo account if absent
    row = await db.fetchOneQuery("user.selectByUsername", {"u": "demo"})
    if not row:
        hashed = bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode()
        await db.executeQuery(
            "auth.insertDemoUser",
            {"u": "demo", "p": hashed, "n": "Demo User", "e": "demo@example.com", "r": "admin"},
        )


def _validate_input(request: Request, username: str, password: str) -> Optional[Response]:
    loc = detect_locale(request)
    if not isinstance(username, str) or not isinstance(password, str):
        return JSONResponse(
            status_code=422,
            content=errorResponse(
                message=i18n_t("error.invalid_input", "invalid input", loc), result=None, code="AUTH_422_INVALID_INPUT"
            ),
            headers={"WWW-Authenticate": "Cookie"},
        )
    if len(username) < 3 or len(password) < 8:
        return JSONResponse(
            status_code=422,
            content=errorResponse(
                message=i18n_t("error.invalid_input", "invalid input", loc), result=None, code="AUTH_422_INVALID_INPUT"
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
                message=i18n_t("error.csrf_required", "csrf required", detect_locale(request)), result=None, code="AUTH_403_CSRF_REQUIRED"
            ),
            headers={"WWW-Authenticate": "Cookie"},
        )
    return None


async def login(request: Request):
    await _ensure_auth_tables()
    body = await request.json()
    username = body.get("username")
    password = body.get("password")
    remember = bool(body.get("rememberMe", False))

    invalid = _validate_input(request, username, password)
    if invalid is not None:
        return invalid

    if "main_db" not in dbManagers:
        loc = detect_locale(request)
        return JSONResponse(
            status_code=500,
            content=errorResponse(message=i18n_t("db.unavailable", "db unavailable", loc), code="AUTH_500_DB"),
        )
    db = dbManagers["main_db"]
    user = await db.fetchOneQuery("user.selectByUsername", {"u": username})
    if not user:
        logger.info("auth.login.fail username")
        limited = _rate_limit(request, username=username)
        if limited is not None:
            return limited
        return JSONResponse(
            status_code=401,
            content=errorResponse(message=i18n_t("error.invalid_credentials", "invalid credentials", detect_locale(request)), code="AUTH_401_INVALID"),
            headers={"WWW-Authenticate": "Cookie"},
        )
    if not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        logger.info("auth.login.fail password")
        limited = _rate_limit(request, username=username)
        if limited is not None:
            return limited
        return JSONResponse(
            status_code=401,
            content=errorResponse(message=i18n_t("error.invalid_credentials", "invalid credentials", detect_locale(request)), code="AUTH_401_INVALID"),
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
    # audit log (success)
    try:
        logger.info(
            json.dumps(
                {
                    "event": "auth.login.success",
                    "userId": user["username"],
                    "ip": getattr(request.client, "host", None),
                    "requestId": get_request_id(),
                },
                ensure_ascii=False,
            )
        )
    except Exception:
        pass
    if remember:
        response.set_cookie("rememberMe", "1", max_age=60 * 60 * 24 * 30, httponly=False)
    return response


async def logout(request: Request):
    csrf_error = _require_csrf(request)
    if csrf_error is not None:
        return csrf_error

    _uid = request.session.get("userId")
    request.session.clear()
    response = Response(status_code=204)
    session_cookie = _cfg("session_cookie", "sid")
    response.delete_cookie(session_cookie)
    try:
        logger.info(
            json.dumps(
                {
                    "event": "auth.logout",
                    "userId": _uid,
                    "ip": getattr(request.client, "host", None),
                    "requestId": get_request_id(),
                },
                ensure_ascii=False,
            )
        )
    except Exception:
        pass
    return response


async def get_session(request: Request):
    authed = "userId" in request.session
    result = {"authenticated": bool(authed)}
    if authed:
        result.update({"userId": request.session.get("userId"), "name": request.session.get("name")})
    resp = successResponse(result=result)
    r = JSONResponse(content=resp, status_code=200)
    r.headers["Cache-Control"] = "no-store"
    return r


async def issue_token(request: Request):
    body = await request.json()
    username = body.get("username")
    password = body.get("password")

    invalid = _validate_input(request, username, password)
    if invalid is not None:
        invalid.headers = {"WWW-Authenticate": "Bearer"}
        return invalid

    await _ensure_auth_tables()
    if "main_db" not in dbManagers:
        loc = detect_locale(request)
        return JSONResponse(
            status_code=500,
            content=errorResponse(message=i18n_t("db.unavailable", "db unavailable", loc), code="AUTH_500_DB"),
        )
    db = dbManagers["main_db"]
    user = await db.fetchOneQuery("user.selectByUsername", {"u": username})
    if not user or not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        logger.info("auth.token.fail invalid")
        limited = _rate_limit(request, username=username)
        if limited is not None:
            return limited
        return JSONResponse(
            status_code=401,
            content=errorResponse(message=i18n_t("error.invalid_credentials", "invalid credentials", detect_locale(request)), code="AUTH_401_INVALID"),
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


async def issue_csrf(request: Request):
    csrf = uuid.uuid4().hex
    request.session["csrf"] = csrf
    return successResponse(result={"csrf": csrf})


async def me(user):
    return successResponse(result={"username": user.username})
