"""
파일명: backend/router/DashboardRouter.py
작성자: LSH
갱신일: 2026-02-22
설명: 대시보드용 T_DATA 목록/상세/CRUD/집계 API. 토큰 인증 후 서비스 계층을 통해 처리
"""

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from lib.Auth import getCurrentUser
from lib.Response import successResponse
from lib.ServiceError import buildMappedErrorResponse
from service import DashboardService

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


class DashboardCreatePayload(BaseModel):
    title: str
    description: str | None = None
    status: str
    amount: float | None = None
    tags: list[str] | str | None = None


class DashboardUpdatePayload(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    amount: float | None = None
    tags: list[str] | str | None = None


def toModelDict(model: BaseModel, *, excludeNone: bool = False) -> dict:
    """
    설명: Pydantic payload를 dict로 추출
    반환값: model_dump(dict) 결과를 표준 dict로 통일한 값
    갱신일: 2026-02-22
    """
    return model.model_dump(exclude_none=excludeNone)


def handleDashboardError(exc: Exception) -> JSONResponse:
    """
    설명: 대시보드 서비스 코드(DB_NOT_READY/422/404/500)를 HTTP 에러 응답으로 매핑하 변환기
    처리 규칙: 정의된 코드만 고정 매핑하고, 미정의 예외는 상위 핸들러로 재전파
    반환값: 매핑된 JSONResponse
    갱신일: 2026-02-22
    """
    mappedResponse = buildMappedErrorResponse(exc, includeNoStore=True)
    if mappedResponse is not None:
        return mappedResponse
    raise exc


@router.get("")
async def listDataTemplates(
    q: str | None = None,
    status: str | None = None,
    page: int | None = None,
    size: int | None = None,
    sort: str | None = None,
    limit: int | None = None,
    offset: int | None = None,
    user=Depends(getCurrentUser),
):
    """
    설명: 목록 쿼리 파라미터를 서비스로 위임하고 응답 본문(meta 포함)으로 직렬화하 라우터
    실패 동작: 서비스 예외는 handleDashboardError에서 코드별 HTTP 응답으로 변환
    갱신일: 2026-02-22
    """
    try:
        result = await DashboardService.listDataTemplates(
            userId=user.username,
            limit=limit,
            offset=offset,
            q=q,
            status=status,
            page=page,
            size=size,
            sort=sort,
        )
        body = successResponse(result=result["items"])
        body["count"] = result["total"]
        body["meta"] = {
            "page": result["page"],
            "size": result["size"],
            "limit": result["limit"],
            "offset": result["offset"],
            "sort": result["sort"],
            "q": result["q"],
            "status": result["status"],
        }
        response = JSONResponse(status_code=200, content=body)
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as exc:
        return handleDashboardError(exc)


@router.get("/stats")
async def dataTemplateStats(user=Depends(getCurrentUser)):
    """
    설명: 상태별 집계 서비스 결과를 successResponse로 노출하는 통계 조회 엔드포인트
    반환값: 상태별 count/amount 집계 리스트를 담은 successResponse
    갱신일: 2026-02-22
    """
    try:
        result = await DashboardService.dataTemplateStats(userId=user.username)
        response = JSONResponse(status_code=200, content=successResponse(result=result))
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as exc:
        return handleDashboardError(exc)


@router.get("/{dataId}")
async def getDataTemplateDetail(dataId: int, user=Depends(getCurrentUser)):
    """
    설명: 단건 상세 서비스 결과를 successResponse로 감싸 반환하는 조회 엔드포인트
    반환값: dataId에 해당하는 단건 상세를 담은 successResponse
    갱신일: 2026-02-22
    """
    try:
        result = await DashboardService.getDataTemplateDetail(dataId, userId=user.username)
        response = JSONResponse(status_code=200, content=successResponse(result=result))
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as exc:
        return handleDashboardError(exc)


@router.post("")
async def createDataTemplate(payload: DashboardCreatePayload, user=Depends(getCurrentUser)):
    """
    설명: 생성 payload를 서비스 입력으로 변환해 신규 등록 결과를 반환하는 생성 엔드포인트
    반환값: 생성된 엔티티를 포함한 201(successResponse, message=created)
    갱신일: 2026-02-22
    """
    try:
        result = await DashboardService.createDataTemplate(toModelDict(payload), userId=user.username)
        response = JSONResponse(status_code=201, content=successResponse(result=result, message="created"))
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as exc:
        return handleDashboardError(exc)


@router.put("/{dataId}")
async def updateDataTemplate(dataId: int, payload: DashboardUpdatePayload, user=Depends(getCurrentUser)):
    """
    설명: 부분 수정 payload(excludeNone)를 서비스에 위임해 수정 결과를 반환하 엔드포인트
    반환값: 수정 완료 엔티티를 포함한 successResponse(message=updated)
    갱신일: 2026-02-22
    """
    try:
        result = await DashboardService.updateDataTemplate(
            dataId,
            toModelDict(payload, excludeNone=True),
            userId=user.username,
        )
        response = JSONResponse(
            status_code=200,
            content=successResponse(result=result, message="updated"),
        )
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as exc:
        return handleDashboardError(exc)


@router.delete("/{dataId}")
async def deleteDataTemplate(dataId: int, user=Depends(getCurrentUser)):
    """
    설명: 삭제 서비스 호출 결과를 successResponse(message=deleted)로 직렬화하 엔드포인트
    반환값: 삭제 결과 정보를 담은 successResponse(message=deleted)
    갱신일: 2026-02-22
    """
    try:
        result = await DashboardService.deleteDataTemplate(dataId, userId=user.username)
        response = JSONResponse(
            status_code=200,
            content=successResponse(result=result, message="deleted"),
        )
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as exc:
        return handleDashboardError(exc)
