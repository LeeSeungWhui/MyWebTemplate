"""
파일: backend/service/AuthService.py
작성: LSH
설명: 인증 도메인 서비스. 라우터에서 호출되어 로그인/로그아웃/토큰 발급 등 처리.
"""

import json
import uuid
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
from lib.Config import get_auth
from lib.RateLimit import check_rate_limit


# 설정/레이트리밋은 lib 모듈로 이동하여 재사용한다.


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
    header_name = get_auth("csrf_header", "X-CSRF-Token")
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
        require_login_csrf = get_auth("login_require_csrf", "false").lower() in ("1", "true", "yes", "on")
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
        limited = check_rate_limit(request, username=username)
        if limited is not None:
            return limited
        return JSONResponse(
            status_code=401,
            content=errorResponse(message=i18n_t("error.invalid_credentials", "invalid credentials", detect_locale(request)), code="AUTH_401_INVALID"),
            headers={"WWW-Authenticate": "Cookie"},
        )
    if not _verify_password(password, user.get("password_hash") or ""):
        logger.info("auth.login.fail password")
        limited = check_rate_limit(request, username=username)
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
    session_cookie = get_auth("session_cookie", "sid")
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
        limited = check_rate_limit(request, username=username)
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
