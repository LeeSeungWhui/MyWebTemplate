"""
파일명: backend/tests/test_logger.py
설명: JSON 로거 초기화/파일 로그 best-effort 동작 회귀 테스트
"""

import logging


def testConfigureLoggerDoesNotDuplicateManagedHandlers(monkeypatch):
    from lib import Logger

    testLogger = logging.getLogger("myweb.test.logger.configure")
    testLogger.handlers.clear()

    attachedFileHandlers = []

    def fakeAttachFileHandler(targetLogger, logLevel, formatter):
        for handler in targetLogger.handlers:
            if getattr(handler, "_myweb_file_handler", False):
                handler.setLevel(logLevel)
                handler.setFormatter(formatter)
                return
        fileHandler = logging.NullHandler()
        setattr(fileHandler, "_myweb_file_handler", True)
        fileHandler.setLevel(logLevel)
        fileHandler.setFormatter(formatter)
        targetLogger.addHandler(fileHandler)
        attachedFileHandlers.append(fileHandler)

    monkeypatch.setattr(Logger, "logger", testLogger)
    monkeypatch.setattr(Logger, "_attachFileHandler", fakeAttachFileHandler)

    Logger._configureLogger()
    Logger._configureLogger()

    managedConsoleHandlers = [
        handler for handler in testLogger.handlers if getattr(handler, "_myweb_console_handler", False)
    ]
    managedFileHandlers = [
        handler for handler in testLogger.handlers if getattr(handler, "_myweb_file_handler", False)
    ]
    assert len(managedConsoleHandlers) == 1
    assert len(managedFileHandlers) == 1
    assert len(attachedFileHandlers) == 1


def testAttachFileHandlerSkipsWhenLogDirectoryIsUnavailable(monkeypatch):
    from lib import Logger

    testLogger = logging.getLogger("myweb.test.logger.file")
    testLogger.handlers.clear()

    def raisePermissionError(*args, **kwargs):
        raise PermissionError("logs directory is not writable")

    monkeypatch.setattr(Logger.os, "makedirs", raisePermissionError)

    Logger._attachFileHandler(testLogger, logging.INFO, Logger.JsonLineFormatter())

    assert not [handler for handler in testLogger.handlers if getattr(handler, "_myweb_file_handler", False)]
