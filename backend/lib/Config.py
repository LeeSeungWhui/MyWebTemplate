"""
파일: backend/lib/Config.py
작성: Codex
설명: server.config 접근 헬퍼. import 경로(backend.server/server)와 무관하게 [섹션]/키 값을 읽는다.
"""

from __future__ import annotations

from typing import Optional


def _get_server_module():
    """backend.server → server 순으로 config를 보유한 모듈을 찾아 반환한다."""
    import importlib

    server_mod = None
    for name in ("backend.server", "server"):
        try:
            server_mod = importlib.import_module(name)
            if hasattr(server_mod, "config"):
                break
        except Exception:
            server_mod = None
            continue
    if server_mod is None or not hasattr(server_mod, "config"):
        # 패키지 모드 상대 import (fallback)
        try:  # pragma: no cover
            from .. import server as server_mod  # type: ignore
        except Exception:  # pragma: no cover
            import server as server_mod  # type: ignore
    return server_mod


def get(section: str, key: str, default: Optional[str] = None) -> str:
    """일반 섹션 값 읽기."""
    server_mod = _get_server_module()
    sec = server_mod.config[section]
    return sec.get(key, default) if default is not None else sec[key]


def get_auth(key: str, default: Optional[str] = None) -> str:
    """[AUTH] 섹션 값 읽기."""
    return get("AUTH", key, default)

