"""
파일명: backend/lib/UserAccessLog.py
작성자: LSH
갱신일: 2026-02-25
설명: 인증 사용자 접근 로그를 DB 테이블(T_USER_LOG)에 적재한다.
"""

from __future__ import annotations

import asyncio
import ipaddress
import json
import os
import time
import uuid
from typing import Optional

import httpx

from lib import Database as DB
from lib.Logger import logger
from .Masking import maskUserIdentifierForLog

try:
    from .Config import getConfig  # type: ignore
except Exception:
    from lib.Config import getConfig  # type: ignore


ipGeoCache: dict[str, dict[str, object]] = {}
ipGeoCacheLock = asyncio.Lock()


def parseBool(rawValue: object, defaultValue: bool = False) -> bool:
    """
    설명: 다양한 입력값을 bool로 파싱한다.
    갱신일: 2026-02-22
    """
    if rawValue is None:
        return defaultValue
    try:
        return str(rawValue).strip().lower() in {"1", "true", "yes", "on"}
    except Exception:
        return defaultValue


def parsePositiveInt(rawValue: object, defaultValue: int) -> int:
    """
    설명: 양의 정수만 허용해 파싱하고, 실패 시 기본값을 반환한다.
    갱신일: 2026-02-22
    """
    try:
        value = int(str(rawValue).strip())
        if value <= 0:
            return defaultValue
        return value
    except Exception:
        return defaultValue


def getIpGeoEnabled() -> bool:
    """
    설명: IP 위치 추정 기능 활성화 여부를 반환한다.
    우선순위: 환경변수(IP_GEO_ENABLED) > config(OBSERVABILITY.ip_geo_enabled)
    갱신일: 2026-02-22
    """
    envValue = os.getenv("IP_GEO_ENABLED")
    if envValue is not None:
        return parseBool(envValue, False)
    try:
        config = getConfig()
        if "OBSERVABILITY" in config:
            return parseBool(config["OBSERVABILITY"].get("ip_geo_enabled"), False)
    except Exception:
        pass
    return False


def getIpGeoTimeoutMs() -> int:
    """
    설명: 외부 IP 위치 조회 타임아웃(ms)을 반환한다.
    우선순위: 환경변수(IP_GEO_TIMEOUT_MS) > config(OBSERVABILITY.ip_geo_timeout_ms)
    갱신일: 2026-02-22
    """
    envValue = os.getenv("IP_GEO_TIMEOUT_MS")
    if envValue is not None:
        return parsePositiveInt(envValue, 700)
    try:
        config = getConfig()
        if "OBSERVABILITY" in config:
            return parsePositiveInt(config["OBSERVABILITY"].get("ip_geo_timeout_ms"), 700)
    except Exception:
        pass
    return 700


def getIpGeoCacheTtlSec() -> int:
    """
    설명: IP 위치 조회 캐시 TTL(초)을 반환한다.
    우선순위: 환경변수(IP_GEO_CACHE_TTL_SEC) > config(OBSERVABILITY.ip_geo_cache_ttl_sec)
    갱신일: 2026-02-22
    """
    envValue = os.getenv("IP_GEO_CACHE_TTL_SEC")
    if envValue is not None:
        return parsePositiveInt(envValue, 3600)
    try:
        config = getConfig()
        if "OBSERVABILITY" in config:
            return parsePositiveInt(config["OBSERVABILITY"].get("ip_geo_cache_ttl_sec"), 3600)
    except Exception:
        pass
    return 3600




def normalizeIp(clientIp: Optional[str]) -> Optional[str]:
    """
    설명: 원본 클라이언트 IP 문자열을 정규화한다.
    갱신일: 2026-02-22
    """
    rawIp = (clientIp or "").strip()
    if not rawIp:
        return None
    # IPv6 bracket 제거([::1] 형태 대비)
    if rawIp.startswith("[") and rawIp.endswith("]"):
        rawIp = rawIp[1:-1]
    return rawIp or None


def classifyIpLocal(ipValue: str) -> tuple[str, str]:
    """
    설명: 사설/루프백/예약 IP 여부를 분류한다.
    반환: (위치텍스트, 소스)
    갱신일: 2026-02-22
    """
    try:
        addr = ipaddress.ip_address(ipValue)
    except Exception:
        return ("IP_INVALID", "IP_PARSE")
    if addr.is_loopback:
        return ("LOOPBACK", "IP_LOCAL")
    if addr.is_private:
        return ("PRIVATE_NET", "IP_LOCAL")
    if addr.is_link_local:
        return ("LINK_LOCAL", "IP_LOCAL")
    if addr.is_reserved:
        return ("RESERVED", "IP_LOCAL")
    if addr.is_multicast:
        return ("MULTICAST", "IP_LOCAL")
    if addr.is_unspecified:
        return ("UNSPECIFIED", "IP_LOCAL")
    return ("PUBLIC_IP", "IP_LOCAL")


def buildLocationText(geoJson: dict) -> str:
    """
    설명: 외부 IP 위치 조회 결과를 저장용 텍스트로 변환한다.
    갱신일: 2026-02-22
    """
    countryCode = str(geoJson.get("country_code") or "").strip()
    countryName = str(geoJson.get("country") or "").strip()
    regionName = str(geoJson.get("region") or "").strip()
    cityName = str(geoJson.get("city") or "").strip()
    parts = []
    if countryCode:
        parts.append(countryCode)
    elif countryName:
        parts.append(countryName)
    if regionName:
        parts.append(regionName)
    if cityName:
        parts.append(cityName)
    if parts:
        return " / ".join(parts)
    return "PUBLIC_IP"


async def getIpGeoFromRemote(ipValue: str) -> Optional[dict]:
    """
    설명: 외부 API(ipwho.is)로 공인 IP의 대략 위치를 조회한다.
    갱신일: 2026-02-22
    """
    timeoutMs = getIpGeoTimeoutMs()
    timeoutSec = max(0.1, timeoutMs / 1000.0)
    url = f"https://ipwho.is/{ipValue}"
    async with httpx.AsyncClient(timeout=timeoutSec) as client:
        response = await client.get(url, headers={"Accept": "application/json"})
        if response.status_code != 200:
            return None
        data = response.json()
        if not isinstance(data, dict):
            return None
        if data.get("success") is False:
            return None
        return data


async def resolveIpLocation(clientIp: Optional[str]) -> tuple[Optional[str], Optional[str]]:
    """
    설명: IP 기반 대략 위치 텍스트와 추정 소스를 반환한다.
    반환: (ipLocTxt, ipLocSrc)
    갱신일: 2026-02-22
    """
    ipValue = normalizeIp(clientIp)
    if not ipValue:
        return (None, None)

    localLocTxt, localSource = classifyIpLocal(ipValue)
    if localLocTxt != "PUBLIC_IP":
        return (localLocTxt, localSource)
    if not getIpGeoEnabled():
        return ("PUBLIC_IP", "IP_PUBLIC")

    nowMs = int(time.time() * 1000)
    async with ipGeoCacheLock:
        cached = ipGeoCache.get(ipValue)
        if cached:
            expiresAt = int(cached.get("expiresAtMs", 0) or 0)
            if expiresAt > nowMs:
                return (
                    str(cached.get("ipLocTxt") or "PUBLIC_IP"),
                    str(cached.get("ipLocSrc") or "IP_GEO_CACHE"),
                )
            ipGeoCache.pop(ipValue, None)

    try:
        geoJson = await getIpGeoFromRemote(ipValue)
        if not geoJson:
            return ("PUBLIC_IP", "IP_GEO_MISS")
        ipLocTxt = buildLocationText(geoJson)
        ipLocSrc = "IP_GEO_REMOTE"
        ttlSec = getIpGeoCacheTtlSec()
        async with ipGeoCacheLock:
            ipGeoCache[ipValue] = {
                "ipLocTxt": ipLocTxt,
                "ipLocSrc": ipLocSrc,
                "expiresAtMs": nowMs + (ttlSec * 1000),
            }
        return (ipLocTxt, ipLocSrc)
    except Exception:
        return ("PUBLIC_IP", "IP_GEO_FAIL")


async def writeUserAccessLog(
    *,
    username: Optional[str],
    requestId: Optional[str],
    method: Optional[str],
    path: Optional[str],
    statusCode: int,
    latencyMs: int,
    sqlCount: int,
    clientIp: Optional[str],
    dbName: Optional[str] = None,
) -> None:
    """
    설명: 인증 사용자 접근 로그를 T_USER_LOG에 저장한다.
    갱신일: 2026-02-22
    """
    userId = (username or "").strip()
    if not userId:
        return

    targetDbName = (dbName or "").strip() or DB.getPrimaryDbName()
    db = DB.getManager(targetDbName)
    if not db:
        return

    bindValues = {
        "logId": uuid.uuid4().hex,
        "userId": userId,
        "reqId": (requestId or "").strip() or None,
        "reqMthd": (method or "").strip() or "UNKNOWN",
        "reqPath": (path or "").strip() or "/",
        "resCd": int(statusCode),
        "latencyMs": max(0, int(latencyMs)),
        "sqlCnt": max(0, int(sqlCount)),
        "clientIp": (clientIp or "").strip() or None,
        "ipLocTxt": None,
        "ipLocSrc": None,
    }
    ipLocTxt, ipLocSrc = await resolveIpLocation(bindValues["clientIp"])
    bindValues["ipLocTxt"] = ipLocTxt
    bindValues["ipLocSrc"] = ipLocSrc
    try:
        await db.executeQuery("common.userAccessLogInsert", bindValues)
    except Exception as e:
        logger.warning(
            json.dumps(
                {
                    "event": "db.user_log.insert.failed",
                    "dbName": targetDbName,
                    "requestId": requestId,
                    "usernameMasked": maskUserIdentifierForLog(userId),
                    "error": str(e),
                },
                ensure_ascii=False,
            )
        )
