"""
파일명: backend/router/CommonRouter.py
작성자: LSH
갱신일: 2025-09-07
설명: 공통(헬스/레디니스) 라우터. 서비스 계층 호출만 수행.
"""

from fastapi import APIRouter, Request

from service import CommonService

router = APIRouter(tags=["common"])


@router.get("/healthz")
async def healthz(request: Request):
    return await CommonService.healthz(request)


@router.get("/readyz")
async def readyz(request: Request):
    return await CommonService.readyz(request)
