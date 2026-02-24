"""
파일명: backend/service/ProfileService.py
작성자: LSH
갱신일: 2026-02-22
설명: 프로필 조회/수정 서비스 로직.
"""

from typing import Any, Dict

from lib import Database as DB
from lib.Casing import convertKeysToCamelCase

profileNotifyStore: Dict[str, Dict[str, bool]] = {}


def ensureDbManager():
    """
    설명: 기본 DB 매니저 유효성을 검증한다.
    갱신일: 2026-02-22
    """
    db = DB.getManager()
    if not db:
        raise RuntimeError("DB_NOT_READY")
    return db


def normalizeUserNm(rawValue: Any) -> str:
    """
    설명: userNm 입력값을 검증/정규화한다.
    갱신일: 2026-02-22
    """
    if not isinstance(rawValue, str):
        raise ValueError("AUTH_422_INVALID_INPUT")
    value = rawValue.strip()
    if len(value) < 2 or len(value) > 80:
        raise ValueError("AUTH_422_INVALID_INPUT")
    return value


def normalizeNotifyValue(rawValue: Any) -> bool:
    """
    설명: 알림 설정값을 bool로 정규화한다.
    갱신일: 2026-02-22
    """
    if isinstance(rawValue, bool):
        return rawValue
    if rawValue in (None, ""):
        return False
    raise ValueError("AUTH_422_INVALID_INPUT")


def ensureUserId(user: Any) -> str:
    """
    설명: 인증 주체에서 USER_ID(sub)를 추출한다.
    갱신일: 2026-02-22
    """
    userId = getattr(user, "username", None)
    if not isinstance(userId, str) or not userId.strip():
        raise PermissionError("AUTH_403_FORBIDDEN")
    return userId.strip()


def loadNotifyState(userId: str) -> Dict[str, bool]:
    """
    설명: v1 알림설정(비영속 메모리)을 조회한다.
    갱신일: 2026-02-22
    """
    return profileNotifyStore.get(
        userId,
        {"notifyEmail": False, "notifySms": False, "notifyPush": False},
    )


def saveNotifyState(userId: str, payload: Dict[str, Any]) -> Dict[str, bool]:
    """
    설명: v1 알림설정(비영속 메모리)을 저장한다.
    갱신일: 2026-02-22
    """
    current = loadNotifyState(userId)
    if "notifyEmail" in payload:
        current["notifyEmail"] = normalizeNotifyValue(payload.get("notifyEmail"))
    if "notifySms" in payload:
        current["notifySms"] = normalizeNotifyValue(payload.get("notifySms"))
    if "notifyPush" in payload:
        current["notifyPush"] = normalizeNotifyValue(payload.get("notifyPush"))
    profileNotifyStore[userId] = current
    return current


async def getMyProfile(user: Any) -> Dict[str, Any]:
    """
    설명: 현재 인증 사용자 프로필을 조회한다.
    갱신일: 2026-02-22
    """
    userId = ensureUserId(user)
    db = ensureDbManager()
    row = await db.fetchOneQuery("profile.me", {"userId": userId})
    if not row:
        raise LookupError("AUTH_404_USER_NOT_FOUND")
    result = convertKeysToCamelCase(row)
    notifyState = loadNotifyState(userId)
    result.update(notifyState)
    return result


async def updateMyProfile(user: Any, payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    설명: 현재 인증 사용자 프로필을 수정한다.
    갱신일: 2026-02-22
    """
    if not isinstance(payload, dict):
        raise ValueError("AUTH_422_INVALID_INPUT")
    userId = ensureUserId(user)
    db = ensureDbManager()
    row = await db.fetchOneQuery("profile.me", {"userId": userId})
    if not row:
        raise LookupError("AUTH_404_USER_NOT_FOUND")

    hasUserNm = "userNm" in payload
    hasNotify = any(key in payload for key in ("notifyEmail", "notifySms", "notifyPush"))
    if not hasUserNm and not hasNotify:
        raise ValueError("AUTH_422_INVALID_INPUT")

    if hasUserNm:
        userNm = normalizeUserNm(payload.get("userNm"))
        await db.executeQuery("profile.updateMe", {"userNm": userNm, "userId": userId})

    notifyState = saveNotifyState(userId, payload)
    updated = await db.fetchOneQuery("profile.me", {"userId": userId})
    if not updated:
        raise LookupError("AUTH_404_USER_NOT_FOUND")
    result = convertKeysToCamelCase(updated)
    result.update(notifyState)
    return result
