"""
파일명: backend/router/SampleRouter.py
작성자: Codex
갱신일: 2026-03-06
설명: 공개 sample 페이지용 DB 연동 API 라우터
"""

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from lib.Response import successResponse
from lib.ServiceError import buildMappedErrorResponse
from service import SampleService

router = APIRouter(prefix="/api/v1/sample", tags=["sample"])


class SampleTaskCreatePayload(BaseModel):
    title: str
    description: str | None = None
    owner: str | None = None
    status: str
    amount: float | None = None
    attachmentName: str | None = None


class SampleTaskUpdatePayload(BaseModel):
    title: str | None = None
    description: str | None = None
    owner: str | None = None
    status: str | None = None
    amount: float | None = None
    attachmentName: str | None = None


class SampleFormSubmitPayload(BaseModel):
    name: str
    email: str
    phone: str
    category: str
    startDate: str
    endDate: str
    budgetRange: str
    requirement: str | None = None
    selectedFeatures: list[str] | None = None
    referenceUrl: str | None = None
    attachmentName: str | None = None


class SampleAdminUserCreatePayload(BaseModel):
    name: str
    email: str
    role: str
    status: str
    notifyEmail: bool | None = None
    notifySms: bool | None = None
    notifyPush: bool | None = None
    profileImageUrl: str | None = None


class SampleAdminUserUpdatePayload(BaseModel):
    name: str | None = None
    role: str | None = None
    status: str | None = None
    notifyEmail: bool | None = None
    notifySms: bool | None = None
    notifyPush: bool | None = None
    profileImageUrl: str | None = None


class SampleAdminSettingPayload(BaseModel):
    siteName: str
    adminEmail: str
    maintenanceMode: bool | None = None
    sessionTimeout: int
    maxUploadMb: int


def toModelDict(model: BaseModel, *, excludeNone: bool = False) -> dict:
    """
    설명: Pydantic payload를 plain dict로 직렬화
    처리 규칙: model_dump(exclude_none=...) 기준으로 서비스 입력용 dict를 반환한다.
    반환값: 서비스에 전달 가능한 dict
    갱신일: 2026-03-06
    """
    return model.model_dump(exclude_none=excludeNone)


def handleSampleError(exc: Exception) -> JSONResponse:
    """
    설명: 공개 sample 서비스 예외를 표준 에러 응답으로 매핑
    처리 규칙: 등록된 sample 코드만 상태코드/code/message로 고정 변환한다.
    반환값: 매핑된 JSONResponse
    갱신일: 2026-03-06
    """
    mappedResponse = buildMappedErrorResponse(exc, includeNoStore=True)
    if mappedResponse is not None:
        return mappedResponse
    raise exc


@router.get("/overview")
async def getSampleOverview():
    """
    설명: 공개 sample 허브/포트폴리오용 전체 요약 카운트 조회
    반환값: taskCount/adminUserCount/formSubmissionCount를 담은 successResponse
    갱신일: 2026-03-06
    """
    try:
        result = await SampleService.getSampleOverview()
        response = JSONResponse(status_code=200, content=successResponse(result=result))
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as exc:
        return handleSampleError(exc)


@router.get("/dashboard")
async def getSampleDashboard():
    """
    설명: 공개 sample 대시보드용 KPI/차트/최근 업무 묶음 조회
    반환값: dashboard result dict를 담은 successResponse
    갱신일: 2026-03-06
    """
    try:
        result = await SampleService.getSampleDashboard()
        response = JSONResponse(status_code=200, content=successResponse(result=result))
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as exc:
        return handleSampleError(exc)


@router.get("/tasks")
async def listSampleTasks(
    q: str | None = None,
    status: str | None = None,
    fromDate: str | None = None,
    toDate: str | None = None,
    page: int | None = None,
    size: int | None = None,
):
    """
    설명: 공개 sample CRUD 목록을 검색/필터 조건으로 조회
    반환값: items/total/page/size meta를 담은 successResponse
    갱신일: 2026-03-06
    """
    try:
        result = await SampleService.listSampleTasks(
            q=q,
            status=status,
            fromDate=fromDate,
            toDate=toDate,
            page=page,
            size=size,
        )
        body = successResponse(result=result["items"])
        body["count"] = result["total"]
        body["meta"] = {
            "page": result["page"],
            "size": result["size"],
            "q": result["q"],
            "status": result["status"],
            "fromDate": result["fromDate"],
            "toDate": result["toDate"],
        }
        response = JSONResponse(status_code=200, content=body)
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as exc:
        return handleSampleError(exc)


@router.get("/tasks/{taskId}")
async def getSampleTaskDetail(taskId: int):
    """
    설명: 공개 sample 업무 단건 상세 조회
    반환값: 업무 상세 dict를 담은 successResponse
    갱신일: 2026-03-06
    """
    try:
        result = await SampleService.getSampleTaskDetail(taskId)
        response = JSONResponse(status_code=200, content=successResponse(result=result))
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as exc:
        return handleSampleError(exc)


@router.post("/tasks")
async def createSampleTask(payload: SampleTaskCreatePayload):
    """
    설명: 공개 sample 업무 신규 생성
    반환값: 생성된 업무 dict를 담은 201 successResponse
    갱신일: 2026-03-06
    """
    try:
        result = await SampleService.createSampleTask(toModelDict(payload))
        response = JSONResponse(status_code=201, content=successResponse(result=result, message="created"))
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as exc:
        return handleSampleError(exc)


@router.put("/tasks/{taskId}")
async def updateSampleTask(taskId: int, payload: SampleTaskUpdatePayload):
    """
    설명: 공개 sample 업무 단건 수정
    반환값: 수정된 업무 dict를 담은 successResponse(message=updated)
    갱신일: 2026-03-06
    """
    try:
        result = await SampleService.updateSampleTask(taskId, toModelDict(payload, excludeNone=True))
        response = JSONResponse(status_code=200, content=successResponse(result=result, message="updated"))
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as exc:
        return handleSampleError(exc)


@router.delete("/tasks/{taskId}")
async def deleteSampleTask(taskId: int):
    """
    설명: 공개 sample 업무 단건 삭제
    반환값: 삭제된 ID 메타를 담은 successResponse(message=deleted)
    갱신일: 2026-03-06
    """
    try:
        result = await SampleService.deleteSampleTask(taskId)
        response = JSONResponse(status_code=200, content=successResponse(result=result, message="deleted"))
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as exc:
        return handleSampleError(exc)


@router.get("/forms/meta")
async def getSampleFormMeta():
    """
    설명: 공개 sample 복합 폼의 옵션/제출 현황 메타 조회
    반환값: categoryCodeList/featureCodeList/submissionCount/latestSubmission dict
    갱신일: 2026-03-06
    """
    try:
        result = await SampleService.getSampleFormMeta()
        response = JSONResponse(status_code=200, content=successResponse(result=result))
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as exc:
        return handleSampleError(exc)


@router.post("/forms")
async def submitSampleForm(payload: SampleFormSubmitPayload):
    """
    설명: 공개 sample 복합 폼 제출 저장
    반환값: 최신 제출 결과 dict를 담은 201 successResponse
    갱신일: 2026-03-06
    """
    try:
        result = await SampleService.submitSampleForm(toModelDict(payload))
        response = JSONResponse(status_code=201, content=successResponse(result=result, message="created"))
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as exc:
        return handleSampleError(exc)


@router.get("/admin/users")
async def listSampleAdminUsers():
    """
    설명: 공개 sample 관리자 사용자 목록 조회
    반환값: 사용자 리스트를 담은 successResponse
    갱신일: 2026-03-06
    """
    try:
        result = await SampleService.listSampleAdminUsers()
        body = successResponse(result=result)
        body["count"] = len(result)
        response = JSONResponse(status_code=200, content=body)
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as exc:
        return handleSampleError(exc)


@router.post("/admin/users")
async def createSampleAdminUser(payload: SampleAdminUserCreatePayload):
    """
    설명: 공개 sample 관리자 사용자 신규 생성
    반환값: 생성된 사용자 dict를 담은 201 successResponse
    갱신일: 2026-03-06
    """
    try:
        result = await SampleService.createSampleAdminUser(toModelDict(payload, excludeNone=True))
        response = JSONResponse(status_code=201, content=successResponse(result=result, message="created"))
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as exc:
        return handleSampleError(exc)


@router.put("/admin/users/{userId}")
async def updateSampleAdminUser(userId: int, payload: SampleAdminUserUpdatePayload):
    """
    설명: 공개 sample 관리자 사용자 단건 수정
    반환값: 수정된 사용자 dict를 담은 successResponse(message=updated)
    갱신일: 2026-03-06
    """
    try:
        result = await SampleService.updateSampleAdminUser(userId, toModelDict(payload, excludeNone=True))
        response = JSONResponse(status_code=200, content=successResponse(result=result, message="updated"))
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as exc:
        return handleSampleError(exc)


@router.get("/admin/settings")
async def getSampleAdminSettings():
    """
    설명: 공개 sample 관리자 시스템 설정/권한 맵 조회
    반환값: systemSetting/rolePermissionMap dict를 담은 successResponse
    갱신일: 2026-03-06
    """
    try:
        result = await SampleService.getSampleAdminSettings()
        response = JSONResponse(status_code=200, content=successResponse(result=result))
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as exc:
        return handleSampleError(exc)


@router.put("/admin/settings")
async def updateSampleAdminSettings(payload: SampleAdminSettingPayload):
    """
    설명: 공개 sample 관리자 시스템 설정 저장
    반환값: 저장된 설정 dict를 담은 successResponse(message=updated)
    갱신일: 2026-03-06
    """
    try:
        result = await SampleService.updateSampleAdminSettings(toModelDict(payload, excludeNone=True))
        response = JSONResponse(status_code=200, content=successResponse(result=result, message="updated"))
        response.headers["Cache-Control"] = "no-store"
        return response
    except Exception as exc:
        return handleSampleError(exc)
