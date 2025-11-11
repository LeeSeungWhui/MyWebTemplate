"""
파일명: backend/router/AuthRouter.py
작성자: LSH
갱신일: 2025-11-11
설명: 인증 API 라우터. HTTP 관심사는 여기서 처리하고, 서비스에는 필요한 데이터(JSON)만 전달한다.
"""

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse, Response

from lib.Auth import getCurrentUser
from lib.Config import getAuth
from lib.I18n import detectLocale, translate as i18nTranslate
from lib.RateLimit import checkRateLimit
from lib.Response import errorResponse, successResponse
from service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/login", status_code=204)
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
    if not isinstance(username, str) or not isinstance(password, str) or len(username) < 3 or len(password) < 8:
        return JSONResponse(
            status_code=422,
            content=errorResponse(message=i18nTranslate("error.invalid_input", "invalid input", loc), code="AUTH_422_INVALID_INPUT"),
            headers={"WWW-Authenticate": "Cookie"},
        )

    user = await AuthService.login(payload)
    if not user:
        limited = checkRateLimit(request, username=username)
        if limited is not None:
            return limited
        return JSONResponse(
            status_code=401,
            content=errorResponse(message=i18nTranslate("error.invalid_credentials", "invalid credentials", loc), code="AUTH_401_INVALID"),
            headers={"WWW-Authenticate": "Cookie"},
        )

    # 세션/CSRF 설정은 라우터에서 처리
    request.session.clear()
    request.session["userId"] = user["username"]
    request.session["name"] = user.get("name") or None
    request.session["csrf"] = AuthService.csrf({}).get("csrf")

    res = Response(status_code=204)
    if remember:
        res.set_cookie("rememberMe", "1", max_age=60 * 60 * 24 * 30, httponly=False)
    return res


@router.post("/logout", status_code=204)
async def logout(request: Request):
    header_name = getAuth("csrf_header", "X-CSRF-Token")
    expected = request.session.get("csrf")
    provided = request.headers.get(header_name)
    if not expected or not provided or expected != provided:
        loc = detectLocale(request)
        return JSONResponse(
            status_code=403,
            content=errorResponse(message=i18nTranslate("error.csrf_required", "csrf required", loc), code="AUTH_403_CSRF_REQUIRED"),
            headers={"WWW-Authenticate": "Cookie"},
        )
    _uid = request.session.get("userId")
    request.session.clear()
    res = Response(status_code=204)
    session_cookie = getAuth("session_cookie", "sid")
    res.delete_cookie(session_cookie)
    return res


@router.get("/session")
async def get_session(request: Request):
    payload = {"userId": request.session.get("userId"), "name": request.session.get("name")}
    result = AuthService.session(payload)
    resp = successResponse(result=result)
    r = JSONResponse(content=resp, status_code=200)
    r.headers["Cache-Control"] = "no-store"
    return r


@router.post("/token")
async def issue_token(request: Request):
    body = await request.json()
    payload = {
        "username": body.get("username"),
        "password": body.get("password"),
    }

    loc = detectLocale(request)
    username = payload.get("username")
    password = payload.get("password")
    if not isinstance(username, str) or not isinstance(password, str) or len(username) < 3 or len(password) < 8:
        res = JSONResponse(
            status_code=422,
            content=errorResponse(message=i18nTranslate("error.invalid_input", "invalid input", loc), code="AUTH_422_INVALID_INPUT"),
        )
        res.headers["WWW-Authenticate"] = "Bearer"
        return res

    data = await AuthService.token(payload)
    if not data:
        limited = checkRateLimit(request, username=username)
        if limited is not None:
            return limited
        res = JSONResponse(
            status_code=401,
            content=errorResponse(message=i18nTranslate("error.invalid_credentials", "invalid credentials", loc), code="AUTH_401_INVALID"),
        )
        res.headers["WWW-Authenticate"] = "Bearer"
        return res
    return JSONResponse(content=data, status_code=200)


@router.get("/csrf")
async def issue_csrf(request: Request):
    payload = {"csrf": request.session.get("csrf")}
    csrf_result = AuthService.csrf(payload)
    request.session["csrf"] = csrf_result["csrf"]
    return successResponse(result=csrf_result)


@router.get("/me")
async def me(user=Depends(getCurrentUser)):
    return await AuthService.me(user)
