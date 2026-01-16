"""
파일명: backend/router/AuthRouter.py
작성자: LSH
갱신일: 2025-12-03
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
    isShortUsername = not isinstance(username, str) or len(username) < 3
    isShortPassword = not isinstance(password, str) or len(password) < 8
    if isShortUsername or isShortPassword:
        return JSONResponse(
            status_code=422,
            content=errorResponse(message=i18nTranslate("error.invalid_input", "invalid input", loc), code="AUTH_422_INVALID_INPUT"),
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 레이트리밋(선체크): 이미 초과된 상태면 인증 로직(쿼리/해시)을 타기 전에 차단한다.
    limited = checkRateLimit(request, username=username, commit=False)
    if limited is not None:
        return limited

    authResult = await AuthService.login(payload, remember)
    if not authResult:
        # 레이트리밋(실패 기록): 로그인 실패 시에만 카운트를 증가시킨다.
        limited = checkRateLimit(request, username=username, commit=True)
        if limited is not None:
            return limited
        return JSONResponse(
            status_code=401,
            content=errorResponse(message=i18nTranslate("error.invalid_credentials", "invalid credentials", loc), code="AUTH_401_INVALID"),
            headers={"WWW-Authenticate": "Bearer"},
        )

    tokenPayload = authResult["token"]
    accessMaxAge = AuthConfig.accessTokenExpireMinutes * 60
    refreshMaxAge = (
        AuthConfig.refreshTokenExpireMinutes * 60
        if tokenPayload.get("remember")
        else None
    )

    response = JSONResponse(status_code=200, content=successResponse(result={
        "access_token": tokenPayload["access_token"],
        "token_type": tokenPayload["token_type"],
        "expires_in": tokenPayload["expires_in"],
        "refresh_expires_in": tokenPayload["refresh_expires_in"],
    }))
    response.headers["Cache-Control"] = "no-store"
    response.set_cookie(**cookieOptions(AuthConfig.accessCookieName, tokenPayload["access_token"], maxAge=accessMaxAge))
    response.set_cookie(**cookieOptions(AuthConfig.refreshCookieName, tokenPayload["refresh_token"], maxAge=refreshMaxAge))
    return response


@router.post("/refresh")
async def refresh(request: Request):
    refreshToken = request.cookies.get(AuthConfig.refreshCookieName)
    loc = detectLocale(request)
    if not refreshToken:
        return JSONResponse(
            status_code=401,
            content=errorResponse(
                message=i18nTranslate("auth.refresh_missing", "refresh token missing", loc),
                code="AUTH_401_INVALID",
            ),
            headers={"WWW-Authenticate": "Bearer"},
        )
    tokenPayload = await AuthService.refresh(refreshToken)
    if not tokenPayload:
        return JSONResponse(
            status_code=401,
            content=errorResponse(
                message=i18nTranslate("auth.refresh_invalid", "invalid refresh token", loc),
                code="AUTH_401_INVALID",
            ),
            headers={"WWW-Authenticate": "Bearer"},
        )
    accessMaxAge = AuthConfig.accessTokenExpireMinutes * 60
    refreshMaxAge = (
        AuthConfig.refreshTokenExpireMinutes * 60
        if tokenPayload.get("remember")
        else None
    )
    response = JSONResponse(
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
    response.headers["Cache-Control"] = "no-store"
    response.set_cookie(**cookieOptions(AuthConfig.accessCookieName, tokenPayload["access_token"], maxAge=accessMaxAge))
    response.set_cookie(**cookieOptions(AuthConfig.refreshCookieName, tokenPayload["refresh_token"], maxAge=refreshMaxAge))
    return response


@router.post("/logout", status_code=204)
async def logout(request: Request):
    refreshToken = request.cookies.get(AuthConfig.refreshCookieName)
    AuthService.revokeRefreshToken(refreshToken)
    response = Response(status_code=204)
    response.delete_cookie(AuthConfig.accessCookieName, path="/")
    response.delete_cookie(AuthConfig.refreshCookieName, path="/")
    return response


@router.get("/me")
async def me(request: Request, user=Depends(getCurrentUser)):
    result = await AuthService.me(user)
    response = JSONResponse(content=result, status_code=200)
    response.headers["Cache-Control"] = "no-store"
    return response
