"""
파일명: backend/lib/Logger.py
작성자: LSH
갱신일: 2025-09-07
설명: 콘솔/파일 로거 설정. 포맷은 JSON 라인(ts/level/requestId/msg 등)
"""

import json
import logging
import os
from typing import Any
from datetime import datetime

# requestId는 Middleware에서 ContextVar로 주입된다.
from .RequestContext import getRequestId

# 로거 설정
logger: logging.Logger = logging.getLogger()


def resolveLogLevel() -> int:
    """
    설명: 환경변수 LOG_LEVEL 값을 logging 레벨 상수로 변환. 호출 맥락의 제약을 기준으로 동작 기준 확정
    처리 규칙: 미지원 문자열이면 기본 INFO 레벨을 사용
    반환값: logging 모듈의 정수 레벨 상수를 반환
    갱신일: 2026-02-24
    """
    raw = str(os.getenv("LOG_LEVEL", "INFO")).strip().upper()
    return getattr(logging, raw, logging.INFO)


# ---------------------------------------------------------------------------
# JSON 라인 포맷터
# ---------------------------------------------------------------------------


class JsonLineFormatter(logging.Formatter):
    """
    설명: 로그를 JSON 한 줄로 출력
    - msg가 이미 JSON(dict) 문자열이면 병합해 구조 로그를 유지한다.
    - requestId는 ContextVar(getRequestId)에서 보강한다.
    갱신일: 2026-01-15
    """

    def format(self, record: logging.LogRecord) -> str:
        """
        설명: logging 레코드를 JSON 한 줄 문자열로 직렬화
        처리 규칙: msg가 JSON 문자열이면 병합하고, 아니면 문자열 msg로 기록
        반환값: requestId/예외 정보가 보강된 JSON 라인 문자열을 반환
        갱신일: 2026-02-24
        """
        payload: dict[str, Any] = {}
        msg = record.getMessage()

        if isinstance(msg, str):
            raw = msg.strip()
            if raw.startswith("{") and raw.endswith("}"):
                try:
                    parsed = json.loads(raw)
                    if isinstance(parsed, dict):
                        payload.update(parsed)
                    else:
                        payload["msg"] = msg
                except Exception:
                    payload["msg"] = msg
            else:
                payload["msg"] = msg
        else:
            payload["msg"] = str(msg)

        payload.setdefault("ts", int(record.created * 1000))
        payload.setdefault("level", record.levelname)
        payload.setdefault("logger", record.name)

        rid = None
        try:
            rid = getRequestId()
        except Exception:
            rid = None
        if rid and "requestId" not in payload:
            payload["requestId"] = rid

        if record.exc_info:
            try:
                payload["exc"] = self.formatException(record.exc_info)
            except Exception:
                payload["exc"] = "exception"

        return json.dumps(payload, ensure_ascii=False)


def _attachFileHandler(targetLogger: logging.Logger, logLevel: int, formatter: logging.Formatter) -> None:
    """
    설명: 파일 핸들러를 best-effort로 연결. 디렉터리/파일 권한이 없으면 콘솔만 사용한다.
    갱신일: 2026-06-22
    """
    for handler in targetLogger.handlers:
        if getattr(handler, "_myweb_file_handler", False):
            handler.setLevel(logLevel)
            handler.setFormatter(formatter)
            return

    logDir = os.getenv("LOG_DIR", "logs")
    try:
        os.makedirs(logDir, exist_ok=True)
        logFilename = os.path.join(logDir, f"{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
        fileHandler = logging.FileHandler(logFilename, encoding="utf-8")
        setattr(fileHandler, "_myweb_file_handler", True)
        fileHandler.setLevel(logLevel)
        fileHandler.setFormatter(formatter)
        targetLogger.addHandler(fileHandler)
    except OSError:
        return


def _configureLogger() -> logging.Logger:
    """
    설명: 콘솔 핸들러는 항상 연결하고, 파일 핸들러는 쓰기 가능할 때만 추가한다.
    갱신일: 2026-06-22
    """
    logLevel = resolveLogLevel()
    logger.setLevel(logLevel)
    jsonFormatter = JsonLineFormatter()

    consoleHandler = None
    for handler in logger.handlers:
        if getattr(handler, "_myweb_console_handler", False):
            consoleHandler = handler
            break

    if consoleHandler is None:
        consoleHandler = logging.StreamHandler()
        setattr(consoleHandler, "_myweb_console_handler", True)
        logger.addHandler(consoleHandler)
    consoleHandler.setLevel(logLevel)
    consoleHandler.setFormatter(jsonFormatter)

    _attachFileHandler(logger, logLevel, jsonFormatter)
    return logger


_configureLogger()
