"""
파일명: backend/lib/I18n.py
작성자: LSH
갱신일: 2025-11-12
설명: 최소한의 i18n 메시지 헬퍼(언어 감지 + 메시지 조회)
"""

from __future__ import annotations

from types import MappingProxyType
from typing import Optional, Any

# 최소 메시지 카탈로그 정의
MESSAGES = MappingProxyType({
    "en": MappingProxyType({
        "success": "success",
        "error.invalid_input": "invalid input",
        "error.invalid_credentials": "invalid credentials",
        "error.csrf_required": "CSRF required",
        "db.unavailable": "db unavailable",
        "obs.not_ready": "not ready",
        "auth.state_store_unavailable": "temporary auth state storage unavailable",
        "error.db_not_ready": "database not ready",
        "error.server_error": "server error",
        "auth.user_exists": "user already exists",
        "auth.refresh_missing": "refresh token missing",
        "auth.refresh_invalid": "invalid refresh token",
    }),
    "ko": MappingProxyType({
        "success": "성공",
        "error.invalid_input": "잘못된 입력",
        "error.invalid_credentials": "아이디 또는 비밀번호가 올바르지 않습니다",
        "error.csrf_required": "CSRF 토큰이 필요합니다",
        "db.unavailable": "DB를 사용할 수 없습니다",
        "obs.not_ready": "준비되지 않았습니다",
        "auth.state_store_unavailable": "인증 상태 저장소를 일시적으로 사용할 수 없습니다",
        "error.db_not_ready": "데이터베이스가 준비되지 않았습니다",
        "error.server_error": "서버 오류가 발생했습니다",
        "auth.user_exists": "이미 가입된 사용자입니다",
        "auth.refresh_missing": "리프레시 토큰이 없습니다",
        "auth.refresh_invalid": "유효하지 않은 리프레시 토큰입니다",
    }),
})


def detectLocale(request: Any) -> str:
    """
    설명: Accept-Language 헤더에서 ko/en 로케일 판별
    처리 규칙: 헤더 파싱 실패 또는 비지원 언어면 기본값으로 en을 사용
    반환값: "ko" 또는 "en" 중 하나를 반환
    갱신일: 2025-11-12
    """
    try:
        header = str(request.headers.get("Accept-Language") or "")
    except Exception:
        return "en"

    candidates: list[tuple[float, int, str]] = []
    for order, rawRange in enumerate(header.split(",")):
        parts = [part.strip() for part in rawRange.split(";")]
        languageRange = parts[0].lower()
        languageParts = languageRange.split("-")
        if any(
            not part or len(part) > 8 or not part.isascii() or not part.isalnum()
            for part in languageParts
        ):
            continue
        primaryLanguage = languageParts[0]
        if primaryLanguage not in {"en", "ko"}:
            continue

        quality = 1.0
        validQuality = True
        if len(parts) > 2:
            validQuality = False
        elif len(parts) == 2:
            name, separator, value = parts[1].partition("=")
            if name.strip().lower() != "q" or not separator:
                validQuality = False
            else:
                qualityText = value.strip()
                qualityFraction = qualityText[2:]
                validZeroQuality = qualityText == "0" or (
                    qualityText.startswith("0.")
                    and len(qualityFraction) <= 3
                    and (
                        not qualityFraction
                        or qualityFraction.isascii() and qualityFraction.isdigit()
                    )
                )
                validOneQuality = qualityText == "1" or (
                    qualityText.startswith("1.")
                    and len(qualityFraction) <= 3
                    and (not qualityFraction or set(qualityFraction) == {"0"})
                )
                if not validZeroQuality and not validOneQuality:
                    validQuality = False
                else:
                    quality = float(qualityText)

        if validQuality and quality > 0.0:
            candidates.append((quality, order, primaryLanguage))

    if not candidates:
        return "en"
    candidates.sort(key=lambda candidate: (-candidate[0], candidate[1]))
    return candidates[0][2]


def translate(key: str, default: str, locale: Optional[str] = None) -> str:
    """설명: 메시지 키를 번역하고 실패 시 기본값 반환 갱신일: 2025-11-12"""
    loc = locale or "en"
    try:
        return MESSAGES.get(loc, {}).get(key) or default
    except Exception:
        return default
