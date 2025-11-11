"""
파일명: backend/lib/Response.py
작성자: LSH
갱신일: 2025-09-07
설명: 공통 응답 스키마/헬퍼. { status, message, result, count?, code?, requestId }.
"""

from typing import Any, Optional, Dict

from pydantic import BaseModel

from .RequestContext import getRequestId


class StandardResponse(BaseModel):
    status: bool = True
    message: str = "success"
    result: Optional[Any] = None
    count: Optional[int] = None  # present only for list responses
    code: Optional[str] = None
    requestId: Optional[str] = None


def successResponse(result: Any = None, message: str = "success") -> Dict[str, Any]:
    """
    설명: 성공 응답 본문 생성. 리스트일 경우 count 자동 포함.
    갱신일: 2025-09-07
    """
    count = len(result) if isinstance(result, list) else None
    return StandardResponse(
        status=True,
        message=message,
        result=result,
        count=count,
        requestId=getRequestId(),
    ).model_dump(exclude_none=True)


def errorResponse(
    message: str = "error", result: Any = None, code: Optional[str] = None
) -> Dict[str, Any]:
    """
    설명: 표준 에러 응답 본문 생성. 오류 코드를 포함할 수 있음.
    갱신일: 2025-09-07
    """
    return StandardResponse(status=False, message=message, result=result, code=code, requestId=getRequestId(),).model_dump(exclude_none=True)
