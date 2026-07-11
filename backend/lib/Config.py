"""
파일명: backend/lib/Config.py
작성자: LSH
갱신일: 2026-02-24
설명: 구성 로더 + server. config 접근 헬퍼
 - loadConfig: backend 기준 상대 경로로 INI 로드
 - get: server.config 노출 값을 간편히 읽기
"""

from __future__ import annotations

from configparser import ConfigParser
import os
from threading import RLock

# 로거 (선택)
try:
    from .Logger import logger  # type: ignore
except Exception:  # pragma: no cover
    logger = None  # type: ignore


configCache: ConfigParser | None = None
configCachePath: str | None = None
configCacheLock = RLock()


def runtimeConfigChangeError(reason: str) -> RuntimeError:
    """설명: 런타임 설정 변경 거부 예외 생성 반환값: 프로세스 재시작 안내 RuntimeError. 갱신일: 2026-07-11"""
    return RuntimeError(
        f"{reason}. Runtime configuration is immutable after initialization; "
        "restart the process to apply configuration changes."
    )


def backendDir() -> str:
    """
    설명: 현재 모듈(__file__) 기준으로 계산한 backend 루트 절대 경로
    처리 규칙: 입력값을 검증하고 실패 시 예외/기본값 경로로 수렴
    갱신일: 2026-02-24
    """
    return os.path.dirname(os.path.dirname(__file__))


def resolvePath(filename: str) -> str:
    """설명: 설정 파일 경로를 backend 기준 절대 경로로 해석 반환값: 절대 경로 문자열. 갱신일: 2026-02-24"""
    if os.path.isabs(filename):
        return filename
    return os.path.join(backendDir(), filename)


def get(section: str, key: str, default: str | None = None) -> str:
    """설명: 지정 섹션/키 값 조회 반환값: 존재하는 설정값 또는 기본값. 갱신일: 2025-11-12"""
    conf = getConfig()
    sec = conf[section]
    return sec.get(key, default) if default is not None else sec[key]


def getAuth(key: str, default: str | None = None) -> str:
    """설명: AUTH 섹션 키 조회 반환값: AUTH 섹션의 설정값 또는 기본값. 갱신일: 2025-11-12"""
    return get("AUTH", key, default)


def loadConfig(filename: str) -> ConfigParser:
    """설명: backend 기준 상대경로로 설정 파일을 반환값: 로드 완료된 ConfigParser 인스턴스. 갱신일: 2025-11-12"""
    if logger:
        try:
            logger.info("config load start")
        except Exception:
            pass

    config = ConfigParser(interpolation=None)

# backend/lib 경로를 backend 기준으로 보정
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
    """
    설명: 최초 설정을 원자적으로 로드한 뒤 프로세스 수명 동안 동일 캐시 반환
    처리 규칙: path 미지정이면 BACKEND_CONFIG 또는 기존 캐시 경로를 우선 사용
    처리 규칙: forceReload와 최초 로드 이후 경로 변경은 프로세스 재시작 안내와 함께 거부
    부작용: 최초 로드 시 configCache/configCachePath를 원자적으로 갱신
    반환값: 현재 유효한 ConfigParser 인스턴스
    갱신일: 2026-07-11
    """
    global configCache, configCachePath

    if forceReload:
        raise runtimeConfigChangeError("Runtime configuration reload is disabled")

    with configCacheLock:
        if path is None:
            path = os.getenv("BACKEND_CONFIG", configCachePath or "config.ini")

        resolved = resolvePath(path)
        if configCache is not None:
            if configCachePath != resolved:
                raise runtimeConfigChangeError(
                    f"Runtime configuration path change is disabled ({configCachePath} -> {resolved})"
                )
            return configCache

        loadedConfig = loadConfig(resolved)
        configCache = loadedConfig
        configCachePath = resolved
        return loadedConfig


def reloadConfig() -> ConfigParser:
    """설명: 런타임 재로딩을 거부하고 프로세스 재시작을 안내. 갱신일: 2026-07-11"""
    raise runtimeConfigChangeError("Runtime configuration reload is disabled")
