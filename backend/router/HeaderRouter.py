"""
?뚯씪: backend/router/HeaderDataRouter.py
?묒꽦: Codex CLI
媛깆떊: 2025-09-07
?ㅻ챸: Header Data API (GET/POST) with ETag, CSRF (cookie-mode), and auth via Session or Bearer.
"""

from typing import Dict, List, Optional, Tuple

from fastapi import APIRouter, Header, Request
from fastapi.responses import JSONResponse, Response

from lib.Auth import AuthConfig
from lib.Logger import logger
from lib.Response import errorResponse, successResponse
from backend.service.HeaderService import (
    ALLOWED_KEYS,
    ensure_tables,
    list_header_data,
    upsert_header_data,
)


router = APIRouter(prefix="/api/v1", tags=["header-data"])


def _get_user_id(request: Request) -> Tuple[Optional[str], bool]:
    """
    Returns (userId, is_bearer). If bearer token present, use tokenData.username.
    Else, use session["userId"]. None if unauthenticated.
    """
    # Bearer?
    authz = request.headers.get("Authorization") or ""
    if authz.lower().startswith("bearer "):
        try:
            from jose import JWTError, jwt
            token = authz.split(" ", 1)[1]
            payload = jwt.decode(token, AuthConfig.SECRET_KEY, algorithms=[AuthConfig.ALGORITHM])
            sub = payload.get("sub")
            if not sub:
                return None, False
            return str(sub), True
        except Exception:
            return None, False
    # Session
    user_id = request.session.get("userId")
    if user_id:
        return str(user_id), False
    return None, False


@router.get("/header-data")
async def get_header_data(request: Request, keys: Optional[str] = None, if_none_match: Optional[str] = Header(None)):
    await ensure_tables()
    user_id, _is_bearer = _get_user_id(request)
    if not user_id:
        # unauthorized: choose realm header based on Authorization presence
        realm = "Bearer" if (request.headers.get("Authorization") or "").lower().startswith("bearer ") else "Cookie"
        return JSONResponse(
            status_code=401,
            headers={"WWW-Authenticate": realm},
            content=errorResponse(message="unauthorized", code="HD_401_UNAUTHORIZED"),
        )

    key_list = []  # type: List[str]
    if keys:
        key_list = [k.strip() for k in keys.split(",") if k.strip()]
    else:
        key_list = sorted(ALLOWED_KEYS)

    # validate keys
    for k in key_list:
        if k not in ALLOWED_KEYS:
            return JSONResponse(
                status_code=400,
                content=errorResponse(message="invalid key", code="HD_400_INVALID_KEY"),
            )

    result, etag = await list_header_data(user_id, key_list)
    if if_none_match and if_none_match == etag:
        resp = Response(status_code=304)
        resp.headers["ETag"] = etag
        resp.headers["Cache-Control"] = "private, max-age=60"
        return resp

    payload = successResponse(result=result)
    try:
        payload["count"] = len(result)
    except Exception:
        pass
    response = JSONResponse(content=payload, status_code=200)
    response.headers["ETag"] = etag
    response.headers["Cache-Control"] = "private, max-age=60"
    return response


@router.post("/header-data")
async def post_header_data(request: Request):
    await ensure_tables()
    user_id, is_bearer = _get_user_id(request)
    if not user_id:
        realm = "Bearer" if (request.headers.get("Authorization") or "").lower().startswith("bearer ") else "Cookie"
        return JSONResponse(
            status_code=401,
            headers={"WWW-Authenticate": realm},
            content=errorResponse(message="unauthorized", code="HD_401_UNAUTHORIZED"),
        )

    # CSRF required only for cookie-mode
    if not is_bearer:
        # header name from config
        try:
            from .. import server as server_mod
        except Exception:
            import server as server_mod
        csrf_header_name = server_mod.config["AUTH"].get("csrf_header", "X-CSRF-Token")
        csrf_val = request.headers.get(csrf_header_name)
        if not csrf_val or csrf_val != request.session.get("csrf"):
            return JSONResponse(
                status_code=403,
                content=errorResponse(message="CSRF required", code="AUTH_403_CSRF_REQUIRED"),
            )

    try:
        body = await request.json()
    except Exception:
        return JSONResponse(status_code=422, content=errorResponse(message="invalid body", code="HD_422_BODY"))

    key = body.get("key")
    value = body.get("value")
    if key not in ALLOWED_KEYS or not isinstance(value, dict) or not isinstance(value.get("code"), str) or not value.get("code"):
        return JSONResponse(status_code=400, content=errorResponse(message="invalid input", code="HD_400_INPUT"))

    await upsert_header_data(user_id, key, value)

    payload = successResponse(result={"key": key, "value": value})
    return JSONResponse(content=payload, status_code=200)

