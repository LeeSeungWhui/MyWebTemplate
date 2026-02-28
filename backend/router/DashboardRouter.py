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
from lib.Response import errorResponse, successResponse
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
    설명: Pydantic v1/v2 호환으로 payload dict를 추출
    반환값: model_dump(dict) 결과를 표준 dict로 통일한 값
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
    설명: 서비스 예외 객체에서 표준 코드 문자열(code/args[0])을 꺼내는 헬퍼
    처리 규칙: code 속성이 우선이며, 없으면 첫 번째 args 문자열을 사용
    반환값: 공백 제거된 코드 문자열 또는 None
    갱신일: 2026-02-27
    """
    codeValue = getattr(exc, "code", None)
    if isinstance(codeValue, str) and codeValue.strip():
        return codeValue.strip()
    if exc.args:
        firstArg = exc.args[0]
        if isinstance(firstArg, str) and firstArg.strip():
            return firstArg.strip()
    return None


def handleDashboardError(exc: Exception) -> JSONResponse:
    """
    설명: 대시보드 서비스 코드(DB_NOT_READY/422/404/500)를 HTTP 에러 응답으로 매핑하는 변환기
    처리 규칙: 정의된 코드만 고정 매핑하고, 미정의 예외는 상위 핸들러로 재전파
    반환값: 매핑된 JSONResponse
    갱신일: 2026-02-22
    """
    errorCode = resolveServiceErrorCode(exc)
    if errorCode == "DB_NOT_READY":
        return JSONResponse(
            status_code=503,
            content=errorResponse(message="database not ready", code="DB_503_NOT_READY"),
        )
    if errorCode == "DASH_422_INVALID_INPUT":
        return JSONResponse(
            status_code=422,
            content=errorResponse(message="invalid input", code="DASH_422_INVALID_INPUT"),
        )
    if errorCode == "DASH_404_NOT_FOUND":
        return JSONResponse(
            status_code=404,
            content=errorResponse(message="data not found", code="DASH_404_NOT_FOUND"),
        )
    if errorCode == "DASH_500_CREATE_FAILED":
        return JSONResponse(
            status_code=500,
            content=errorResponse(message="create failed", code="DASH_500_CREATE_FAILED"),
        )
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
    설명: 목록 쿼리 파라미터를 서비스로 위임하고 응답 본문(meta 포함)으로 직렬화하는 라우터
    실패 동작: 서비스 예외는 handleDashboardError에서 코드별 HTTP 응답으로 변환
    갱신일: 2026-02-22
    """
    try:
        result = await DashboardService.listDataTemplates(
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
        return body
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
        result = await DashboardService.dataTemplateStats()
        return successResponse(result=result)
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
        result = await DashboardService.getDataTemplateDetail(dataId)
        return successResponse(result=result)
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
        result = await DashboardService.createDataTemplate(toModelDict(payload))
        return JSONResponse(status_code=201, content=successResponse(result=result, message="created"))
    except Exception as exc:
        return handleDashboardError(exc)


@router.put("/{dataId}")
async def updateDataTemplate(dataId: int, payload: DashboardUpdatePayload, user=Depends(getCurrentUser)):
    """
    설명: 부분 수정 payload(excludeNone)를 서비스에 위임해 수정 결과를 반환하는 엔드포인트
    반환값: 수정 완료 엔티티를 포함한 successResponse(message=updated)
    갱신일: 2026-02-22
    """
    try:
        result = await DashboardService.updateDataTemplate(dataId, toModelDict(payload, excludeNone=True))
        return successResponse(result=result, message="updated")
    except Exception as exc:
        return handleDashboardError(exc)


@router.delete("/{dataId}")
async def deleteDataTemplate(dataId: int, user=Depends(getCurrentUser)):
    """
    설명: 삭제 서비스 호출 결과를 successResponse(message=deleted)로 직렬화하는 엔드포인트
    반환값: 삭제 결과 정보를 담은 successResponse(message=deleted)
    갱신일: 2026-02-22
    """
    try:
        result = await DashboardService.deleteDataTemplate(dataId)
        return successResponse(result=result, message="deleted")
    except Exception as exc:
        return handleDashboardError(exc)
