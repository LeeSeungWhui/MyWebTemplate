"""
파일명: backend/lib/RequestContext.py
작성자: LSH
갱신일: 2025-09-07
설명: 요청 스코프 값(ContextVar) 저장/조회 유틸.
"""

import contextvars
from typing import Optional


# 요청ID 등 요청 스코프 값을 저장하는 컨텍스트 변수
_request_id_var: contextvars.ContextVar[Optional[str]] = contextvars.ContextVar(
    "request_id", default=None
)


def set_request_id(request_id: str) -> contextvars.Token:
    """
    설명: 요청ID를 컨텍스트에 저장하고 reset 토큰을 반환.
    갱신일: 2025-09-07
    """
    return _request_id_var.set(request_id)


def get_request_id() -> Optional[str]:
    """
    설명: 현재 컨텍스트의 요청ID를 반환.
    갱신일: 2025-09-07
    """
    return _request_id_var.get()


def reset_request_id(token: contextvars.Token) -> None:
    """
    설명: 저장된 요청ID를 초기 상태로 되돌림.
    갱신일: 2025-09-07
    """
    try:
        _request_id_var.reset(token)
    except Exception:
        pass
