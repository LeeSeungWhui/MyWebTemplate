"""
파일명: backend/service/AuthService.py
작성자: LSH
갱신일: 2026-02-22
설명: 인증 도메인 서비스. 비즈니스 로직만 포함한다(HTTP/세션은 라우터 책임).
"""

import uuid
from typing import Any

import base64
import hashlib
import hmac
import json
import re
import secrets
from datetime import datetime, timezone

try:
    import bcrypt  # optional; used only if available
except Exception:
    bcrypt = None

from jose import JWTError, jwt

from lib.Auth import AuthConfig, Token, createAccessToken, createRefreshToken
from lib import Database as DB
from lib.Logger import logger
from lib.RequestContext import getRequestId
from lib.Response import successResponse

# 리프레시 토큰 상태 타입
TOKEN_STATE_REVOKED = "revoked"
TOKEN_STATE_GRACE = "grace"

# 토큰 상태 저장소 준비 상태
tokenStateStoreReady = False
tokenStateStoreWarned = False

# 인메모리 폴백 스토어(DB 저장소 사용 불가 시 사용)
# key: refresh jti, value: expiresAtMs(refresh exp 기반 TTL)
revokedRefreshJtiStore: dict[str, int] = {}
# key: 이전 refresh jti, value: {"expiresAtMs": int, "tokenPayload": dict}
refreshGraceStore: dict[str, dict[str, Any]] = {}


def _getTokenStateStoreDbManager():
    """
    설명: 토큰 상태 저장에 사용할 DB 매니저를 반환한다.
    갱신일: 2026-02-24
    """
    try:
        return DB.getManager()
    except Exception:
        return None


async def ensureTokenStateStore() -> bool:
    """
    설명: 리프레시 토큰 상태 저장소(DB)의 사용 가능 여부를 점검한다(DDL 미수행).
    갱신일: 2026-02-24
    """
    global tokenStateStoreReady, tokenStateStoreWarned
    if tokenStateStoreReady:
        return True
    manager = _getTokenStateStoreDbManager()
    if not manager:
        if not tokenStateStoreWarned:
            logger.warning("auth token-state DB manager not ready. fallback=memory")
            tokenStateStoreWarned = True
        return False
    try:
        await manager.fetchOneQuery(
            "auth.getTokenState",
            {"stateType": TOKEN_STATE_REVOKED, "tokenJti": "__probe__"},
        )
        tokenStateStoreReady = True
        logger.info("auth token-state store ready (db)")
        return True
    except Exception as e:
        if not tokenStateStoreWarned:
            logger.warning(
                f"auth token-state store unavailable (schema missing or db error). "
                f"fallback=memory error={type(e).__name__}"
            )
            tokenStateStoreWarned = True
        return False


async def cleanupTokenStateStore(nowMs: int) -> bool:
    """
    설명: DB 토큰 상태 저장소에서 만료 항목을 정리한다.
    갱신일: 2026-02-24
    """
    if not await ensureTokenStateStore():
        return False
    manager = _getTokenStateStoreDbManager()
    if not manager:
        return False
    try:
        await manager.executeQuery("auth.deleteExpiredTokenState", {"nowMs": nowMs})
        return True
    except Exception:
        return False


async def getTokenStateEntry(stateType: str, tokenJti: str) -> dict[str, Any] | None:
    """
    설명: DB 토큰 상태 저장소에서 상태 항목을 조회한다.
    갱신일: 2026-02-24
    """
    if not await ensureTokenStateStore():
        return None
    manager = _getTokenStateStoreDbManager()
    if not manager:
        return None
    try:
        row = await manager.fetchOneQuery(
            "auth.getTokenState",
            {"stateType": stateType, "tokenJti": tokenJti},
        )
        if not row:
            return None
        expiresAtMs = int(row.get("expiresAtMs", 0) or 0)
        payloadRaw = row.get("tokenPayloadJson")
        tokenPayload: dict[str, Any] | None = None
        if isinstance(payloadRaw, str) and payloadRaw.strip():
            try:
                parsed = json.loads(payloadRaw)
                if isinstance(parsed, dict):
                    tokenPayload = parsed
            except Exception:
                tokenPayload = None
        return {"expiresAtMs": expiresAtMs, "tokenPayload": tokenPayload}
    except Exception:
        return None


async def upsertTokenStateEntry(
    stateType: str,
    tokenJti: str,
    expiresAtMs: int,
    tokenPayload: dict[str, Any] | None = None,
) -> bool:
    """
    설명: DB 토큰 상태 저장소에 상태 항목을 생성/갱신한다.
    갱신일: 2026-02-24
    """
    if not await ensureTokenStateStore():
        return False
    manager = _getTokenStateStoreDbManager()
    if not manager:
        return False
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
            except Exception:
                return False
        return False


async def deleteTokenStateEntry(stateType: str, tokenJti: str) -> bool:
    """
    설명: DB 토큰 상태 저장소에서 특정 항목을 제거한다.
    갱신일: 2026-02-24
    """
    if not await ensureTokenStateStore():
        return False
    manager = _getTokenStateStoreDbManager()
    if not manager:
        return False
    try:
        await manager.executeQuery(
            "auth.deleteTokenState",
            {"stateType": stateType, "tokenJti": tokenJti},
        )
        return True
    except Exception:
        return False


def cleanupRefreshGraceStore(nowMs: int) -> None:
    """
    설명: refresh grace 캐시에서 만료된 항목을 제거한다.
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
    설명: revoked refresh jti store에서 만료된 항목을 제거한다(TTL).
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


def _nowMs() -> int:
    return int(datetime.now(timezone.utc).timestamp() * 1000)


def maskUsernameForAudit(username: str | None) -> str | None:
    """
    설명: 감사 로그(audit)에서 사용자 식별자를 마스킹한다.
    갱신일: 2026-02-22
    """
    value = str(username or "").strip()
    if not value:
        return None
    if "@" in value:
        localPart, domainPart = value.split("@", 1)
        if not localPart:
            return f"***@{domainPart}"
        if len(localPart) == 1:
            maskedLocal = "*"
        elif len(localPart) == 2:
            maskedLocal = f"{localPart[0]}*"
        else:
            maskedLocal = f"{localPart[:2]}{'*' * (len(localPart) - 2)}"
        return f"{maskedLocal}@{domainPart}"
    if len(value) == 1:
        return "*"
    if len(value) == 2:
        return f"{value[0]}*"
    return f"{value[:2]}{'*' * (len(value) - 2)}"


def auditLog(event: str, username: str | None, success: bool, meta: dict[str, Any] | None = None) -> None:
    """
    설명: 로그인/리프레시/로그아웃 등 인증 이벤트 감사 로그를 남긴다.
    갱신일: 2025-12-03
    """
    try:
        maskedUsername = maskUsernameForAudit(username)
        payload: dict[str, Any] = {
            "ts": _nowMs(),
            "event": event,
            "success": bool(success),
            "requestId": getRequestId(),
        }
        if maskedUsername:
            payload["usernameMasked"] = maskedUsername
        if meta and isinstance(meta, dict):
            payload.update(meta)
        logger.info(json.dumps(payload, ensure_ascii=False))
    except Exception:
        # 로깅 실패가 인증 흐름을 막지 않도록 방어
        try:
            logger.info("auth_audit_fallback %s %s %s %s", event, maskUsernameForAudit(username), success, meta)
        except Exception:
            pass


def _extractExpMs(payload: dict[str, Any], nowMs: int) -> int:
    """
    설명: JWT payload의 exp를 ms로 변환한다. 없으면 refreshExpire 설정으로 추정한다.
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


async def me(user):
    """
    설명: 현재 인증 사용자 정보를 응답 스키마로 변환한다.
    갱신일: 2026-02-22
    """
    return successResponse(result={"username": user.username})


async def login(payload: dict, rememberMe: bool = False) -> dict | None:
    """
    설명: 로그인 입력을 검증하고 사용자/토큰 정보를 반환한다.
    갱신일: 2026-02-22
    """
    candidateUsername: str | None = None
    if isinstance(payload, dict):
        rawUsername = payload.get("username")
        if isinstance(rawUsername, str):
            candidateUsername = rawUsername

    authUser, username = await authenticateUser(payload)
    if not authUser or not username:
        auditLog("auth.login", candidateUsername, False, {"reason": "invalid_credentials"})
        return None
    tokenPayload = issueTokens(username, rememberMe)
    auditLog("auth.login", username, True, {"remember": bool(rememberMe)})
    return {"user": authUser, "token": tokenPayload}


def hashPasswordPbkdf2(plain: str, iterations: int = 260000) -> str:
    """
    설명: 평문 비밀번호를 PBKDF2 해시 문자열로 변환한다.
    갱신일: 2026-02-22
    """
    salt = secrets.token_bytes(16)
    derivedKey = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt, iterations)
    return f"pbkdf2${iterations}${base64.b64encode(salt).decode()}${base64.b64encode(derivedKey).decode()}"


def isValidEmail(value: str) -> bool:
    """
    설명: 기본 이메일 형식을 검사한다.
    갱신일: 2026-02-22
    """
    return bool(re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", value or ""))


def isDuplicateUserConstraintError(error: Exception) -> bool:
    """
    설명: DB unique 제약 위반(중복 가입) 예외인지 판별한다.
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
    설명: 토큰 상태 저장의 unique 제약 위반 예외인지 판별한다.
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


async def signup(payload: dict) -> tuple[dict | None, str | None]:
    """
    설명: 회원가입 입력을 검증하고 신규 계정을 생성한다.
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
    if len(name) < 2 or len(password) < 8 or not isValidEmail(email):
        return None, "AUTH_422_INVALID_INPUT"

    db = DB.getManager()
    if not db:
        return None, "AUTH_503_DB_NOT_READY"

    try:
        exists = await db.fetchOneQuery("auth.userByUsername", {"u": email})
        if exists:
            auditLog("auth.signup", email, False, {"reason": "user_exists"})
            return None, "AUTH_409_USER_EXISTS"

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
                auditLog("auth.signup", email, False, {"reason": "user_exists_race"})
                return None, "AUTH_409_USER_EXISTS"
            raise
        created = await db.fetchOneQuery("auth.userByUsername", {"u": email})
        if not created:
            auditLog("auth.signup", email, False, {"reason": "create_failed"})
            return None, "AUTH_500_SIGNUP_FAILED"

        result = {
            "userId": created.get("username") or email,
            "userNm": created.get("name") or name,
        }
        auditLog("auth.signup", email, True, {})
        return result, None
    except Exception as e:
        auditLog("auth.signup", email, False, {"reason": "exception"})
        logger.error(f"signup failed: error={type(e).__name__}")
        return None, "AUTH_500_SIGNUP_FAILED"


def session(payload: dict) -> dict:
    """
    설명: 세션 조회 payload를 표준 result 구조로 매핑한다.
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
    설명: 임시 CSRF 토큰 응답 payload를 생성한다.
    갱신일: 2026-02-22
    """
    return {"csrf": uuid.uuid4().hex}


async def refresh(refreshToken: str) -> dict | None:
    """
    설명: refresh 토큰 회전 정책으로 새 Access/Refresh 토큰을 발급한다.
    갱신일: 2026-02-22
    """
    nowMs = _nowMs()
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
        if not cached:
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
    revokedExpiresAtMs = _extractExpMs(payload, nowMs)
    revokedRefreshJtiStore[jti] = revokedExpiresAtMs
    if useDbTokenStateStore:
        await upsertTokenStateEntry(TOKEN_STATE_REVOKED, jti, revokedExpiresAtMs, None)

    tokenPayload = issueTokens(username, remember)
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
                tokenPayload,
            )
    elif useDbTokenStateStore:
        await deleteTokenStateEntry(TOKEN_STATE_GRACE, jti)
    auditLog("auth.refresh", username, True, {"remember": bool(remember)})
    return tokenPayload


async def revokeRefreshToken(refreshToken: str | None) -> None:
    """
    설명: 로그아웃 시 리프레시 토큰을 블랙리스트에 추가해 재사용을 차단한다.
    갱신일: 2025-12-03
    """
    if not refreshToken:
        auditLog("auth.logout", None, True, {"reason": "no_refresh_cookie"})
        return

    nowMs = _nowMs()
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
        revokedExpiresAtMs = _extractExpMs(payload, nowMs)
        revokedRefreshJtiStore[jti] = revokedExpiresAtMs
        if useDbTokenStateStore:
            await upsertTokenStateEntry(TOKEN_STATE_REVOKED, jti, revokedExpiresAtMs, None)
    auditLog("auth.logout", username, True, {})


def verifyPassword(plain: str, stored: str) -> bool:
    """
    설명: 저장된 해시(pbkdf2/bcrypt)와 평문 비밀번호 일치 여부를 검증한다.
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
    설명: 로그인 payload에서 자격 증명을 확인하고 사용자 정보를 반환한다.
    갱신일: 2026-02-22
    """
    if not isinstance(payload, dict):
        return None, None
    username = payload.get("username")
    password = payload.get("password")
    if not isinstance(username, str) or not isinstance(password, str):
        return None, None
    db = DB.getManager()
    if not db:
        return None, None
    user = await db.fetchOneQuery("auth.userByUsername", {"u": username})
    if not user:
        return None, None
    if not verifyPassword(password, user.get("password_hash") or ""):
        return None, None
    return user, username


def decodeRefreshTokenPayload(refreshToken: str) -> dict[str, Any] | None:
    """
    설명: 리프레시 토큰을 디코드해 페이로드를 반환한다. typ이 refresh가 아니면 None.
    갱신일: 2025-12-03
    """
    try:
        secret = AuthConfig.secretKey
        if not secret:
            return None
        payload = jwt.decode(refreshToken, secret, algorithms=[AuthConfig.algorithm])
        tokenType = payload.get("typ")
        if tokenType != "refresh":
            return None
        return payload
    except JWTError:
        return None


def issueTokens(username: str, remember: bool = False) -> dict:
    """
    설명: 사용자 기준 Access/Refresh 토큰 페이로드를 생성한다.
    갱신일: 2026-02-22
    """
    accessToken: Token = createAccessToken({"sub": username, "remember": remember}, tokenType="access")
    refreshToken: Token = createRefreshToken({"sub": username, "remember": remember})
    return {
        "accessToken": accessToken.accessToken,
        "refreshToken": refreshToken.accessToken,
        "tokenType": accessToken.tokenType,
        "expiresIn": accessToken.expiresIn,
        "refreshExpiresIn": refreshToken.expiresIn,
        "remember": remember,
    }
