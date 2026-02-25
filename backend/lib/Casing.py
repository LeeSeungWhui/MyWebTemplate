"""
파일명: backend/lib/Casing.py
작성자: LSH
갱신일: 2026-02-22
설명: snake_case → camelCase 변환 유틸(응답/데이터 매핑용).
"""

from __future__ import annotations

from typing import Any


def toCamelCaseKey(key: str) -> str:
    """
    설명: snake_case 문자열 키를 camelCase로 변환한다.
    갱신일: 2026-02-22
    """
    if not isinstance(key, str) or "_" not in key:
        return key
    normalizedParts = [p.lower() for p in key.split("_") if p]
    if not normalizedParts:
        return key
    first = normalizedParts[0]
    rest = [(p[:1].upper() + p[1:]) if p else "" for p in normalizedParts[1:]]
    return first + "".join(rest)


def convertKeysToCamelCase(value: Any) -> Any:
    """
    설명: dict/list 내부의 모든 키를 재귀적으로 camelCase로 변환한다.
    갱신일: 2026-02-22
    """
    if isinstance(value, list):
        return [convertKeysToCamelCase(v) for v in value]
    if isinstance(value, dict):
        converted: dict[Any, Any] = {}
        for k, v in value.items():
            if isinstance(k, str):
                converted[toCamelCaseKey(k)] = convertKeysToCamelCase(v)
            else:
                converted[k] = convertKeysToCamelCase(v)
        return converted
    return value
