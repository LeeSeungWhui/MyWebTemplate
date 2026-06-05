"""
파일명: backend/lib/RequestTrust.py
작성자: LSH
갱신일: 2026-06-05
설명: 프록시 신뢰 헤더 관련 공용 판정 helper
"""

import os


def trustProxyHeaders() -> bool:
    """
    설명: TRUST_PROXY_HEADERS 환경변수가 true-like인지 판별
    반환값: 1/true/yes 값이면 True, 그 외는 False
    갱신일: 2026-06-05
    """
    return os.getenv("TRUST_PROXY_HEADERS", "false").lower() in ("1", "true", "yes")
