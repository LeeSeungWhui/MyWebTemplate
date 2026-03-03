"""
파일명: backend/router/ProfileRouter.py
작성자: LSH
갱신일: 2026-02-22
설명: /api/v1/profile/me 조회/수정 API 라우터
"""

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from lib.Auth import getCurrentUser
from lib.Response import successResponse
from lib.ServiceError import buildMappedErrorResponse
from service import ProfileService

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])


class ProfileUpdatePayload(BaseModel):
    userNm: str | None = None
    notifyEmail: bool | None = None
    notifySms: bool | None = None
    notifyPush: bool | None = None


def toModelDict(model: BaseModel, *, excludeNone: bool = False) -> dict:
    """
    설명: Pydantic payload를 dict로 추출
    처리 규칙: model_dump(exclude_none=...)로 서비스 입력을 직렬화
    반환값: 업데이트 서비스에 바로 전달 가능한 plain dict를 반환
    갱신일: 2026-02-22
    """
    return model.model_dump(exclude_none=excludeNone)


def handleProfileError(exc: Exception) -> JSONResponse:
    """
    설명: 프로필 서비스 예외를 표준 에러 응답(JSONResponse)으로 매핑. 호출 맥락의 제약을 기준으로 동작 기준 확정
    처리 규칙: DB/권한/입력/사용자없음 코드만 상태코드와 code를 고정 매핑
    실패 동작: 매핑되지 않은 예외 코드는 라우터 상위에서 처리되도록 원본 예외를 다시 발생시킨
    반환값: 매핑된 JSONResponse
    갱신일: 2026-02-28
    """
    mappedResponse = buildMappedErrorResponse(exc, includeNoStore=True)
    if mappedResponse is not None:
        return mappedResponse
    raise exc


@router.get("/me")
async def getMyProfile(user=Depends(getCurrentUser)):
    """
    설명: 인증 사용자 프로필을 조회. 호출 맥락의 제약을 기준으로 동작 기준 확정
    실패 동작: 서비스 예외는 handleProfileError에서 표준 코드/상태로 변환
    반환값: successResponse(result=profile) 형태의 JSON 본문을 반환
    갱신일: 2026-02-22
    """
    try:
        result = await ProfileService.getMyProfile(user)
        response = JSONResponse(status_code=200, content=successResponse(result=result))
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as exc:
        return handleProfileError(exc)


@router.put("/me")
async def updateMyProfile(payload: ProfileUpdatePayload, user=Depends(getCurrentUser)):
    """
    설명: 인증 사용자 프로필 수정
    처리 규칙: None 필드는 제외한 payload만 서비스로 전달
    실패 동작: 서비스 예외는 handleProfileError에서 공통 에러 응답으로 변환
    갱신일: 2026-02-22
    """
    try:
        result = await ProfileService.updateMyProfile(user, toModelDict(payload, excludeNone=True))
        response = JSONResponse(
            status_code=200,
            content=successResponse(result=result, message="updated"),
        )
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as exc:
        return handleProfileError(exc)
