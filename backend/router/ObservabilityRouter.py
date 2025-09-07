"""
파일명: backend/router/ObservabilityRouter.py
작성자: Codex CLI
갱신일: 2025-09-07
설명: 헬스체크·레디니스 API. 공통 규칙 준수(표준 응답/캐시 금지/요청ID).
"""

import asyncio
import os
from datetime import datetime, timezone
from typing import Dict

from fastapi import APIRouter, Request

from lib import Database as DB
from lib.Response import successResponse, errorResponse
from lib.I18n import detect_locale, t as i18n_t


router = APIRouter(tags=["observability"])


_started_at = datetime.now(timezone.utc)


def _version_info() -> Dict[str, str]:
    version = os.getenv("APP_VERSION", "dev")
    git_sha = os.getenv("GIT_SHA", "unknown")
    return {
        "version": version,
        "git_sha": git_sha,
        "started_at": _started_at.isoformat(),
    }


@router.get("/healthz")
async def healthz(request: Request):
    """
    설명: 서버 상태 OK 및 버전/업타임 반환. 캐시 금지.
    갱신일: 2025-09-07
    """
    now = datetime.now(timezone.utc)
    uptime_s = int((now - _started_at).total_seconds())
    payload = {
        "ok": True,
        **_version_info(),
        "uptime_s": uptime_s,
    }
    resp = successResponse(result=payload)
    # headers
    request.scope["state"] = getattr(request, "state", None)
    # Response-level headers will be added by middleware for request id
    from fastapi.responses import JSONResponse

    response = JSONResponse(content=resp, status_code=200)
    response.headers["Cache-Control"] = "no-store"
    return response


@router.get("/readyz")
async def readyz(request: Request):
    """
    설명: DB 핑 포함 레디니스 점검. 타임아웃·메인터넌스 모드 반영.
    갱신일: 2025-09-07
    """
    # maintenance override
    maintenance = os.getenv("MAINTENANCE_MODE", "false").lower() in ("1", "true", "yes")
    checks: Dict[str, str] = {}
    ok = True

    if maintenance:
        ok = False
    else:
        # DB ping: check all registered databases, but report primary 'main_db' if present
        try:
            # prefer main_db if exists, else ping any one
            targets = ["main_db"] if "main_db" in DB.dbManagers else list(DB.dbManagers.keys())
            if not targets:
                # no DB configured – consider up by design
                checks["db"] = "up"
            else:
                for name in targets:
                    # choose dialect-specific lightweight query
                    mgr = DB.dbManagers[name]
                    url = getattr(mgr, "databaseUrl", "") or ""
                    if "oracle" in url:
                        ping_sql = "SELECT 1 FROM DUAL"
                    else:
                        ping_sql = "SELECT 1"
                    try:
                        # enforce timeout (default 300ms)
                        timeout_ms = int(os.getenv("READYZ_TIMEOUT_MS", "300"))
                        await asyncio.wait_for(mgr.fetchOne(ping_sql), timeout=timeout_ms / 1000.0)
                        checks["db"] = "up"
                    except Exception:
                        checks["db"] = "down"
                        ok = False
                        break
        except Exception:
            checks["db"] = "down"
            ok = False

    status_code = 200 if ok else 503

    payload = {"ok": ok, **checks}
    from fastapi.responses import JSONResponse
    from lib.Response import errorResponse

    if ok:
        resp = successResponse(result=payload)
    else:
        loc = detect_locale(request)
        resp = errorResponse(message=i18n_t("obs.not_ready", "not ready", loc), result=payload, code="OBS_503_NOT_READY")
    response = JSONResponse(content=resp, status_code=status_code)
    response.headers["Cache-Control"] = "no-store"
    return response
