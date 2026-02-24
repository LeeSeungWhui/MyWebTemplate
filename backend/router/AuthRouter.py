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


def isSecureRequest(request: Request) -> bool:
    """
    설명: 프록시 환경을 포함해 HTTPS 요청 여부를 판정한다.
    갱신일: 2026-02-24
    """
    scheme = str(getattr(request.url, "scheme", "") or "").strip().lower()
    if scheme == "https":
        return True

    forwardedProto = request.headers.get("X-Forwarded-Proto", "")
    forwardedFirst = str(forwardedProto).split(",")[0].strip().lower()
    if forwardedFirst == "https":
        return True
    if str(request.headers.get("X-Forwarded-Ssl", "")).strip().lower() == "on":
        return True
    if str(request.headers.get("Front-End-Https", "")).strip().lower() == "on":
        return True
    if os.getenv("ENV", "").strip().lower() == "prod":
        return True
    return False


def cookieOptions(request: Request, name: str, value: str, maxAge: int | None = None) -> dict:
    """
    설명: 인증 쿠키(HttpOnly/SameSite/Secure) 기본 옵션을 구성한다.
    갱신일: 2026-02-24
    """
    opts = {
        "key": name,
        "value": value,
        "httponly": True,
        "samesite": "lax",
        "secure": isSecureRequest(request),
        "path": "/",
    }
    if maxAge:
        opts["max_age"] = maxAge
    return opts


def clearAuthCookies(response: JSONResponse | Response, request: Request) -> None:
    """
    설명: 인증 쿠키(access/refresh)를 현재 보안 옵션으로 제거한다.
    갱신일: 2026-02-24
    """
    secure = isSecureRequest(request)
    response.delete_cookie(AuthConfig.accessCookieName, path="/", httponly=True, samesite="lax", secure=secure)
    response.delete_cookie(AuthConfig.refreshCookieName, path="/", httponly=True, samesite="lax", secure=secure)


def invalidInputResponse(loc: str, includeAuthHeader: bool = False) -> JSONResponse:
    """
    설명: 잘못된 JSON/입력 형식에 대한 422 표준 응답을 생성한다.
    갱신일: 2026-02-23
    """
    headers = {"WWW-Authenticate": "Bearer"} if includeAuthHeader else None
    return JSONResponse(
        status_code=422,
        content=errorResponse(
            message=i18nTranslate("error.invalid_input", "invalid input", loc),
            code="AUTH_422_INVALID_INPUT",
        ),
        headers=headers,
    )


async def parseJsonBody(request: Request) -> dict | None:
    """
    설명: 요청 본문을 JSON(dict)로 파싱하고 실패 시 None을 반환한다.
    갱신일: 2026-02-23
    """
    try:
        body = await request.json()
    except Exception:
        return None
    if not isinstance(body, dict):
        return None
    return body


@router.post("/login")
async def login(request: Request):
    """
    설명: 로그인 요청을 처리하고 Access/Refresh 쿠키를 발급한다.
    갱신일: 2026-02-22
    """
    loc = detectLocale(request)
    body = await parseJsonBody(request)
    if body is None:
        return invalidInputResponse(loc, includeAuthHeader=True)
    payload = {
        "username": body.get("username"),
        "password": body.get("password"),
    }
    remember = bool(body.get("rememberMe", False))

    # 간단 입력 검증
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
        "accessToken": tokenPayload["accessToken"],
        "tokenType": tokenPayload["tokenType"],
        "expiresIn": tokenPayload["expiresIn"],
        "refreshExpiresIn": tokenPayload["refreshExpiresIn"],
    }))
    response.headers["Cache-Control"] = "no-store"
    response.set_cookie(**cookieOptions(request, AuthConfig.accessCookieName, tokenPayload["accessToken"], maxAge=accessMaxAge))
    response.set_cookie(**cookieOptions(request, AuthConfig.refreshCookieName, tokenPayload["refreshToken"], maxAge=refreshMaxAge))
    return response


@router.post("/signup")
async def signup(request: Request):
    """
    설명: 회원가입 요청을 검증하고 신규 계정을 생성한다.
    갱신일: 2026-02-22
    """
    loc = detectLocale(request)
    body = await parseJsonBody(request)
    if body is None:
        return invalidInputResponse(loc)
    payload = {
        "name": body.get("name"),
        "email": body.get("email"),
        "password": body.get("password"),
    }
    result, errorCode = await AuthService.signup(payload)
    if errorCode:
        statusCode = 500
        message = i18nTranslate("error.server_error", "server error", loc)
        if errorCode == "AUTH_422_INVALID_INPUT":
            statusCode = 422
            message = i18nTranslate("error.invalid_input", "invalid input", loc)
        elif errorCode == "AUTH_409_USER_EXISTS":
            statusCode = 409
            message = i18nTranslate("auth.user_exists", "user already exists", loc)
        elif errorCode == "AUTH_503_DB_NOT_READY":
            statusCode = 503
            message = i18nTranslate("error.db_not_ready", "database not ready", loc)
        return JSONResponse(status_code=statusCode, content=errorResponse(message=message, code=errorCode))

    response = JSONResponse(status_code=201, content=successResponse(result=result))
    response.headers["Cache-Control"] = "no-store"
    return response


@router.post("/refresh")
async def refresh(request: Request):
    """
    설명: refresh_token 쿠키로 Access/Refresh 토큰을 재발급한다.
    갱신일: 2026-02-22
    """
    refreshToken = request.cookies.get(AuthConfig.refreshCookieName)
    loc = detectLocale(request)
    if not refreshToken:
        response = JSONResponse(
            status_code=401,
            content=errorResponse(
                message=i18nTranslate("auth.refresh_missing", "refresh token missing", loc),
                code="AUTH_401_INVALID",
            ),
            headers={"WWW-Authenticate": "Bearer"},
        )
        # 브라우저 쿠키가 꼬인 상태(스테일 refresh 등)에서 무한 루프를 방지하기 위해 쿠키를 정리한다.
        clearAuthCookies(response, request)
        response.headers["Cache-Control"] = "no-store"
        return response
    tokenPayload = await AuthService.refresh(refreshToken)
    if not tokenPayload:
        response = JSONResponse(
            status_code=401,
            content=errorResponse(
                message=i18nTranslate("auth.refresh_invalid", "invalid refresh token", loc),
                code="AUTH_401_INVALID",
            ),
            headers={"WWW-Authenticate": "Bearer"},
        )
        clearAuthCookies(response, request)
        response.headers["Cache-Control"] = "no-store"
        return response
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
                "accessToken": tokenPayload["accessToken"],
                "tokenType": tokenPayload["tokenType"],
                "expiresIn": tokenPayload["expiresIn"],
                "refreshExpiresIn": tokenPayload["refreshExpiresIn"],
            }
        ),
    )
    response.headers["Cache-Control"] = "no-store"
    response.set_cookie(**cookieOptions(request, AuthConfig.accessCookieName, tokenPayload["accessToken"], maxAge=accessMaxAge))
    response.set_cookie(**cookieOptions(request, AuthConfig.refreshCookieName, tokenPayload["refreshToken"], maxAge=refreshMaxAge))
    return response


@router.post("/logout", status_code=204)
async def logout(request: Request):
    """
    설명: 로그아웃 처리 후 인증 쿠키를 제거한다.
    갱신일: 2026-02-22
    """
    refreshToken = request.cookies.get(AuthConfig.refreshCookieName)
    await AuthService.revokeRefreshToken(refreshToken)
    response = Response(status_code=204)
    clearAuthCookies(response, request)
    return response


@router.get("/me")
async def me(request: Request, user=Depends(getCurrentUser)):
    """
    설명: 현재 인증 사용자 정보를 조회한다.
    갱신일: 2026-02-22
    """
    result = await AuthService.me(user)
    response = JSONResponse(content=result, status_code=200)
    response.headers["Cache-Control"] = "no-store"
    return response
