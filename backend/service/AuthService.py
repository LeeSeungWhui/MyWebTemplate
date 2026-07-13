"""
파일명: backend/service/AuthService.py
작성자: LSH
갱신일: 2026-04-08
설명: 인증 도메인 서비스. 비즈니스 로직만 포함(HTTP/세션은 라우터 책임)
"""

import uuid
from typing import Any, Callable
import asyncio

import base64
import hashlib
import hmac
import json
import re
import secrets
from datetime import datetime, timezone

try:
    import bcrypt  # bcrypt는 설치된 환경에서만 선택적으로 사용한다.
except Exception:
    bcrypt = None

from jose import JWTError

from lib.Auth import (
    AuthConfig,
    Token,
    createAccessToken,
    createRefreshToken,
    decodeAuthToken,
)
from lib import Database as DB
from lib.Casing import convertKeysToCamelCase
from lib.Idempotency import beginIdempotencyRequest, completeIdempotencyRequest, discardIdempotencyReservation
from lib.Logger import logger
from lib.Masking import maskUserIdentifierForLog
from lib import PasswordResetMail
from lib.RequestContext import getRequestId
from lib.ServiceError import ServiceError
from lib.ServiceError import resolveServiceErrorCode
from lib.Transaction import transaction

# 리프레시 토큰 상태 타입
TOKEN_STATE_REVOKED = "revoked"
TOKEN_STATE_GRACE = "grace"

PASSWORD_MIN_LENGTH = 8
PASSWORD_RESET_TOKEN_TTL_MS = 30 * 60 * 1000
PASSWORD_RESET_TOKEN_PATTERN = re.compile(r"^[A-Za-z0-9_-]{43}$")

# 토큰 상태 저장소 준비 상태
tokenStateStoreReady = False

# 인메모리 폴백 스토어(DB 저장소 사용 불가 시 사용)
# 키는 refresh jti, 값은 refresh 만료 기준 ms TTL
revokedRefreshJtiStore: dict[str, int] = {}

# 키는 이전 refresh jti, 값은 expiresAtMs/tokenPayload 객체
refreshGraceStore: dict[str, dict[str, Any]] = {}


def tokenStateStoreUnavailableError(reason: str) -> RuntimeError:
    """
    설명: 토큰 상태 저장소 미가용 상황을 RuntimeError로 래핑하 헬퍼
    반환값: 원인(reason)이 포함된 RuntimeError 인스턴스
    갱신일: 2026-02-24
    """
    message = f"token state store unavailable: {reason}"
    return RuntimeError(message)


def getTokenStateStoreDbManager():
    """
    설명: 토큰 상태 저장에 사용할 DB 매니저 조회 헬퍼
    반환값: DB 매니저 또는 None
    갱신일: 2026-02-24
    """
    try:
        return DB.getManager()
    except Exception:
        return None


async def ensureTokenStateStore() -> bool:
    """
    설명: 리프레시 토큰 상태 저장소(DB)의 사용 가능 여부를 점검(필요 시 테이블 생성 DDL 포함)
    반환값: DB 저장소 준비 완료면 True
    실패 동작: DB 준비/접근 실패 시 RuntimeError를 발생시킨
    갱신일: 2026-02-26
    """
    global tokenStateStoreReady
    if tokenStateStoreReady:
        return True
    manager = getTokenStateStoreDbManager()
    if not manager:
        raise tokenStateStoreUnavailableError("db manager not ready")
    try:
        await manager.executeQuery("auth.ensureTokenStateTable")
        await manager.fetchOneQuery(
            "auth.getTokenState",
            {"stateType": TOKEN_STATE_REVOKED, "tokenJti": "__probe__"},
        )
        tokenStateStoreReady = True
        logger.info("auth token-state store ready (db)")
        return True
    except Exception as e:
        raise tokenStateStoreUnavailableError(type(e).__name__) from e


async def cleanupTokenStateStore(nowMs: int) -> bool:
    """
    설명: DB 토큰 상태 저장소에서 만료 항목 정리
    처리 규칙: DB 저장소 모드일 때 정리 쿼리 실패는 RuntimeError로 올려 fail-close
    반환값: DB 저장소 미사용(메모리 폴백)이면 False, DB 정리 성공이면 True
    실패 동작: DB 저장소 모드에서 매니저 누락/정리 쿼리 실패 시 RuntimeError를 발생시킨
    갱신일: 2026-03-02
    """
    useDbTokenStateStore = await ensureTokenStateStore()
    if not useDbTokenStateStore:
        return False
    manager = getTokenStateStoreDbManager()
    if not manager:
        raise tokenStateStoreUnavailableError("db manager missing after store ready")
    try:
        await manager.executeQuery("auth.deleteExpiredTokenState", {"nowMs": nowMs})
        return True
    except Exception as e:
        raise tokenStateStoreUnavailableError(f"cleanup_failed:{type(e).__name__}") from e


async def getTokenStateEntry(stateType: str, tokenJti: str) -> dict[str, Any] | None:
    """
    설명: DB 토큰 상태 조회 결과를 expiresAtMs/tokenPayload 구조로 복원하 로직
    반환값: expiresAtMs/tokenPayload를 포함한 상태 dict 또는 None
    갱신일: 2026-02-24
    """
    useDbTokenStateStore = await ensureTokenStateStore()
    if not useDbTokenStateStore:
        return None
    manager = getTokenStateStoreDbManager()
    if not manager:
        raise tokenStateStoreUnavailableError("db manager missing after store ready")
    try:
        row = await manager.fetchOneQuery(
            "auth.getTokenState",
            {"stateType": stateType, "tokenJti": tokenJti},
        )
        if not row:
            return None
        tokenStateRow = convertKeysToCamelCase(row)
        expiresAtMs = int(tokenStateRow.get("expiresAtMs", 0) or 0)
        payloadRaw = tokenStateRow.get("tokenPayloadJson")
        tokenPayload: dict[str, Any] | None = None
        if isinstance(payloadRaw, str) and payloadRaw.strip():
            try:
                parsed = json.loads(payloadRaw)
                if isinstance(parsed, dict):
                    tokenPayload = parsed
            except Exception:
                tokenPayload = None
        return {"expiresAtMs": expiresAtMs, "tokenPayload": tokenPayload}
    except Exception as e:
        raise tokenStateStoreUnavailableError(f"read_failed:{type(e).__name__}") from e


@transaction("main_db")
async def upsertTokenStateEntry(
    stateType: str,
    tokenJti: str,
    expiresAtMs: int,
    tokenPayload: dict[str, Any] | None = None,
) -> bool:
    """
    설명: DB 토큰 상태 저장소에 상태 항목 생성/갱신
    반환값: upsert 성공 여부(boolean)
    갱신일: 2026-02-24
    """
    useDbTokenStateStore = await ensureTokenStateStore()
    if not useDbTokenStateStore:
        return False
    manager = getTokenStateStoreDbManager()
    if not manager:
        raise tokenStateStoreUnavailableError("db manager missing after store ready")
    payloadJson: str | None = None
    if isinstance(tokenPayload, dict):
        try:
            payloadJson = json.dumps(tokenPayload, ensure_ascii=False)
        except Exception:
            payloadJson = None
    params = {
        "stateType": stateType,
        "tokenJti": tokenJti,
        "expiresAtMs": int(expiresAtMs or 0),
        "tokenPayloadJson": payloadJson,
    }
    existing = await getTokenStateEntry(stateType, tokenJti)

    try:
        if existing:
            await manager.executeQuery("auth.updateTokenState", params)
            return True
        await manager.executeQuery("auth.insertTokenState", params)
        return True
    except Exception as e:
        if isDuplicateTokenStateConstraintError(e):
            try:
                await manager.executeQuery("auth.updateTokenState", params)
                return True
            except Exception as updateError:
                raise tokenStateStoreUnavailableError(
                    f"write_failed:{type(updateError).__name__}"
                ) from updateError
        raise tokenStateStoreUnavailableError(f"write_failed:{type(e).__name__}") from e


async def deleteTokenStateEntry(stateType: str, tokenJti: str) -> bool:
    """
    설명: DB 토큰 상태 저장소에서 특정 항목 제거
    반환값: 삭제 쿼리 성공 여부(boolean)
    갱신일: 2026-02-24
    """
    useDbTokenStateStore = await ensureTokenStateStore()
    if not useDbTokenStateStore:
        return False
    manager = getTokenStateStoreDbManager()
    if not manager:
        raise tokenStateStoreUnavailableError("db manager missing after store ready")
    try:
        await manager.executeQuery(
            "auth.deleteTokenState",
            {"stateType": stateType, "tokenJti": tokenJti},
        )
        return True
    except Exception as e:
        raise tokenStateStoreUnavailableError(f"delete_failed:{type(e).__name__}") from e


def cleanupRefreshGraceStore(nowMs: int) -> None:
    """
    설명: refresh grace 캐시에서 만료된 항목 제거
    부작용: 전역 refreshGraceStore를 직접 갱신
    갱신일: 2026-01-17
    """
    try:
        expired = [
            jti for jti, entry in list(refreshGraceStore.items()) if int(entry.get("expiresAtMs", 0) or 0) <= nowMs
        ]
        for jti in expired:
            refreshGraceStore.pop(jti, None)

        # 과도한 메모리 사용 방지(템플릿 기본값)
        if len(refreshGraceStore) > 5000:

            # 임의로 오래된 순서 보장이 없으므로, 일부를 삭제해 폭주만 막는다.
            for jti in list(refreshGraceStore.keys())[:1000]:
                refreshGraceStore.pop(jti, None)
    except Exception:
        return


def cleanupRevokedRefreshJtiStore(nowMs: int) -> None:
    """
    설명: revoked refresh jti store에서 만료된 항목 제거(TTL)
    부작용: 전역 revokedRefreshJtiStore를 직접 갱신
    갱신일: 2026-01-18
    """
    try:
        expired = [
            jti for jti, expiresAtMs in list(revokedRefreshJtiStore.items()) if int(expiresAtMs or 0) <= nowMs
        ]
        for jti in expired:
            revokedRefreshJtiStore.pop(jti, None)

        # 과도한 메모리 사용 방지(템플릿 기본값)
        if len(revokedRefreshJtiStore) > 200_000:
            for jti in list(revokedRefreshJtiStore.keys())[:50_000]:
                revokedRefreshJtiStore.pop(jti, None)
    except Exception:
        return


def readCurrentEpochMs() -> int:
    """
    설명: 인증 감사/토큰 TTL 계산에 공통으로 쓰는 UTC epoch(ms) 생성 헬퍼
    처리 규칙: 시스템 현재 시각을 timezone.utc 기준으로 계산
    반환값: 밀리초 단위 Unix epoch 정수
    갱신일: 2026-02-24
    """
    return int(datetime.now(timezone.utc).timestamp() * 1000)


def auditLog(event: str, username: str | None, success: bool, meta: dict[str, Any] | None = None) -> None:
    """
    설명: 로그인/리프레시/로그아웃 등 인증 이벤트 감사 로그 기록
    부작용: 구조화된 JSON 로그를 남기며, 로깅 실패는 인증 흐름을 차단하지 않는
    갱신일: 2025-12-03
    """
    try:
        maskedUsername = maskUserIdentifierForLog(username)
        auditEntry: dict[str, Any] = {
            "ts": readCurrentEpochMs(),
            "event": event,
            "success": bool(success),
            "requestId": getRequestId(),
        }
        if maskedUsername:
            auditEntry["usernameMasked"] = maskedUsername
        if meta and isinstance(meta, dict):
            auditEntry.update(meta)
        logger.info(json.dumps(auditEntry, ensure_ascii=False))
    except Exception:

        # 로깅 실패가 인증 흐름을 막지 않도록 방어
        try:
            logger.info("auth_audit_fallback %s %s %s %s", event, maskUserIdentifierForLog(username), success, meta)
        except Exception:
            pass


def extractExpiryMs(payload: dict[str, Any], nowMs: int) -> int:
    """
    설명: JWT payload의 exp를 ms로 변환. 없으면 refreshExpire 설정으로 추정
    반환값: 밀리초 단위 만료 시각(expMs)
    갱신일: 2026-01-18
    """
    try:
        exp = payload.get("exp")
        if isinstance(exp, (int, float)):
            return int(exp * 1000)
    except Exception:
        pass
    try:
        minutes = int(getattr(AuthConfig, "refreshTokenExpireMinutes", 0) or 0)
    except Exception:
        minutes = 0
    return nowMs + max(0, minutes) * 60 * 1000


def normalizeLoginUsername(rawValue: Any) -> str | None:
    """
    설명: 로그인 식별자(username/email)를 공백 제거 및 이메일 소문자 기준으로 정규화
    처리 규칙: 문자열이 아니거나 공백 문자열이면 None, 이메일 형식(@ 포함)은 lower 처리
    반환값: 정규화된 로그인 식별자 문자열 또는 None
    갱신일: 2026-03-02
    """
    if not isinstance(rawValue, str):
        return None
    loginUsername = rawValue.strip()
    if not loginUsername:
        return None
    if "@" in loginUsername:
        return loginUsername.lower()
    return loginUsername


async def me(user):
    """
    설명: 인증 컨텍스트 사용자 객체를 API 응답용 최소 payload로 매핑하 로직
    반환값: username 필드를 포함한 사용자 식별 payload dict
    갱신일: 2026-02-25
    """
    return {"username": user.username}


async def login(payload: dict, rememberMe: bool = False) -> dict | None:
    """
    설명: 로그인 자격 증명 검증/토큰 발급/감사로그 오케스트레이션 처리
    반환값: 인증 성공 시 user/token dict, 실패 시 None
    갱신일: 2026-02-22
    """
    candidateUsername: str | None = None
    if isinstance(payload, dict):
        candidateUsername = normalizeLoginUsername(payload.get("username"))

    try:
        authUser, username = await authenticateUser(payload)
    except ServiceError as error:
        if resolveServiceErrorCode(error) == "AUTH_503_DB_NOT_READY":
            auditLog("auth.login", candidateUsername, False, {"reason": "auth_503_db_not_ready"})
        raise
    if not authUser or not username:
        auditLog("auth.login", candidateUsername, False, {"reason": "invalid_credentials"})
        return None
    tokenPayload = issueTokens(
        username,
        rememberMe,
        normalizeAuthVersion(authUser.get("authVersion")),
    )
    auditLog("auth.login", username, True, {"remember": bool(rememberMe)})
    return {"user": authUser, "token": tokenPayload}


def normalizeAuthVersion(value: Any) -> int:
    if isinstance(value, bool):
        return 0
    try:
        parsedAuthVersion = int(value or 0)
    except (TypeError, ValueError):
        return 0
    return max(0, parsedAuthVersion)


def hashPasswordResetToken(rawToken: str) -> str:
    return hashlib.sha256(rawToken.encode("utf-8")).hexdigest()


@transaction("main_db")
async def createPasswordResetTokenInTransaction(
    email: str,
    tokenHash: str,
    createdAtMs: int,
    expiresAtMs: int,
) -> str | None:
    db = DB.getManager()
    if not db:
        raise ServiceError("AUTH_503_DB_NOT_READY")
    userRow = await db.fetchOneQuery("auth.userForPasswordReset", {"email": email})
    if not userRow:
        return None
    user = convertKeysToCamelCase(userRow)
    userId = user.get("userId")
    recipient = user.get("userEml") or userId
    if not isinstance(userId, str) or not userId.strip():
        return None
    if not isinstance(recipient, str) or not recipient.strip():
        return None
    await db.executeQuery(
        "auth.supersedePasswordResetTokens",
        {"userId": userId, "usedAtMs": createdAtMs},
    )
    await db.executeQuery(
        "auth.insertPasswordResetToken",
        {
            "tokenHash": tokenHash,
            "userId": userId,
            "createdAtMs": createdAtMs,
            "expiresAtMs": expiresAtMs,
        },
    )
    return recipient.strip().lower()


def deliverPasswordResetMail(recipient: str, rawToken: str) -> bool:
    return PasswordResetMail.sendPasswordReset(recipient, rawToken)


async def processPasswordResetRequest(email: str) -> None:
    rawToken = secrets.token_urlsafe(32)
    tokenHash = hashPasswordResetToken(rawToken)
    nowMs = readCurrentEpochMs()
    try:
        recipient = await createPasswordResetTokenInTransaction(
            email,
            tokenHash,
            nowMs,
            nowMs + PASSWORD_RESET_TOKEN_TTL_MS,
        )
        if not recipient:
            auditLog(
                "auth.password_reset.delivery",
                email,
                True,
                {"delivery": "not_applicable"},
            )
            return
        sent = await asyncio.to_thread(deliverPasswordResetMail, recipient, rawToken)
        auditLog(
            "auth.password_reset.delivery",
            recipient,
            True,
            {"delivery": "sent" if sent else "disabled"},
        )
    except Exception as error:
        auditLog(
            "auth.password_reset.delivery",
            email,
            False,
            {"delivery": "failed", "reason": type(error).__name__},
        )
        logger.error(
            "password reset background processing failed: error=%s",
            type(error).__name__,
        )


async def requestPasswordReset(
    payload: dict,
    processingScheduler: Callable[[str], None] | None = None,
) -> tuple[dict | None, str | None]:
    """
    설명: 비밀번호 재설정 요청 입력을 검증하고 계정 존재 여부를 숨긴 채 성공 응답 반환
    반환값: (성공 결과 dict, None) 또는 (None, 에러코드)
    갱신일: 2026-04-08
    """
    if not isinstance(payload, dict):
        return None, "AUTH_422_INVALID_INPUT"
    rawEmail = payload.get("email")
    if not isinstance(rawEmail, str):
        return None, "AUTH_422_INVALID_INPUT"
    email = rawEmail.strip().lower()
    if not isValidEmail(email):
        return None, "AUTH_422_INVALID_INPUT"

    if processingScheduler:
        try:
            processingScheduler(email)
        except Exception as error:
            auditLog(
                "auth.password_reset.schedule",
                email,
                False,
                {"scheduled": False, "reason": type(error).__name__},
            )
            logger.error(
                "password reset background scheduling failed: error=%s",
                type(error).__name__,
            )

    auditLog("auth.password_reset.request", email, True, {"accepted": True})
    return {"accepted": True}, None


@transaction("main_db")
async def changePasswordInTransaction(
    userId: str,
    currentPassword: str,
    newPassword: str,
    usedAtMs: int,
) -> bool:
    """
    설명: 현재 사용자 row를 잠근 뒤 비밀번호 검증, hash/auth-version 갱신, reset token 대체를 원자 처리
    반환값: 현재 비밀번호가 일치해 변경되면 True, 사용자/비밀번호 불일치면 False
    """
    db = DB.getManager()
    if not db:
        raise ServiceError("AUTH_503_DB_NOT_READY")
    lockedUserRow = await db.fetchOneQuery(
        "auth.userForPasswordChange",
        {"userId": userId},
    )
    if not lockedUserRow:
        return False
    lockedUser = convertKeysToCamelCase(lockedUserRow)
    storedPassword = lockedUser.get("passwordHash") or lockedUser.get("userPw") or ""
    if not isinstance(storedPassword, str) or not verifyPassword(currentPassword, storedPassword):
        return False
    updated = await db.fetchOneQuery(
        "auth.updatePasswordAndAuthVersion",
        {"userId": userId, "userPw": hashPasswordPbkdf2(newPassword)},
    )
    if not updated:
        raise ServiceError("AUTH_500_PASSWORD_CHANGE_FAILED")
    await db.executeQuery(
        "auth.supersedePasswordResetTokens",
        {"userId": userId, "usedAtMs": usedAtMs},
    )
    return True


async def changePassword(
    userId: str | None,
    payload: dict,
) -> tuple[dict | None, str | None]:
    """
    설명: 인증 사용자 비밀번호 변경 입력을 방어 검증하고 transaction 결과를 안전한 코드로 변환
    반환값: (changed 결과, None) 또는 (None, 공개 가능한 auth 에러 코드)
    """
    if not isinstance(userId, str) or not userId.strip():
        return None, "AUTH_422_INVALID_INPUT"
    if not isinstance(payload, dict) or set(payload) != {"currentPassword", "newPassword"}:
        return None, "AUTH_422_INVALID_INPUT"
    currentPassword = payload.get("currentPassword")
    newPassword = payload.get("newPassword")
    if (
        not isinstance(currentPassword, str)
        or not currentPassword
        or not isinstance(newPassword, str)
        or len(newPassword) < PASSWORD_MIN_LENGTH
        or hmac.compare_digest(newPassword, currentPassword)
    ):
        return None, "AUTH_422_INVALID_INPUT"

    canonicalUserId = userId.strip()
    try:
        changed = await changePasswordInTransaction(
            canonicalUserId,
            currentPassword,
            newPassword,
            readCurrentEpochMs(),
        )
    except ServiceError as error:
        errorCode = resolveServiceErrorCode(error)
        if errorCode in {"AUTH_503_DB_NOT_READY", "DB_NOT_READY"}:
            return None, "AUTH_503_DB_NOT_READY"
        logger.error("password change failed: error=%s", type(error).__name__)
        return None, "AUTH_500_PASSWORD_CHANGE_FAILED"
    except Exception as error:
        logger.error("password change failed: error=%s", type(error).__name__)
        return None, "AUTH_500_PASSWORD_CHANGE_FAILED"
    if not changed:
        auditLog(
            "auth.password_change",
            canonicalUserId,
            False,
            {"reason": "current_password_invalid"},
        )
        return None, "AUTH_400_CURRENT_PASSWORD_INVALID"
    auditLog("auth.password_change", canonicalUserId, True, {"changed": True})
    return {"changed": True}, None


@transaction("main_db")
async def completePasswordResetInTransaction(tokenHash: str, newPassword: str, nowMs: int) -> bool:
    db = DB.getManager()
    if not db:
        raise ServiceError("AUTH_503_DB_NOT_READY")
    ownerRow = await db.fetchOneQuery(
        "auth.passwordResetTokenOwner",
        {"tokenHash": tokenHash, "nowMs": nowMs},
    )
    if not ownerRow:
        return False
    owner = convertKeysToCamelCase(ownerRow)
    userId = owner.get("userId")
    if not isinstance(userId, str) or not userId.strip():
        return False
    lockedUser = await db.fetchOneQuery(
        "auth.userForPasswordResetById",
        {"userId": userId},
    )
    if not lockedUser:
        return False
    consumed = await db.fetchOneQuery(
        "auth.consumePasswordResetToken",
        {"tokenHash": tokenHash, "usedAtMs": nowMs},
    )
    if not consumed:
        return False
    consumedToken = convertKeysToCamelCase(consumed)
    consumedUserId = consumedToken.get("userId")
    if not isinstance(consumedUserId, str) or consumedUserId.strip() != userId.strip():
        raise ServiceError("AUTH_400_RESET_INVALID_OR_EXPIRED")
    updated = await db.fetchOneQuery(
        "auth.updatePasswordAndAuthVersion",
        {"userId": userId, "userPw": hashPasswordPbkdf2(newPassword)},
    )
    if not updated:
        raise ServiceError("AUTH_400_RESET_INVALID_OR_EXPIRED")
    return True


async def completePasswordReset(payload: dict) -> tuple[dict | None, str | None]:
    if not isinstance(payload, dict):
        return None, "AUTH_422_INVALID_INPUT"
    rawToken = payload.get("token")
    newPassword = payload.get("newPassword")
    if (
        not isinstance(rawToken, str)
        or not PASSWORD_RESET_TOKEN_PATTERN.fullmatch(rawToken)
        or not isinstance(newPassword, str)
        or len(newPassword) < PASSWORD_MIN_LENGTH
    ):
        return None, "AUTH_422_INVALID_INPUT"

    tokenHash = hashPasswordResetToken(rawToken)
    try:
        completed = await completePasswordResetInTransaction(
            tokenHash,
            newPassword,
            readCurrentEpochMs(),
        )
    except ServiceError as error:
        errorCode = resolveServiceErrorCode(error)
        if errorCode == "AUTH_400_RESET_INVALID_OR_EXPIRED":
            return None, errorCode
        if errorCode == "AUTH_503_DB_NOT_READY":
            return None, errorCode
        return None, "AUTH_500_PASSWORD_RESET_FAILED"
    except Exception as error:
        logger.error("password reset completion failed: error=%s", type(error).__name__)
        return None, "AUTH_500_PASSWORD_RESET_FAILED"
    if not completed:
        return None, "AUTH_400_RESET_INVALID_OR_EXPIRED"
    auditLog("auth.password_reset.complete", None, True, {"completed": True})
    return {"completed": True}, None


def hashPasswordPbkdf2(plain: str, iterations: int = 260000) -> str:
    """
    설명: 평문 비밀번호를 저장 규격(pbkdf2$. ) 문자열로 인코딩하는 해시 유틸
    반환값: `pbkdf2$iterations$salt$hash` 형식의 저장용 해시 문자열
    갱신일: 2026-02-22
    """
    salt = secrets.token_bytes(16)
    derivedKey = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt, iterations)
    return f"pbkdf2${iterations}${base64.b64encode(salt).decode()}${base64.b64encode(derivedKey).decode()}"


def isValidEmail(value: str) -> bool:
    """
    설명: 기본 이메일 형식 검사
    반환값: 이메일 정규식 일치 여부(boolean)
    갱신일: 2026-02-22
    """
    return bool(re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", value or ""))


def isDuplicateUserConstraintError(error: Exception) -> bool:
    """
    설명: DB unique 제약 위반(중복 가입) 예외인지 판별
    갱신일: 2026-02-24
    """
    text = str(error or "").lower()
    if not text:
        return False
    duplicateTokens = (
        "duplicate key",
        "duplicate entry",
        "unique constraint failed",
        "violates unique constraint",
    )
    if any(token in text for token in duplicateTokens):
        return True
    if "integrityerror" in text and ("unique" in text or "duplicate" in text):
        return True
    return False


def isDuplicateTokenStateConstraintError(error: Exception) -> bool:
    """
    설명: 토큰 상태 저장의 unique 제약 위반 예외인지 판별
    갱신일: 2026-02-24
    """
    text = str(error or "").lower()
    if not text:
        return False
    duplicateTokens = (
        "duplicate key",
        "duplicate entry",
        "unique constraint failed",
        "violates unique constraint",
    )
    if any(token in text for token in duplicateTokens):
        return True
    if "integrityerror" in text and ("unique" in text or "duplicate" in text):
        return True
    return False


async def signup(payload: dict, idempotencyKey: str | None = None) -> tuple[dict | None, str | None]:
    """
    설명: 회원가입 입력 검증, 중복 확인, 계정 생성, 결과 코드 매핑까지 처리하 흐름
    반환값: (성공 결과 dict, None) 또는 (None, 에러코드)
    갱신일: 2026-02-22
    """
    if not isinstance(payload, dict):
        return None, "AUTH_422_INVALID_INPUT"

    rawName = payload.get("name")
    rawEmail = payload.get("email")
    rawPassword = payload.get("password")
    if not isinstance(rawName, str) or not isinstance(rawEmail, str) or not isinstance(rawPassword, str):
        return None, "AUTH_422_INVALID_INPUT"

    name = rawName.strip()
    email = rawEmail.strip().lower()
    password = rawPassword
    if len(name) < 2 or len(password) < PASSWORD_MIN_LENGTH or not isValidEmail(email):
        return None, "AUTH_422_INVALID_INPUT"

    signupPayload = {
        "name": name,
        "email": email,
    }

    try:
        replay = await beginIdempotencyRequest("auth.signup", idempotencyKey, signupPayload)
        if replay.get("status") == "replay":
            return replay.get("result") or {}, None
        createdPendingEntry = replay.get("status") == "new"
        try:
            result = await signupInTransaction(name, email, password)
        except Exception as error:
            serviceErrorCode = resolveServiceErrorCode(error)
            if serviceErrorCode == "DB_NOT_READY":
                serviceErrorCode = "AUTH_503_DB_NOT_READY"
            if createdPendingEntry:
                await discardIdempotencyReservation("auth.signup", idempotencyKey)
            if serviceErrorCode:
                auditLog("auth.signup", email, False, {"reason": serviceErrorCode.lower()})
                return None, serviceErrorCode
            auditLog("auth.signup", email, False, {"reason": "exception"})
            logger.error(f"signup failed: error={type(error).__name__}")
            return None, "AUTH_500_SIGNUP_FAILED"
        await completeIdempotencyRequest("auth.signup", idempotencyKey, result)
        auditLog("auth.signup", email, True, {})
        return result, None
    except Exception as e:
        serviceErrorCode = resolveServiceErrorCode(e)
        if serviceErrorCode == "DB_NOT_READY":
            serviceErrorCode = "AUTH_503_DB_NOT_READY"
        if serviceErrorCode:
            auditLog("auth.signup", email, False, {"reason": serviceErrorCode.lower()})
            return None, serviceErrorCode
        auditLog("auth.signup", email, False, {"reason": "exception"})
        logger.error(f"signup failed: error={type(e).__name__}")
        return None, "AUTH_500_SIGNUP_FAILED"


@transaction("main_db")
async def signupInTransaction(name: str, email: str, password: str) -> dict:
    """
    설명: 회원가입 DB 생성 트랜잭션 내부 단계
    반환값: 성공 결과 dict
    갱신일: 2026-06-24
    """
    db = DB.getManager()
    if not db:
        raise ServiceError("AUTH_503_DB_NOT_READY")

    exists = await db.fetchOneQuery("auth.userByUsername", {"u": email})
    if exists:
        raise ServiceError("AUTH_409_USER_EXISTS")

    passwordHash = hashPasswordPbkdf2(password)
    try:
        await db.executeQuery(
            "auth.insertUser",
            {
                "userId": email,
                "userPw": passwordHash,
                "userNm": name,
                "userEml": email,
                "roleCd": "user",
            },
        )
    except Exception as insertError:
        if isDuplicateUserConstraintError(insertError):
            raise ServiceError("AUTH_409_USER_EXISTS") from insertError
        raise
    created = await db.fetchOneQuery("auth.userByUsername", {"u": email})
    if not created:
        raise ServiceError("AUTH_500_SIGNUP_FAILED")
    createdUser = convertKeysToCamelCase(created)
    return {
        "userId": createdUser.get("userId") or email,
        "userNm": createdUser.get("userNm") or name,
    }


@transaction("main_db")
async def ensureSeedUser(payload: dict) -> dict:
    """
    설명: 명시적으로 실행되는 데모/샘플 사용자 시드 upsert 수행
    반환값: action/userId/userNm/roleCd를 포함한 시드 결과 dict
    실패 동작: 입력 오류는 ValueError, DB 미준비는 RuntimeError, 쓰기 오류는 원본 예외를 전파
    갱신일: 2026-04-08
    """
    if not isinstance(payload, dict):
        raise ValueError("AUTH_422_INVALID_INPUT")

    rawName = payload.get("name")
    rawEmail = payload.get("email")
    rawPassword = payload.get("password")
    rawRole = payload.get("roleCd")

    if not isinstance(rawName, str) or not isinstance(rawEmail, str) or not isinstance(rawPassword, str):
        raise ValueError("AUTH_422_INVALID_INPUT")

    name = rawName.strip()
    email = rawEmail.strip().lower()
    password = rawPassword
    roleCd = rawRole.strip() if isinstance(rawRole, str) and rawRole.strip() else "user"

    if len(name) < 2 or len(password) < PASSWORD_MIN_LENGTH or not isValidEmail(email):
        raise ValueError("AUTH_422_INVALID_INPUT")

    db = DB.getManager()
    if not db:
        raise RuntimeError("AUTH_503_DB_NOT_READY")

    userParams = {
        "userId": email,
        "userPw": hashPasswordPbkdf2(password),
        "userNm": name,
        "userEml": email,
        "roleCd": roleCd,
    }
    existing = await db.fetchOneQuery("auth.userByUsername", {"u": email})
    if existing:
        await db.executeQuery("auth.updateUserSeed", userParams)
        action = "updated"
    else:
        await db.executeQuery("auth.insertUser", userParams)
        action = "inserted"

    return {
        "action": action,
        "userId": email,
        "userNm": name,
        "roleCd": roleCd,
    }


def session(payload: dict) -> dict:
    """
    설명: 세션 조회 원본 payload를 authenticated 중심 표준 결과 형태로 정규화하 매퍼
    반환값: authenticated/userId/name 필드를 갖는 세션 결과 dict
    갱신일: 2026-02-22
    """
    userId = (payload or {}).get("userId")
    name = (payload or {}).get("name")
    authed = bool(userId)
    result: dict[str, object] = {"authenticated": authed}
    if authed:
        result.update({"userId": userId, "name": name})
    return result


def csrf(_: dict | None = None) -> dict:
    """
    설명: 프런트 초기 연동용 임시 CSRF 응답 payload 생성 유틸
    반환값: uuid 기반 csrf 토큰 dict
    갱신일: 2026-02-22
    """
    return {"csrf": uuid.uuid4().hex}


async def refresh(refreshToken: str) -> dict | None:
    """
    설명: refresh 토큰 회전 정책으로 새 Access/Refresh 토큰 발급
    반환값: 재발급 토큰 payload dict 또는 실패 시 None
    갱신일: 2026-02-22
    """
    nowMs = readCurrentEpochMs()
    useDbTokenStateStore = await cleanupTokenStateStore(nowMs)
    cleanupRefreshGraceStore(nowMs)
    cleanupRevokedRefreshJtiStore(nowMs)
    payload = decodeRefreshTokenPayload(refreshToken)
    if not payload:
        auditLog("auth.refresh", None, False, {"reason": "invalid_refresh"})
        return None

    username = payload.get("sub")
    remember = bool(payload.get("remember"))
    jti = payload.get("jti")

    if not isinstance(username, str) or not username:
        auditLog("auth.refresh", None, False, {"reason": "missing_sub"})
        return None
    if not isinstance(jti, str) or not jti:
        auditLog("auth.refresh", username, False, {"reason": "missing_jti"})
        return None
    tokenAuthVersion = normalizeAuthVersion(payload.get("authVersion"))
    currentAuthVersion = await readUserAuthVersion(username)
    if currentAuthVersion is None or currentAuthVersion != tokenAuthVersion:
        auditLog("auth.refresh", username, False, {"reason": "auth_version_mismatch"})
        return None
    revokedExpiresAtMs = 0
    if useDbTokenStateStore:
        revokedEntry = await getTokenStateEntry(TOKEN_STATE_REVOKED, jti)
        revokedExpiresAtMs = int(revokedEntry.get("expiresAtMs", 0) or 0) if isinstance(revokedEntry, dict) else 0
    if not revokedExpiresAtMs:
        revokedExpiresAtMs = int(revokedRefreshJtiStore.get(jti, 0) or 0)

    if revokedExpiresAtMs and nowMs < revokedExpiresAtMs:

        # 이미 사용됐거나 로그아웃된 리프레시 토큰 재사용 시도
        cached = None
        if useDbTokenStateStore:
            cached = await getTokenStateEntry(TOKEN_STATE_GRACE, jti)
        cachedExpiresAtMs = int(cached.get("expiresAtMs", 0) or 0) if isinstance(cached, dict) else 0
        cachedTokenPayload = cached.get("tokenPayload") if isinstance(cached, dict) else None
        if not (
            cachedExpiresAtMs
            and nowMs < cachedExpiresAtMs
            and isinstance(cachedTokenPayload, dict)
        ):
            cached = refreshGraceStore.get(jti)
        expiresAtMs = int(cached.get("expiresAtMs", 0) or 0) if isinstance(cached, dict) else 0
        tokenPayload = cached.get("tokenPayload") if isinstance(cached, dict) else None
        if expiresAtMs and nowMs < expiresAtMs and isinstance(tokenPayload, dict):
            auditLog("auth.refresh", username, True, {"grace": True, "reason": "grace_reuse"})
            return tokenPayload
        auditLog("auth.refresh", username, False, {"reason": "reused_token"})
        return None

    # TTL이 지난 항목이면 제거한다(만료된 refresh 토큰은 어차피 decode 단계에서 걸린다).
    if revokedExpiresAtMs:
        if useDbTokenStateStore:
            await deleteTokenStateEntry(TOKEN_STATE_REVOKED, jti)
        revokedRefreshJtiStore.pop(jti, None)

    # 현재 리프레시 토큰은 더 이상 사용하지 못하도록 블랙리스트에 추가
    revokedExpiresAtMs = extractExpiryMs(payload, nowMs)
    revokedRefreshJtiStore[jti] = revokedExpiresAtMs
    if useDbTokenStateStore:
        await upsertTokenStateEntry(TOKEN_STATE_REVOKED, jti, revokedExpiresAtMs, None)

    tokenPayload = issueTokens(username, remember, currentAuthVersion)

    # 다중 탭/네트워크 재시도 경합을 위해 짧은 유예 시간 동안 동일 토큰 페이로드를 재응답할 수 있게 캐시한다.
    graceMs = max(0, int(getattr(AuthConfig, "refreshGraceMs", 0) or 0))
    if graceMs > 0:
        graceExpiresAtMs = nowMs + graceMs
        refreshGraceStore[jti] = {
            "expiresAtMs": graceExpiresAtMs,
            "tokenPayload": tokenPayload,
        }
        if useDbTokenStateStore:
            await upsertTokenStateEntry(
                TOKEN_STATE_GRACE,
                jti,
                graceExpiresAtMs,
                None,
            )
    elif useDbTokenStateStore:
        await deleteTokenStateEntry(TOKEN_STATE_GRACE, jti)
    auditLog("auth.refresh", username, True, {"remember": bool(remember)})
    return tokenPayload


async def revokeRefreshToken(refreshToken: str | None) -> None:
    """
    설명: 로그아웃 시 리프레시 토큰을 블랙리스트에 추가해 재사용 차단
    부작용: 토큰 상태 저장소/인메모리 블랙리스트를 갱신하고 감사 로그를 기록
    갱신일: 2025-12-03
    """
    if not refreshToken:
        auditLog("auth.logout", None, True, {"reason": "no_refresh_cookie"})
        return

    nowMs = readCurrentEpochMs()
    useDbTokenStateStore = await cleanupTokenStateStore(nowMs)
    cleanupRefreshGraceStore(nowMs)
    cleanupRevokedRefreshJtiStore(nowMs)

    payload = decodeRefreshTokenPayload(refreshToken)
    if not payload:
        auditLog("auth.logout", None, False, {"reason": "invalid_refresh"})
        return

    username = payload.get("sub") if isinstance(payload.get("sub"), str) else None
    jti = payload.get("jti")
    if isinstance(jti, str) and jti:
        revokedExpiresAtMs = extractExpiryMs(payload, nowMs)
        revokedRefreshJtiStore[jti] = revokedExpiresAtMs
        if useDbTokenStateStore:
            await upsertTokenStateEntry(TOKEN_STATE_REVOKED, jti, revokedExpiresAtMs, None)
    auditLog("auth.logout", username, True, {})


def verifyPassword(plain: str, stored: str) -> bool:
    """
    설명: 저장 해시 규격(pbkdf2/bcrypt)에 맞춰 평문 비밀번호 일치 여부를 판정하 검증기
    반환값: 해시 검증 성공 여부(boolean)
    갱신일: 2026-02-22
    """
    try:
        if stored and stored.startswith("pbkdf2$"):
            parts = stored.split("$")
            iters = int(parts[1])
            salt = base64.b64decode(parts[2])
            expected = base64.b64decode(parts[3])
            dk = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt, iters)
            return hmac.compare_digest(dk, expected)

        # bcrypt 해시($2a$/$2b$)일 경우에만 시도. getattr로 안전 호출해 Pylance 경고를 피한다.
        if stored.startswith("$2a$") or stored.startswith("$2b$"):
            fn = getattr(bcrypt, "checkpw", None)
            if callable(fn):
                try:
                    return bool(fn(plain.encode("utf-8"), stored.encode("utf-8")))
                except Exception:
                    return False
        return False
    except Exception:
        return False


async def authenticateUser(payload: dict) -> tuple[dict | None, str | None]:
    """
    설명: 로그인 payload에서 자격 증명 확인 후 사용자 도메인 객체를 조회하는 인증 단계
    반환값: (인증 사용자 dict, username) 또는 (None, None)
    갱신일: 2026-02-22
    """
    if not isinstance(payload, dict):
        return None, None
    username = normalizeLoginUsername(payload.get("username"))
    password = payload.get("password")
    if not isinstance(username, str) or not isinstance(password, str):
        return None, None
    db = DB.getManager()
    if not db:
        return None, None
    try:
        user = await db.fetchOneQuery("auth.userByUsername", {"u": username})
    except Exception as error:
        if resolveServiceErrorCode(error) == "DB_NOT_READY":
            raise ServiceError("AUTH_503_DB_NOT_READY") from error
        raise
    if not user:
        return None, None
    authUser = convertKeysToCamelCase(user)
    passwordHash = authUser.get("passwordHash") or authUser.get("userPw") or ""
    if not verifyPassword(password, passwordHash):
        return None, None
    authUser.pop("userPw", None)
    authUser.pop("passwordHash", None)
    canonicalUserId = authUser.get("userId")
    if isinstance(canonicalUserId, str) and canonicalUserId.strip():
        return authUser, canonicalUserId.strip()
    return authUser, username


async def readUserAuthVersion(username: str) -> int | None:
    db = DB.getManager()
    if not db:
        return None
    row = await db.fetchOneQuery("auth.userAuthVersion", {"userId": username})
    if not row:
        return None
    user = convertKeysToCamelCase(row)
    return normalizeAuthVersion(user.get("authVersion"))


def decodeRefreshTokenPayload(refreshToken: str) -> dict[str, Any] | None:
    """
    설명: 리프레시 토큰을 디코드해 페이로드를 반환. typ이 refresh가 아니면 None
    반환값: 유효한 refresh 토큰 payload dict 또는 None
    갱신일: 2025-12-03
    """
    try:
        return decodeAuthToken(refreshToken, expectedTokenType="refresh")
    except JWTError:
        return None


def issueTokens(username: str, remember: bool = False, authVersion: int = 0) -> dict:
    """
    설명: 사용자/remember 조건을 반영한 Access/Refresh 토큰 페이로드 구성 로직
    반환값: access/refresh 토큰 문자열과 만료 정보를 포함한 dict
    갱신일: 2026-02-22
    """
    claims = {
        "sub": username,
        "remember": remember,
        "authVersion": normalizeAuthVersion(authVersion),
    }
    accessToken: Token = createAccessToken(claims, tokenType="access")
    refreshToken: Token = createRefreshToken(claims)
    return {
        "accessToken": accessToken.accessToken,
        "refreshToken": refreshToken.accessToken,
        "tokenType": accessToken.tokenType,
        "expiresIn": accessToken.expiresIn,
        "refreshExpiresIn": refreshToken.expiresIn,
        "remember": remember,
    }
