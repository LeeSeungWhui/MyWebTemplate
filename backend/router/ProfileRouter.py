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
    설명: Pydantic v1/v2 호환으로 payload dict를 추출
    처리 규칙: model_dump 우선, 미지원 시 dict()로 폴백해 직렬화한다.
    반환값: 업데이트 서비스에 바로 전달 가능한 plain dict를 반환한다.
    갱신일: 2026-02-22
    """
    dumpFn = getattr(model, "model_dump", None)
    if callable(dumpFn):
        return dumpFn(exclude_none=excludeNone)
    dictFn = getattr(model, "dict", None)
    if callable(dictFn):
        return dictFn(exclude_none=excludeNone)
    return dict(model)


def resolveServiceErrorCode(exc: Exception) -> str | None:
    """
    설명: 서비스 예외에서 표준 코드 문자열(code/args[0])을 우선순위대로 추출
    처리 규칙: code 속성이 없으면 첫 번째 args 문자열을 사용하고, 둘 다 없으면 None을 반환한다.
    반환값: 표준 에러 코드 문자열 또는 None.
    갱신일: 2026-02-28
    """
    codeValue = getattr(exc, "code", None)
    if isinstance(codeValue, str) and codeValue.strip():
        return codeValue.strip()
    if exc.args:
        firstArg = exc.args[0]
        if isinstance(firstArg, str) and firstArg.strip():
            return firstArg.strip()
    return None


def handleProfileError(exc: Exception) -> JSONResponse:
    """
    설명: 프로필 서비스 예외를 표준 에러 응답(JSONResponse)으로 매핑. 호출 맥락의 제약을 기준으로 동작 기준을 확정
    처리 규칙: DB/권한/입력/사용자없음 코드만 상태코드와 code를 고정 매핑한다.
    실패 동작: 매핑되지 않은 예외 코드는 라우터 상위에서 처리되도록 원본 예외를 다시 발생시킨다.
    반환값: 매핑된 JSONResponse.
    갱신일: 2026-02-28
    """
    errorCode = resolveServiceErrorCode(exc)
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
    설명: 인증 사용자 프로필을 조회. 호출 맥락의 제약을 기준으로 동작 기준을 확정
    실패 동작: 서비스 예외는 handleProfileError에서 표준 코드/상태로 변환한다.
    반환값: successResponse(result=profile) 형태의 JSON 본문을 반환한다.
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
    설명: 인증 사용자 프로필을 수정
    처리 규칙: None 필드는 제외한 payload만 서비스로 전달한다.
    실패 동작: 서비스 예외는 handleProfileError에서 공통 에러 응답으로 변환한다.
    갱신일: 2026-02-22
    """
    try:
        result = await ProfileService.updateMyProfile(user, toModelDict(payload, excludeNone=True))
        return successResponse(result=result, message="updated")
    except Exception as exc:
        return handleProfileError(exc)
