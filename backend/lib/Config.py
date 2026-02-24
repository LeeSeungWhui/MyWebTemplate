"""
파일명: backend/lib/Config.py
작성자: LSH
갱신일: 2026-02-24
설명: 구성 로더 + server.config 접근 헬퍼.
 - loadConfig: backend 기준 상대 경로로 INI 로드
 - get: server.config 노출 값을 간편히 읽기
"""

from __future__ import annotations

from configparser import ConfigParser
import os

# 로거 (선택)
try:
    from .Logger import logger  # type: ignore
except Exception:  # pragma: no cover
    logger = None  # type: ignore


configCache: ConfigParser | None = None
configCachePath: str | None = None


def backendDir() -> str:
    """설명: backend 루트 디렉터리 절대 경로를 반환한다. 갱신일: 2026-02-24"""
    return os.path.dirname(os.path.dirname(__file__))


def resolvePath(filename: str) -> str:
    """설명: 설정 파일 경로를 backend 기준 절대 경로로 해석한다. 갱신일: 2026-02-24"""
    if os.path.isabs(filename):
        return filename
    return os.path.join(backendDir(), filename)


def get(section: str, key: str, default: str | None = None) -> str:
    """설명: 지정 섹션/키 값을 조회한다. 갱신일: 2025-11-12"""
    conf = getConfig()
    sec = conf[section]
    return sec.get(key, default) if default is not None else sec[key]


def getAuth(key: str, default: str | None = None) -> str:
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
    configPath = resolvePath(filename)
    with open(configPath, "r", encoding="utf-8") as f:
        config.read_file(f)

    if logger:
        try:
            logger.info("config load done")
        except Exception:
            pass
    return config


def getConfig(path: str | None = None, forceReload: bool = False) -> ConfigParser:
    """설명: 설정 캐시를 반환하고 필요 시 재로딩한다. 갱신일: 2025-11-12"""
    global configCache, configCachePath

    # 환경변수 우선
    if path is None:
        path = os.getenv("BACKEND_CONFIG", configCachePath or "config.ini")

    resolved = resolvePath(path)
    if forceReload or configCache is None or configCachePath != resolved:
        configCache = loadConfig(path)
        configCachePath = resolved
    return configCache


def reloadConfig() -> ConfigParser:
    """설명: 캐시를 무시하고 설정을 다시 읽는다. 갱신일: 2025-11-12"""
    return getConfig(forceReload=True)
