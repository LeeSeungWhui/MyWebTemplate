"""
파일명: backend/lib/RequestContext.py
작성자: LSH
갱신일: 2025-09-07
설명: 요청 스코프 값(ContextVar) 저장/조회 유틸.
"""

import contextvars
from typing import Optional


# 요청ID 등 요청 스코프 값을 저장하는 컨텍스트 변수
_requestIdVar: contextvars.ContextVar[Optional[str]] = contextvars.ContextVar(
    "request_id", default=None
)


def setRequestId(requestId: str) -> contextvars.Token:
    """
    설명: 요청ID를 컨텍스트에 저장하고 reset 토큰을 반환.
    갱신일: 2025-11-12
    """
    return _requestIdVar.set(requestId)


def getRequestId() -> Optional[str]:
    """
    설명: 현재 컨텍스트의 요청ID를 반환.
    갱신일: 2025-11-12
    """
    return _requestIdVar.get()


def resetRequestId(token: contextvars.Token) -> None:
    """
    설명: 저장된 요청ID를 초기 상태로 되돌림.
    갱신일: 2025-11-12
    """
    try:
        _requestIdVar.reset(token)
    except Exception:
        pass
