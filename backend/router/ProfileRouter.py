"""
파일명: backend/router/ProfileRouter.py
작성자: LSH
갱신일: 2026-02-22
설명: /api/v1/profile/me 조회/수정 API 라우터.
"""

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from lib.Auth import getCurrentUser
from lib.Response import errorResponse, successResponse
from service import ProfileService

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])


class ProfileUpdatePayload(BaseModel):
    userNm: str | None = None
    notifyEmail: bool | None = None
    notifySms: bool | None = None
    notifyPush: bool | None = None


def toModelDict(model: BaseModel, *, excludeNone: bool = False) -> dict:
    """
    설명: Pydantic v1/v2 호환으로 payload dict를 추출한다.
    갱신일: 2026-02-22
    """
    dumpFn = getattr(model, "model_dump", None)
    if callable(dumpFn):
        return dumpFn(exclude_none=excludeNone)
    dictFn = getattr(model, "dict", None)
    if callable(dictFn):
        return dictFn(exclude_none=excludeNone)
    return dict(model)


def handleProfileError(exc: Exception) -> JSONResponse:
    """
    설명: 프로필 API 공통 예외를 표준 응답으로 변환한다.
    갱신일: 2026-02-22
    """
    errorCode = str(exc)
    if errorCode == "DB_NOT_READY":
        return JSONResponse(
            status_code=503,
            content=errorResponse(message="database not ready", code="DB_503_NOT_READY"),
        )
    if errorCode == "AUTH_422_INVALID_INPUT":
        return JSONResponse(
            status_code=422,
            content=errorResponse(message="invalid input", code="AUTH_422_INVALID_INPUT"),
        )
    if errorCode == "AUTH_403_FORBIDDEN":
        return JSONResponse(
            status_code=403,
            content=errorResponse(message="forbidden", code="AUTH_403_FORBIDDEN"),
        )
    if errorCode == "AUTH_404_USER_NOT_FOUND":
        return JSONResponse(
            status_code=404,
            content=errorResponse(message="user not found", code="AUTH_404_USER_NOT_FOUND"),
        )
    raise exc


@router.get("/me")
async def getMyProfile(user=Depends(getCurrentUser)):
    """
    설명: 인증 사용자 프로필을 조회한다.
    갱신일: 2026-02-22
    """
    try:
        result = await ProfileService.getMyProfile(user)
        return successResponse(result=result)
    except Exception as exc:
        return handleProfileError(exc)


@router.put("/me")
async def updateMyProfile(payload: ProfileUpdatePayload, user=Depends(getCurrentUser)):
    """
    설명: 인증 사용자 프로필을 수정한다.
    갱신일: 2026-02-22
    """
    try:
        result = await ProfileService.updateMyProfile(user, toModelDict(payload, excludeNone=True))
        return successResponse(result=result, message="updated")
    except Exception as exc:
        return handleProfileError(exc)
