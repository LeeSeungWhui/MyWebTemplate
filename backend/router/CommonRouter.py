"""
파일명: backend/router/CommonRouter.py
작성자: LSH
갱신일: 2025-11-11
설명: 공통(헬스/레디니스) 라우터. 서비스에는 필요한 데이터만 전달
"""

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from lib.I18n import detectLocale, translate as i18nTranslate
from lib.Response import errorResponse, successResponse
from service import CommonService

router = APIRouter(tags=["common"])


@router.get("/healthz")
async def healthz(request: Request):
    """
    설명: 프로세스 헬스 체크 응답을 반환. 호출 맥락의 제약을 기준으로 동작 기준을 확정
    처리 규칙: service 결과를 표준 successResponse로 감싼 뒤 no-store 헤더를 강제한다.
    반환값: status=200 JSONResponse를 반환한다.
    갱신일: 2026-02-24
    """
    result = await CommonService.healthz({})
    resp = successResponse(result=result)
    r = JSONResponse(content=resp, status_code=200)
    r.headers["Cache-Control"] = "no-store"
    return r


@router.get("/readyz")
async def readyz(request: Request):
    """
    설명: 레디니스 체크 결과를 상태코드와 함께 반환. 호출 맥락의 제약을 기준으로 동작 기준을 확정
    갱신일: 2026-02-24
    """
    result, isReady = await CommonService.readyz({})
    if isReady:
        resp = successResponse(result=result)
        status = 200
    else:
        loc = detectLocale(request)
        resp = errorResponse(message=i18nTranslate("obs.not_ready", "not ready", loc), result=result, code="OBS_503_NOT_READY")
        status = 503
    r = JSONResponse(content=resp, status_code=status)
    r.headers["Cache-Control"] = "no-store"
    return r
