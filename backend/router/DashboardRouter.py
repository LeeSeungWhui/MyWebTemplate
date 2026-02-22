"""
파일명: backend/router/DashboardRouter.py
작성자: Codex
갱신일: 2025-11-XX
설명: 대시보드용 T_DATA 목록/집계 API. 토큰 인증 후 서비스 계층을 통해 조회한다.
"""

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from lib.Auth import getCurrentUser
from lib.Response import errorResponse, successResponse
from service import DashboardService

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("/list")
async def listDataTemplates(limit: int = 50, offset: int = 0, user=Depends(getCurrentUser)):
    try:
        result = await DashboardService.listDataTemplates(limit, offset)
        return successResponse(result=result)
    except RuntimeError as e:
        if str(e) == "DB_NOT_READY":
            return JSONResponse(
                status_code=503,
                content=errorResponse(message="database not ready", code="DB_503_NOT_READY"),
            )
        raise


@router.get("/stats")
async def dataTemplateStats(user=Depends(getCurrentUser)):
    try:
        result = await DashboardService.dataTemplateStats()
        return successResponse(result=result)
    except RuntimeError as e:
        if str(e) == "DB_NOT_READY":
            return JSONResponse(
                status_code=503,
                content=errorResponse(message="database not ready", code="DB_503_NOT_READY"),
            )
        raise
