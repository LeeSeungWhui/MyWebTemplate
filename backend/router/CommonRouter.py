"""
파일명: backend/router/CommonRouter.py
작성자: LSH
갱신일: 2025-11-11
설명: 공통(헬스/레디니스) 라우터. 서비스에는 필요한 데이터만 전달한다.
"""

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from lib.I18n import detect_locale, t as i18n_t
from lib.Response import errorResponse, successResponse
from service import CommonService

router = APIRouter(tags=["common"])


@router.get("/healthz")
async def healthz(request: Request):
    result = await CommonService.build_healthz_result()
    resp = successResponse(result=result)
    r = JSONResponse(content=resp, status_code=200)
    r.headers["Cache-Control"] = "no-store"
    return r


@router.get("/readyz")
async def readyz(request: Request):
    result, ok = await CommonService.build_readyz_checks()
    if ok:
        resp = successResponse(result=result)
        status = 200
    else:
        loc = detect_locale(request)
        resp = errorResponse(message=i18n_t("obs.not_ready", "not ready", loc), result=result, code="OBS_503_NOT_READY")
        status = 503
    r = JSONResponse(content=resp, status_code=status)
    r.headers["Cache-Control"] = "no-store"
    return r
