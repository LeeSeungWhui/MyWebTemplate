"""
파일: backend/lib/I18n.py
작성자: LSH
갱신일: 2025-11-12
설명: 최소한의 i18n 메시지 헬퍼(언어 감지 + 메시지 조회).
"""

from __future__ import annotations

from typing import Optional, Any


# Minimal message catalog
MESSAGES = {
    "en": {
        "success": "success",
        "error.invalid_input": "invalid input",
        "error.invalid_credentials": "invalid credentials",
        "error.csrf_required": "CSRF required",
        "db.unavailable": "db unavailable",
        "obs.not_ready": "not ready",
    },
    "ko": {
        "success": "성공",
        "error.invalid_input": "잘못된 입력",
        "error.invalid_credentials": "아이디 또는 비밀번호가 올바르지 않습니다",
        "error.csrf_required": "CSRF 토큰이 필요합니다",
        "db.unavailable": "DB를 사용할 수 없습니다",
        "obs.not_ready": "준비되지 않았습니다",
    },
}


def detectLocale(request: Any) -> str:
    """요청 헤더를 바탕으로 'ko' 또는 'en' 로케일을 추론한다."""
    try:
        lang = (request.headers.get("Accept-Language") or "").lower()
    except Exception:
        lang = ""
    if "ko" in lang:
        return "ko"
    return "en"


def translate(key: str, default: str, locale: Optional[str] = None) -> str:
    """로케일별 메시지를 조회하고 실패 시 기본 문자열을 반환한다."""
    loc = locale or "en"
    try:
        return MESSAGES.get(loc, {}).get(key) or default
    except Exception:
        return default
