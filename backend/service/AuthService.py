"""
파일: backend/service/AuthService.py
작성: LSH
설명: 인증 도메인 서비스. 라우터에서 호출되어 로그인/로그아웃/토큰 발급 등 처리.
"""

import os
import json
import time
import uuid
from collections import deque
from typing import Optional

import base64
import hashlib
import hmac
import bcrypt  # optional; used only if available
from fastapi import Request
from fastapi.responses import JSONResponse, Response

from lib.Auth import Token, createAccessToken
from lib import Database as DB
from lib.Response import errorResponse, successResponse
from lib.Logger import logger
from lib.I18n import detect_locale, t as i18n_t
from lib.RequestContext import get_request_id


def _cfg(key: str, default: Optional[str] = None) -> str:
    """
    AUTH 설정값을 안전하게 읽어오는 헬퍼.

    - 서버 모듈 import 방식(패키지/모듈)과 무관하게 backend.server → server 순으로 탐색한다.
    - 반환: config.ini 의 [AUTH] 섹션에서 주어진 키의 값을 문자열로 반환한다.
      default 가 주어지면 해당 기본값을 허용한다.
    """
    import importlib

    server_mod = None
    for name in ("backend.server", "server"):
        try:
            server_mod = importlib.import_module(name)
            if hasattr(server_mod, "config"):
                break
        except Exception:
            server_mod = None
            continue
    if server_mod is None or not hasattr(server_mod, "config"):
        # last resort: try relative import (package mode)
        try:  # pragma: no cover
            from .. import server as server_mod  # type: ignore
        except Exception:  # pragma: no cover
            import server as server_mod  # type: ignore

    section = server_mod.config["AUTH"]
    return section.get(key, default) if default is not None else section[key]


# Simple in-memory rate limiter (per-process)
class _RateLimiter:
    """
    초간단 인메모리 속도 제한기(프로세스 단위).

    - limit: 허용 횟수(윈도우 내 최대 요청 수)
    - window_sec: 윈도우(초)
    - hit(key): 호출 시 현재 윈도우의 카운트를 검사하고, 초과하면 (False, retry_after) 반환
    """
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
    """
    속도 제한 검사 유틸.

    - 기준 키: 클라이언트 IP(+선택 username) 조합으로 1분(window) 동안 limit 회를 허용한다.
    - 환경변수 AUTH_RATE_LIMIT 로 분당 허용치를 조정할 수 있다(기본 5회/분).
    - 초과 시: 429 상태와 Retry-After 헤더, 표준 오류 응답을 반환한다.
    - 통과 시: None 반환.
    """
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
    """No-op placeholder.

    DB 생성/시드는 별도 스크립트(`backend/scripts/init_templates.py`)에서 수행한다.
    런타임에서는 테이블을 만들거나 변경하지 않는다.
    """
    return


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
    # Optional CSRF requirement for login when configured
    try:
        require_login_csrf = _cfg("login_require_csrf", "false").lower() in ("1", "true", "yes", "on")
    except Exception:
        require_login_csrf = False
    if require_login_csrf:
        csrf_error = _require_csrf(request)
        if csrf_error is not None:
            return csrf_error

    await _ensure_auth_tables()
    body = await request.json()
    username = body.get("username")
    password = body.get("password")
    remember = bool(body.get("rememberMe", False))

    invalid = _validate_input(request, username, password)
    if invalid is not None:
        return invalid

    db = DB.getManager()
    if not db:
        loc = detect_locale(request)
        return JSONResponse(
            status_code=500,
            content=errorResponse(message=i18n_t("db.unavailable", "db unavailable", loc), code="AUTH_500_DB"),
        )
    # db is not None due to check above
    user = await db.fetchOneQuery("tmpl.user.selectByUsername", {"u": username})
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
    if not _verify_password(password, user.get("password_hash") or ""):
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
    db = DB.getManager()
    if not db:
        loc = detect_locale(request)
        return JSONResponse(
            status_code=500,
            content=errorResponse(message=i18n_t("db.unavailable", "db unavailable", loc), code="AUTH_500_DB"),
        )
    
    user = await db.fetchOneQuery("tmpl.user.selectByUsername", {"u": username})
    if not user or not _verify_password(password, user.get("password_hash") or ""):
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
def _verify_password(plain: str, stored: str) -> bool:
    try:
        if stored and stored.startswith("pbkdf2$"):
            parts = stored.split("$")
            iters = int(parts[1])
            salt = base64.b64decode(parts[2])
            expected = base64.b64decode(parts[3])
            dk = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt, iters)
            return hmac.compare_digest(dk, expected)
        # fallback to bcrypt if library available and stored looks like bcrypt
        try:
            return bool(hasattr(bcrypt, "checkpw") and bcrypt.checkpw(plain.encode(), stored.encode()))
        except Exception:
            return False
    except Exception:
        return False
