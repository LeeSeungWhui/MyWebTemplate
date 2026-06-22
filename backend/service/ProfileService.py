"""
파일명: backend/service/ProfileService.py
작성자: LSH
갱신일: 2026-06-22
설명: 프로필 조회/수정 서비스 로직
"""

from typing import Any

from lib import Database as DB
from lib.Casing import convertKeysToCamelCase
from lib.ServiceError import ServiceError
from lib.Transaction import transaction

profileStorageReady = False


def ensureDbManager():
    """
    설명: 기본 DB 매니저를 조회하고 준비 상태 확인
    실패 동작: 매니저가 없으면 ServiceError("DB_NOT_READY")를 발생시킨
    갱신일: 2026-02-22
    """
    db = DB.getManager()
    if not db:
        raise ServiceError("DB_NOT_READY")
    return db


def normalizeUserNm(rawValue: Any) -> str:
    """
    설명: userNm 입력값을 검증/정규화. 호출 맥락의 제약을 기준으로 동작 기준 확정
    반환값: 좌우 공백이 제거된 사용자 이름 문자열(길이 2~80)
    갱신일: 2026-02-22
    """
    if not isinstance(rawValue, str):
        raise ServiceError("AUTH_422_INVALID_INPUT")
    value = rawValue.strip()
    if len(value) < 2 or len(value) > 80:
        raise ServiceError("AUTH_422_INVALID_INPUT")
    return value


def normalizeNotifyValue(rawValue: Any) -> bool:
    """
    설명: 알림 설정값을 bool로 정규화. 호출 맥락의 제약을 기준으로 동작 기준 확정
    처리 규칙: bool은 그대로 사용하고 None/빈문자열은 False로 간주
    갱신일: 2026-02-22
    """
    if isinstance(rawValue, bool):
        return rawValue
    if rawValue in (None, ""):
        return False
    raise ServiceError("AUTH_422_INVALID_INPUT")


def toDbNotifyValue(value: bool) -> int:
    """
    설명: profile notify bool 값을 DB 저장용 0/1 정수로 변환
    반환값: True면 1, False면 0
    갱신일: 2026-06-22
    """
    return 1 if bool(value) else 0


def ensureUserId(user: Any) -> str:
    """
    설명: 인증 주체에서 USER_ID(sub) 추출
    실패 동작: username이 비어 있거나 문자열이 아니면 ServiceError("AUTH_403_FORBIDDEN")를 발생시킨
    갱신일: 2026-02-22
    """
    userId = getattr(user, "username", None)
    if not isinstance(userId, str) or not userId.strip():
        raise ServiceError("AUTH_403_FORBIDDEN")
    return userId.strip()


def readNotifyState(source: dict[str, Any]) -> dict[str, bool]:
    """
    설명: DB 조회 행에서 알림설정 값을 bool 응답 모델로 변환
    반환값: notifyEmail/notifySms/notifyPush 기본값이 보장된 dict
    갱신일: 2026-06-22
    """
    return {
        "notifyEmail": bool(source.get("notifyEmail")),
        "notifySms": bool(source.get("notifySms")),
        "notifyPush": bool(source.get("notifyPush")),
    }


async def ensureProfileStorage() -> None:
    """
    설명: profile notify DB 컬럼이 존재하는지 보장
    부작용: 기존 T_USER에 NOTIFY_* 컬럼이 없으면 추가한다.
    갱신일: 2026-06-22
    """
    global profileStorageReady
    if profileStorageReady:
        return
    db = ensureDbManager()
    await db.executeQuery("profile.ensureNotifyEmailColumn")
    await db.executeQuery("profile.ensureNotifySmsColumn")
    await db.executeQuery("profile.ensureNotifyPushColumn")
    profileStorageReady = True


def buildProfileUpdatePayload(
    userId: str,
    currentProfile: dict[str, Any],
    payload: dict[str, Any],
) -> dict[str, Any]:
    """
    설명: 프로필 수정 payload를 T_USER 업데이트 바인딩 값으로 정규화
    반환값: userNm/userId/notify* DB 바인딩 dict
    갱신일: 2026-06-22
    """
    userNm = (
        normalizeUserNm(payload.get("userNm"))
        if "userNm" in payload
        else currentProfile.get("userNm")
    )
    currentNotify = readNotifyState(currentProfile)
    notifyEmail = (
        normalizeNotifyValue(payload.get("notifyEmail"))
        if "notifyEmail" in payload
        else currentNotify["notifyEmail"]
    )
    notifySms = (
        normalizeNotifyValue(payload.get("notifySms"))
        if "notifySms" in payload
        else currentNotify["notifySms"]
    )
    notifyPush = (
        normalizeNotifyValue(payload.get("notifyPush"))
        if "notifyPush" in payload
        else currentNotify["notifyPush"]
    )
    return {
        "userNm": userNm,
        "userId": userId,
        "notifyEmail": toDbNotifyValue(notifyEmail),
        "notifySms": toDbNotifyValue(notifySms),
        "notifyPush": toDbNotifyValue(notifyPush),
    }


async def getMyProfile(user: Any) -> dict[str, Any]:
    """
    설명: 현재 인증 사용자 프로필을 조회. 호출 맥락의 제약을 기준으로 동작 기준 확정
    반환값: DB 프로필(camelCase) + notify 상태가 병합된 dict
    갱신일: 2026-02-22
    """
    userId = ensureUserId(user)
    await ensureProfileStorage()
    db = ensureDbManager()
    row = await db.fetchOneQuery("profile.me", {"userId": userId})
    if not row:
        raise ServiceError("AUTH_404_USER_NOT_FOUND")
    result = convertKeysToCamelCase(row)
    result.update(readNotifyState(result))
    return result


@transaction("main_db")
async def updateMyProfile(user: Any, payload: dict[str, Any]) -> dict[str, Any]:
    """
    설명: 현재 인증 사용자 프로필 수정
    처리 규칙: userNm 또는 notify 필드 중 최소 1개가 있어야 하며, 저장 후 최신 프로필을 재조회해 반환
    갱신일: 2026-02-22
    """
    if not isinstance(payload, dict):
        raise ServiceError("AUTH_422_INVALID_INPUT")
    userId = ensureUserId(user)
    await ensureProfileStorage()
    db = ensureDbManager()
    row = await db.fetchOneQuery("profile.me", {"userId": userId})
    if not row:
        raise ServiceError("AUTH_404_USER_NOT_FOUND")
    currentProfile = convertKeysToCamelCase(row)

    hasUserNm = "userNm" in payload
    hasNotify = any(key in payload for key in ("notifyEmail", "notifySms", "notifyPush"))
    if not hasUserNm and not hasNotify:
        raise ServiceError("AUTH_422_INVALID_INPUT")

    updatePayload = buildProfileUpdatePayload(userId, currentProfile, payload)
    if hasUserNm:
        await db.executeQuery(
            "profile.updateMe",
            {
                "userNm": updatePayload["userNm"],
                "userId": userId,
            },
        )
    if hasNotify:
        await db.executeQuery(
            "profile.updateNotify",
            {
                "notifyEmail": updatePayload["notifyEmail"],
                "notifySms": updatePayload["notifySms"],
                "notifyPush": updatePayload["notifyPush"],
                "userId": userId,
            },
        )
    updated = await db.fetchOneQuery("profile.me", {"userId": userId})
    if not updated:
        raise ServiceError("AUTH_404_USER_NOT_FOUND")
    result = convertKeysToCamelCase(updated)
    result.update(readNotifyState(result))
    return result
