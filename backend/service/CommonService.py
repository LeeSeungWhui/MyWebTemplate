"""
파일: backend/service/CommonService.py
작성: LSH
설명: 공통(헬스체크 및 레디니스) 서비스 로직.
"""

import asyncio
import os
from datetime import datetime, timezone
from typing import Dict, Tuple

from lib import Database as DB

_started_at = datetime.now(timezone.utc)


def _version_info() -> Dict[str, str]:
    version = os.getenv("APP_VERSION", "dev")
    git_sha = os.getenv("GIT_SHA", "unknown")
    return {
        "version": version,
        "git_sha": git_sha,
        "started_at": _started_at.isoformat(),
    }


async def healthz(_: Dict | None = None) -> Dict[str, str | int | bool]:
    now = datetime.now(timezone.utc)
    uptime_s = int((now - _started_at).total_seconds())
    return {
        "ok": True,
        **_version_info(),
        "uptime_s": uptime_s,
    }


async def readyz(_: Dict | None = None) -> Tuple[Dict[str, str | bool], bool]:
    maintenance = os.getenv("MAINTENANCE_MODE", "false").lower() in ("1", "true", "yes")
    checks: Dict[str, str] = {}
    ok = True

    if maintenance:
        ok = False
    else:
        try:
            primary = None
            try:
                primary = DB.getPrimaryDbName()
            except Exception:
                primary = None
            targets = [primary] if primary in DB.dbManagers else list(DB.dbManagers.keys())
            if not targets:
                checks["db"] = "up"
            else:
                for name in targets:
                    mgr = DB.dbManagers[name]
                    url = getattr(mgr, "databaseUrl", "") or ""
                    if "oracle" in url:
                        query_name = "sys.oraclePing"
                        fallback_sql = "SELECT 1 FROM DUAL"
                    else:
                        query_name = "sys.ping"
                        fallback_sql = "SELECT 1"
                    try:
                        timeout_ms = int(os.getenv("READYZ_TIMEOUT_MS", "300"))
                        if hasattr(mgr, "queryManager"):
                            sql = mgr.queryManager.getQuery(query_name) or fallback_sql
                        else:
                            sql = fallback_sql
                        await asyncio.wait_for(mgr.fetchOne(sql), timeout=timeout_ms / 1000.0)
                        checks["db"] = "up"
                    except Exception:
                        checks["db"] = "down"
                        ok = False
                        break
        except Exception:
            checks["db"] = "down"
            ok = False

    payload = {"ok": ok, **checks}
    return payload, ok
