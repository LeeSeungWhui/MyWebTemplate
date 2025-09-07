"""
Simple i18n message utility.

- detect_locale(request): returns 'ko' if Accept-Language prefers Korean, else 'en'.
- t(key, default, locale=None): returns localized message with fallback to default.
"""

from __future__ import annotations

from typing import Optional


# Minimal message catalog
MESSAGES = {
    "en": {
        "success": "success",
        "error.invalid_input": "invalid input",
        "error.invalid_credentials": "invalid credentials",
        "error.csrf_required": "CSRF required",
        "db.unavailable": "db unavailable",
    },
    "ko": {
        "success": "성공",
        "error.invalid_input": "잘못된 입력",
        "error.invalid_credentials": "아이디 또는 비밀번호가 올바르지 않습니다",
        "error.csrf_required": "CSRF 토큰이 필요합니다",
        "db.unavailable": "DB를 사용할 수 없습니다",
    },
}


def detect_locale(request) -> str:
    try:
        lang = (request.headers.get("Accept-Language") or "").lower()
    except Exception:
        lang = ""
    if "ko" in lang:
        return "ko"
    return "en"


def t(key: str, default: str, locale: Optional[str] = None) -> str:
    loc = locale or "en"
    try:
        return MESSAGES.get(loc, {}).get(key) or default
    except Exception:
        return default

