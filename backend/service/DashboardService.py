"""
파일명: backend/service/DashboardService.py
작성자: Codex
갱신일: 2025-11-XX
설명: 대시보드용 data_template 조회/집계 서비스 로직.
"""

from typing import Dict, Any, List, Optional

from lib import Database as DB


def clampLimit(limit: Optional[int]) -> int:
    if limit is None:
        return 50
    try:
        value = int(limit)
    except Exception:
        return 50
    return max(1, min(value, 200))


def clampOffset(offset: Optional[int]) -> int:
    if offset is None:
        return 0
    try:
        value = int(offset)
    except Exception:
        return 0
    return max(0, value)


async def listDataTemplates(limit: Optional[int], offset: Optional[int]) -> Dict[str, Any]:
    db = DB.getManager()
    if not db:
        raise RuntimeError("DB_NOT_READY")
    safeLimit = clampLimit(limit)
    safeOffset = clampOffset(offset)
    rows = await db.fetchAllQuery("dashboard.list", {"limit": safeLimit, "offset": safeOffset}) or []
    return {
        "items": rows,
        "limit": safeLimit,
        "offset": safeOffset,
        "count": len(rows),
    }


async def dataTemplateStats() -> Dict[str, Any]:
    db = DB.getManager()
    if not db:
        raise RuntimeError("DB_NOT_READY")
    rows: List[Dict[str, Any]] = await db.fetchAllQuery("dashboard.statusSummary", {}) or []
    totalCount = sum(r.get("count", 0) or 0 for r in rows)
    totalAmount = float(sum(r.get("amount_sum", 0) or 0 for r in rows))
    return {
        "totalCount": totalCount,
        "totalAmount": totalAmount,
        "byStatus": rows,
    }
