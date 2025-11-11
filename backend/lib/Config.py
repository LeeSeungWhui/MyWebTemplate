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
    """일반 섹션 값 읽기 (서버 전역 의존성 없이)."""
    conf = getConfig()
    sec = conf[section]
    return sec.get(key, default) if default is not None else sec[key]


def getAuth(key: str, default: Optional[str] = None) -> str:
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
    """싱글톤 구성 인스턴스 반환.

    - path가 주어지면 해당 파일을 기준으로 초기화/교체
    - 재호출 시 캐시된 ConfigParser를 반환 (forceReload=True면 다시 읽음)
    """
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
    """캐시 무시하고 다시 로드."""
    return getConfig(forceReload=True)
