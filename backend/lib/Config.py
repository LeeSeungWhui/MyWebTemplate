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


_CONFIG: Optional[ConfigParser] = None
_CONFIG_PATH: Optional[str] = None


def _backendDir() -> str:
    return os.path.dirname(os.path.dirname(__file__))


def _resolvePath(filename: str) -> str:
    if os.path.isabs(filename):
        return filename
    return os.path.join(_backendDir(), filename)


def get(section: str, key: str, default: Optional[str] = None) -> str:
    """설명: 지정 섹션/키 값을 조회한다. 갱신일: 2025-11-12"""
    conf = getConfig()
    sec = conf[section]
    return sec.get(key, default) if default is not None else sec[key]


def getAuth(key: str, default: Optional[str] = None) -> str:
    """설명: AUTH 섹션 키를 조회한다. 갱신일: 2025-11-12"""
    return get("AUTH", key, default)


def loadConfig(filename: str) -> ConfigParser:
    """설명: backend 기준 상대경로로 설정 파일을 읽는다. 갱신일: 2025-11-12"""
    if logger:
        try:
            logger.info("config load start")
        except Exception:
            pass

    config = ConfigParser()
    # backend/lib → backend 로 맞춤
    cfgPath = _resolvePath(filename)
    with open(cfgPath, "r", encoding="utf-8") as f:
        config.read_file(f)

    if logger:
        try:
            logger.info("config load done")
        except Exception:
            pass
    return config


def getConfig(path: Optional[str] = None, forceReload: bool = False) -> ConfigParser:
    """설명: 설정 캐시를 반환하고 필요 시 재로딩한다. 갱신일: 2025-11-12"""
    global _CONFIG, _CONFIG_PATH

    # 환경변수 우선
    if path is None:
        path = os.getenv("BACKEND_CONFIG", _CONFIG_PATH or "config.ini")

    resolved = _resolvePath(path)
    if forceReload or _CONFIG is None or _CONFIG_PATH != resolved:
        _CONFIG = loadConfig(path)
        _CONFIG_PATH = resolved
    return _CONFIG


def reloadConfig() -> ConfigParser:
    """설명: 캐시를 무시하고 설정을 다시 읽는다. 갱신일: 2025-11-12"""
    return getConfig(forceReload=True)
