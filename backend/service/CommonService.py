"""
파일: backend/service/CommonService.py
작성: LSH
설명: 공통(헬스체크 및 레디니스) 서비스 로직.
"""

import asyncio
import os
import time
from datetime import datetime, timezone
from typing import Dict, Tuple, Any, List

from lib import Database as DB

startedAt = datetime.now(timezone.utc)


def versionInfo() -> Dict[str, str]:
    version = os.getenv("APP_VERSION", "dev")
    gitSha = os.getenv("GIT_SHA", "unknown")
    return {
        "version": version,
        "gitSha": gitSha,
        "startedAt": startedAt.isoformat(),
    }


async def healthz(_: Dict | None = None) -> Dict[str, str | int | bool]:
    now = datetime.now(timezone.utc)
    uptimeSeconds = int((now - startedAt).total_seconds())
    return {
        "ok": True,
        **versionInfo(),
        "uptimeSeconds": uptimeSeconds,
    }


async def readyz(_: Dict | None = None) -> Tuple[Dict[str, Any], bool]:
    """
    설명: 레디니스 체크. DB 핑 및 타임아웃/지표를 포함해 관측성을 확장한다.
    갱신일: 2025-12-03
    """
    maintenance = os.getenv("MAINTENANCE_MODE", "false").lower() in ("1", "true", "yes")
    checks: Dict[str, Any] = {}
    ok = True

    # 유지보수 모드면 즉시 비정상 처리
    if maintenance:
        ok = False
    else:
        dbStatus = "skipped"
        dbLatencies: List[int] = []
        dbTargets: List[str] = []

        try:
            try:
                primary = DB.getPrimaryDbName()
            except Exception:
                primary = None

            targets = [primary] if primary in DB.dbManagers else list(DB.dbManagers.keys())
            timeoutMs = int(os.getenv("READYZ_TIMEOUT_MS", "300"))

            if not targets:
                dbStatus = "skipped"
            else:
                dbStatus = "up"
                for name in targets:
                    mgr = DB.dbManagers[name]
                    dbTargets.append(name)
                    url = getattr(mgr, "databaseUrl", "") or ""
                    if "oracle" in url:
                        queryName = "sys.oraclePing"
                        fallbackSql = "SELECT 1 FROM DUAL"
                    else:
                        queryName = "sys.ping"
                        fallbackSql = "SELECT 1"
                    try:
                        if hasattr(mgr, "queryManager"):
                            sql = mgr.queryManager.getQuery(queryName) or fallbackSql
                        else:
                            sql = fallbackSql
                        started = time.perf_counter()
                        await asyncio.wait_for(mgr.fetchOne(sql), timeout=timeoutMs / 1000.0)
                        elapsedMs = int((time.perf_counter() - started) * 1000)
                        dbLatencies.append(elapsedMs)
                    except Exception:
                        dbStatus = "down"
                        ok = False
                        break
        except Exception:
            dbStatus = "down"
            ok = False

        checks["db"] = dbStatus
        checks["dbTimeoutMs"] = int(os.getenv("READYZ_TIMEOUT_MS", "300"))
        checks["dbTargets"] = dbTargets
        if dbLatencies:
            checks["dbLatencyMs"] = max(dbLatencies)

    payload: Dict[str, Any] = {"ok": ok, **checks}
    return payload, ok
