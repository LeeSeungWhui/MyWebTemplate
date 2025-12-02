"""
파일명: backend/router/AuthRouter.py
작성자: LSH
갱신일: 2025-11-XX
설명: 인증 API 라우터. Access/Refresh 쿠키 기반 토큰 흐름을 담당한다.
"""

import os

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse, Response

from lib.Auth import AuthConfig, getCurrentUser
from lib.I18n import detectLocale, translate as i18nTranslate
from lib.RateLimit import checkRateLimit
from lib.Response import errorResponse, successResponse
from service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def cookieOptions(name: str, value: str, maxAge: int | None = None) -> dict:
    """HttpOnly 쿠키 옵션 공통 적용."""
    opts = {
        "key": name,
        "value": value,
        "httponly": True,
        "samesite": "lax",
        "secure": os.getenv("ENV", "dev").lower() == "prod",
        "path": "/",
    }
    if maxAge:
        opts["max_age"] = maxAge
    return opts


@router.post("/login")
async def login(request: Request):
    body = await request.json()
    payload = {
        "username": body.get("username"),
        "password": body.get("password"),
    }
    remember = bool(body.get("rememberMe", False))

    # 간단 입력 검증
    loc = detectLocale(request)
    username = payload.get("username")
    password = payload.get("password")
    is_short_username = not isinstance(username, str) or len(username) < 3
    is_short_password = not isinstance(password, str) or len(password) < 8
    if is_short_username or is_short_password:
        return JSONResponse(
            status_code=422,
            content=errorResponse(message=i18nTranslate("error.invalid_input", "invalid input", loc), code="AUTH_422_INVALID_INPUT"),
            headers={"WWW-Authenticate": "Bearer"},
        )

    authResult = await AuthService.login(payload, remember)
    if not authResult:
        limited = checkRateLimit(request, username=username)
        if limited is not None:
            return limited
        return JSONResponse(
            status_code=401,
            content=errorResponse(message=i18nTranslate("error.invalid_credentials", "invalid credentials", loc), code="AUTH_401_INVALID"),
            headers={"WWW-Authenticate": "Bearer"},
        )

    tokenPayload = authResult["token"]
    accessMaxAge = AuthConfig.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    refreshMaxAge = (
        AuthConfig.REFRESH_TOKEN_EXPIRE_MINUTES * 60
        if tokenPayload.get("remember")
        else None
    )

    res = JSONResponse(status_code=200, content=successResponse(result={
        "access_token": tokenPayload["access_token"],
        "token_type": tokenPayload["token_type"],
        "expires_in": tokenPayload["expires_in"],
        "refresh_expires_in": tokenPayload["refresh_expires_in"],
    }))
    res.headers["Cache-Control"] = "no-store"
    res.set_cookie(**cookieOptions(AuthConfig.ACCESS_COOKIE_NAME, tokenPayload["access_token"], maxAge=accessMaxAge))
    res.set_cookie(**cookieOptions(AuthConfig.REFRESH_COOKIE_NAME, tokenPayload["refresh_token"], maxAge=refreshMaxAge))
    return res


@router.post("/refresh")
async def refresh(request: Request):
    refreshToken = request.cookies.get(AuthConfig.REFRESH_COOKIE_NAME)
    if not refreshToken:
        return JSONResponse(
            status_code=401,
            content=errorResponse(message="refresh token missing", code="AUTH_401_INVALID"),
            headers={"WWW-Authenticate": "Bearer"},
        )
    tokenPayload = await AuthService.refresh(refreshToken)
    if not tokenPayload:
        return JSONResponse(
            status_code=401,
            content=errorResponse(message="invalid refresh token", code="AUTH_401_INVALID"),
            headers={"WWW-Authenticate": "Bearer"},
        )
    accessMaxAge = AuthConfig.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    refreshMaxAge = (
        AuthConfig.REFRESH_TOKEN_EXPIRE_MINUTES * 60
        if tokenPayload.get("remember")
        else None
    )
    res = JSONResponse(
        status_code=200,
        content=successResponse(
            result={
                "access_token": tokenPayload["access_token"],
                "token_type": tokenPayload["token_type"],
                "expires_in": tokenPayload["expires_in"],
                "refresh_expires_in": tokenPayload["refresh_expires_in"],
            }
        ),
    )
    res.headers["Cache-Control"] = "no-store"
    res.set_cookie(**cookieOptions(AuthConfig.ACCESS_COOKIE_NAME, tokenPayload["access_token"], maxAge=accessMaxAge))
    res.set_cookie(**cookieOptions(AuthConfig.REFRESH_COOKIE_NAME, tokenPayload["refresh_token"], maxAge=refreshMaxAge))
    return res


@router.post("/logout", status_code=204)
async def logout():
    res = Response(status_code=204)
    res.delete_cookie(AuthConfig.ACCESS_COOKIE_NAME, path="/")
    res.delete_cookie(AuthConfig.REFRESH_COOKIE_NAME, path="/")
    return res


@router.get("/me")
async def me(user=Depends(getCurrentUser)):
    return await AuthService.me(user)
