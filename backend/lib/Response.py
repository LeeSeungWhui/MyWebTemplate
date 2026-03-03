"""
파일명: backend/lib/Response.py
작성자: LSH
갱신일: 2026-01-18
설명: 공통 응답 스키마/헬퍼. { status, message, result, count. , code. , requestId }
"""

from typing import Any, Optional, Dict

from pydantic import BaseModel

from .RequestContext import getRequestId


class StandardResponse(BaseModel):
    status: bool = True
    message: str = "success"
    result: Optional[Any] = None
    count: Optional[int] = None  # 리스트 응답일 때만 포함
    code: Optional[str] = None
    requestId: Optional[str] = None


def dumpModel(model: BaseModel) -> Dict[str, Any]:
    """
    설명: Pydantic 모델을 dict로 직렬화
    처리 규칙: model_dump(exclude_none=True)로 표준 응답 형태를 유지
    반환값: exclude_none이 적용된 표준 dict 응답
    갱신일: 2026-02-28
    """
    return model.model_dump(exclude_none=True)


def successResponse(result: Any = None, message: str = "success") -> Dict[str, Any]:
    """
    설명: 성공 응답 본문 생성. 리스트일 경우 count 자동 포함
    갱신일: 2025-11-12
    """
    count = len(result) if isinstance(result, list) else None
    return dumpModel(
        StandardResponse(
            status=True,
            message=message,
            result=result,
            count=count,
            requestId=getRequestId(),
        )
    )


def errorResponse(message: str = "error", result: Any = None, code: Optional[str] = None) -> Dict[str, Any]:
    """
    설명: 표준 에러 응답 본문 생성. 오류 코드를 포함할 수 있음
    처리 규칙: status=false 고정이며 현재 requestId를 함께 포함
    반환값: API 에러 응답 규격(dict) 객체를 반환
    갱신일: 2025-11-12
    """
    return dumpModel(
        StandardResponse(
            status=False,
            message=message,
            result=result,
            code=code,
            requestId=getRequestId(),
        )
    )
