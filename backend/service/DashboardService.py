"""
파일명: backend/service/DashboardService.py
작성자: LSH
갱신일: 2026-02-22
설명: 대시보드 업무(T_DATA) 목록/상세/CRUD/집계 서비스 로직.
"""

import json
from typing import Any, Dict, List, Optional

from lib import Database as DB
from lib.Casing import convertKeysToCamelCase

ALLOWED_STATUS = {"ready", "pending", "running", "done", "failed"}
ALLOWED_SORT = {
    "reg_dt_desc",
    "reg_dt_asc",
    "amt_desc",
    "amt_asc",
    "title_desc",
    "title_asc",
}


def toIntOrDefault(rawValue: Optional[Any], defaultValue: int) -> int:
    """
    설명: 정수값 파싱 실패 시 기본값으로 대체한다.
    갱신일: 2026-02-22
    """
    if rawValue is None:
        return defaultValue
    try:
        return int(rawValue)
    except Exception:
        return defaultValue


def clampValue(rawValue: Optional[Any], defaultValue: int, minValue: int, maxValue: int) -> int:
    """
    설명: 정수값을 범위로 보정한다.
    갱신일: 2026-02-22
    """
    value = toIntOrDefault(rawValue, defaultValue)
    return max(minValue, min(value, maxValue))


def normalizeSort(sortValue: Optional[str]) -> str:
    """
    설명: 허용된 정렬값만 통과시키고 나머지는 기본 정렬로 보정한다.
    갱신일: 2026-02-22
    """
    candidate = str(sortValue or "").strip().lower()
    return candidate if candidate in ALLOWED_SORT else "reg_dt_desc"


def normalizeStatus(statusValue: Optional[str]) -> str:
    """
    설명: 상태 필터 문자열을 정규화한다.
    갱신일: 2026-02-22
    """
    candidate = str(statusValue or "").strip().lower()
    if not candidate:
        return ""
    if candidate not in ALLOWED_STATUS:
        raise ValueError("DASH_422_INVALID_INPUT")
    return candidate


def normalizeKeyword(keyword: Optional[str]) -> str:
    """
    설명: 검색 키워드를 trim 처리한다.
    갱신일: 2026-02-22
    """
    return str(keyword or "").strip()


def parseTagList(rawTags: Any) -> List[str]:
    """
    설명: tags 입력을 문자열 리스트로 정규화한다.
    갱신일: 2026-02-22
    """
    if rawTags is None:
        return []
    if isinstance(rawTags, list):
        tagList = [str(tag).strip() for tag in rawTags if str(tag).strip()]
        return tagList
    if isinstance(rawTags, str):
        text = rawTags.strip()
        if not text:
            return []
        try:
            parsed = json.loads(text)
            if isinstance(parsed, list):
                return [str(tag).strip() for tag in parsed if str(tag).strip()]
        except Exception:
            pass
        return [tag.strip() for tag in text.split(",") if tag.strip()]
    raise ValueError("DASH_422_INVALID_INPUT")


def normalizeTitle(rawTitle: Any) -> str:
    """
    설명: 제목 필드를 검증/정규화한다.
    갱신일: 2026-02-22
    """
    if not isinstance(rawTitle, str):
        raise ValueError("DASH_422_INVALID_INPUT")
    title = rawTitle.strip()
    if not title or len(title) > 200:
        raise ValueError("DASH_422_INVALID_INPUT")
    return title


def normalizeDescription(rawDescription: Any) -> str:
    """
    설명: 설명 필드를 검증/정규화한다.
    갱신일: 2026-02-22
    """
    if rawDescription is None:
        return ""
    if not isinstance(rawDescription, str):
        raise ValueError("DASH_422_INVALID_INPUT")
    return rawDescription.strip()


def normalizeAmount(rawAmount: Any) -> float:
    """
    설명: 금액 필드를 수치형으로 보정한다.
    갱신일: 2026-02-22
    """
    if rawAmount in (None, ""):
        return 0.0
    try:
        amount = float(rawAmount)
    except Exception:
        raise ValueError("DASH_422_INVALID_INPUT")
    return amount


def parseInsertedId(rawResult: Any) -> Optional[int]:
    """
    설명: DB execute 결과값에서 생성된 PK 후보 ID를 추출한다.
    갱신일: 2026-02-23
    """
    if isinstance(rawResult, bool):
        return None
    if isinstance(rawResult, (int, float)):
        value = int(rawResult)
        return value if value > 0 else None
    if isinstance(rawResult, str):
        text = rawResult.strip()
        if text.isdigit():
            value = int(text)
            return value if value > 0 else None
    return None


def buildCreatePayload(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    설명: 신규 등록 payload를 DB 입력 포맷으로 변환한다.
    갱신일: 2026-02-22
    """
    title = normalizeTitle(payload.get("title"))
    status = normalizeStatus(payload.get("status"))
    if not status:
        raise ValueError("DASH_422_INVALID_INPUT")
    description = normalizeDescription(payload.get("description"))
    amount = normalizeAmount(payload.get("amount"))
    tags = parseTagList(payload.get("tags"))
    return {
        "title": title,
        "description": description,
        "status": status,
        "amount": amount,
        "tags": json.dumps(tags, ensure_ascii=False),
    }


def buildUpdatePayload(payload: Dict[str, Any], currentRow: Dict[str, Any]) -> Dict[str, Any]:
    """
    설명: 부분 수정 payload를 기존 값과 병합해 DB 입력 포맷으로 만든다.
    갱신일: 2026-02-22
    """
    if not payload:
        raise ValueError("DASH_422_INVALID_INPUT")

    knownFields = {"title", "description", "status", "amount", "tags"}
    if not any(fieldName in payload for fieldName in knownFields):
        raise ValueError("DASH_422_INVALID_INPUT")

    titleRaw = payload.get("title") if "title" in payload else currentRow.get("title")
    descriptionRaw = payload.get("description") if "description" in payload else currentRow.get("description")
    statusRaw = payload.get("status") if "status" in payload else currentRow.get("status")
    amountRaw = payload.get("amount") if "amount" in payload else currentRow.get("amount")
    tagsRaw = payload.get("tags") if "tags" in payload else currentRow.get("tags")

    title = normalizeTitle(titleRaw)
    description = normalizeDescription(descriptionRaw)
    status = normalizeStatus(statusRaw)
    if not status:
        raise ValueError("DASH_422_INVALID_INPUT")
    amount = normalizeAmount(amountRaw)
    tags = parseTagList(tagsRaw)

    return {
        "title": title,
        "description": description,
        "status": status,
        "amount": amount,
        "tags": json.dumps(tags, ensure_ascii=False),
    }


def ensureDbManager():
    """
    설명: 기본 DB 매니저 유효성을 검증한다.
    갱신일: 2026-02-22
    """
    db = DB.getManager()
    if not db:
        raise RuntimeError("DB_NOT_READY")
    return db


async def listDataTemplates(
    limit: Optional[int] = None,
    offset: Optional[int] = None,
    q: Optional[str] = None,
    status: Optional[str] = None,
    page: Optional[int] = None,
    size: Optional[int] = None,
    sort: Optional[str] = None,
) -> Dict[str, Any]:
    """
    설명: 업무 목록을 검색/필터/페이지네이션 조건으로 조회한다.
    갱신일: 2026-02-22
    """
    db = ensureDbManager()
    safeSort = normalizeSort(sort)
    safeQ = normalizeKeyword(q)
    safeStatus = normalizeStatus(status)

    if page is not None or size is not None:
        safePage = clampValue(page, 1, 1, 100000)
        safeSize = clampValue(size, 20, 1, 200)
        safeOffset = (safePage - 1) * safeSize
    else:
        safeSize = clampValue(limit, 50, 1, 200)
        safeOffset = clampValue(offset, 0, 0, 10_000_000)
        safePage = (safeOffset // safeSize) + 1

    binds = {
        "q": safeQ,
        "qLike": f"%{safeQ}%" if safeQ else "",
        "status": safeStatus,
        "sort": safeSort,
        "limit": safeSize,
        "offset": safeOffset,
    }
    countBinds = {
        "q": safeQ,
        "qLike": f"%{safeQ}%" if safeQ else "",
        "status": safeStatus,
    }
    rows = await db.fetchAllQuery("dashboard.list", binds) or []
    countRow = await db.fetchOneQuery("dashboard.listCount", countBinds) or {}
    items = [convertKeysToCamelCase(row) for row in rows]
    totalCount = int(countRow.get("total_count", 0) or 0)

    return {
        "items": items,
        "count": len(items),
        "total": totalCount,
        "page": safePage,
        "size": safeSize,
        "limit": safeSize,
        "offset": safeOffset,
        "sort": safeSort,
        "q": safeQ,
        "status": safeStatus,
    }


async def getDataTemplateDetail(dataId: int) -> Dict[str, Any]:
    """
    설명: 업무 단건 상세를 조회한다.
    갱신일: 2026-02-22
    """
    db = ensureDbManager()
    row = await db.fetchOneQuery("dashboard.detail", {"id": int(dataId)})
    if not row:
        raise LookupError("DASH_404_NOT_FOUND")
    return convertKeysToCamelCase(row)


async def createDataTemplate(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    설명: 업무를 신규 등록한다.
    갱신일: 2026-02-22
    """
    if not isinstance(payload, dict):
        raise ValueError("DASH_422_INVALID_INPUT")
    db = ensureDbManager()
    insertPayload = buildCreatePayload(payload)
    inserted = await db.executeQuery("dashboard.create", insertPayload)

    createdId = parseInsertedId(inserted)
    if createdId:
        row = await db.fetchOneQuery("dashboard.detail", {"id": createdId})
        if row:
            return convertKeysToCamelCase(row)

    candidate = await db.fetchOneQuery("dashboard.findCreatedCandidate", insertPayload)
    if candidate:
        return convertKeysToCamelCase(candidate)
    raise RuntimeError("DASH_500_CREATE_FAILED")


async def updateDataTemplate(dataId: int, payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    설명: 업무를 수정한다(부분 수정 지원).
    갱신일: 2026-02-22
    """
    if not isinstance(payload, dict):
        raise ValueError("DASH_422_INVALID_INPUT")
    db = ensureDbManager()
    current = await db.fetchOneQuery("dashboard.detail", {"id": int(dataId)})
    if not current:
        raise LookupError("DASH_404_NOT_FOUND")
    currentCamel = convertKeysToCamelCase(current)
    nextPayload = buildUpdatePayload(payload, currentCamel)
    nextPayload["id"] = int(dataId)
    await db.executeQuery("dashboard.update", nextPayload)
    row = await db.fetchOneQuery("dashboard.detail", {"id": int(dataId)})
    if not row:
        raise LookupError("DASH_404_NOT_FOUND")
    return convertKeysToCamelCase(row)


async def deleteDataTemplate(dataId: int) -> Dict[str, Any]:
    """
    설명: 업무를 삭제한다.
    갱신일: 2026-02-22
    """
    db = ensureDbManager()
    row = await db.fetchOneQuery("dashboard.detail", {"id": int(dataId)})
    if not row:
        raise LookupError("DASH_404_NOT_FOUND")
    await db.executeQuery("dashboard.delete", {"id": int(dataId)})
    return {"id": int(dataId)}


async def dataTemplateStats() -> Dict[str, Any]:
    """
    설명: 상태별 집계 통계를 조회한다.
    갱신일: 2026-02-22
    """
    db = ensureDbManager()
    rows: List[Dict[str, Any]] = await db.fetchAllQuery("dashboard.statusSummary", {}) or []
    totalCount = sum(row.get("count", 0) or 0 for row in rows)
    totalAmount = float(sum(row.get("amount_sum", 0) or 0 for row in rows))
    byStatus = [convertKeysToCamelCase(row) for row in rows]
    return {
        "totalCount": totalCount,
        "totalAmount": totalAmount,
        "byStatus": byStatus,
    }
