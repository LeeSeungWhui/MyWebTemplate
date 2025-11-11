"""
파일: backend/lib/Config.py
작성: LSH
설명: 구성 로더 + server.config 접근 헬퍼.
 - loadConfig: backend 기준 상대 경로로 INI 로드
 - get: server.config 노출 값을 간편히 읽기
"""

from __future__ import annotations

from typing import Optional
from configparser import ConfigParser
import os

# 로거 (선택)
try:
    from .Logger import logger  # type: ignore
except Exception:  # pragma: no cover
    logger = None  # type: ignore


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


def loadConfig(filename: str) -> ConfigParser:
    """backend 디렉터리 기준으로 설정 파일을 로드한다.

    - filename이 절대경로가 아니면 backend/ 아래로 해석한다.
    - UTF-8로 읽는다.
    """
    if logger:
        try:
            logger.info("config load start")
        except Exception:
            pass

    config = ConfigParser()
    # backend/lib → backend 로 맞춤
    backend_dir = os.path.dirname(os.path.dirname(__file__))
    cfg_path = filename
    if not os.path.isabs(filename):
        cfg_path = os.path.join(backend_dir, filename)
    with open(cfg_path, "r", encoding="utf-8") as f:
        config.read_file(f)

    if logger:
        try:
            logger.info("config load done")
        except Exception:
            pass
    return config
