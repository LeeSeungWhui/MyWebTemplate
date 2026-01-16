"""
파일명: backend/lib/Casing.py
작성자: Codex
설명: snake_case → camelCase 변환 유틸(응답/데이터 매핑용).
"""

from __future__ import annotations

from typing import Any


def toCamelCaseKey(key: str) -> str:
    if not isinstance(key, str) or "_" not in key:
        return key
    parts = [p for p in key.split("_") if p]
    if not parts:
        return key
    first = parts[0]
    rest = [(p[:1].upper() + p[1:]) if p else "" for p in parts[1:]]
    return first + "".join(rest)


def convertKeysToCamelCase(value: Any) -> Any:
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

