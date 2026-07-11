import asyncio
import json
import os
import sys

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from lib.ServiceError import ServiceError, buildMappedErrorResponse


baseDir = os.path.dirname(os.path.dirname(__file__))
if baseDir not in sys.path:
    sys.path.insert(0, baseDir)


def assertDefaultSecurityHeaders(response):
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("Referrer-Policy") == "same-origin"
    assert response.headers.get("Permissions-Policy") == (
        "accelerometer=(), camera=(), geolocation=(), gyroscope=(), "
        "magnetometer=(), microphone=(), payment=(), usb=()"
    )
    assert response.headers.get("X-Frame-Options") == "DENY"


@pytest.mark.parametrize(
    "originRegex",
    (
        ".*",
        "^.*$",
        "https://.*",
        r"^https?://[^/]+$",
        r"^https://[^/]+\.com$",
        r"^http://[^/]+\.net$",
        "null",
    ),
)
def testCorsOriginRegexRejectsBroadPatterns(originRegex):
    from server import validateCorsOriginRegex

    with pytest.raises(ValueError, match="allow_origin_regex is too broad"):
        validateCorsOriginRegex(originRegex)


def testCorsOriginRegexRejectsInvalidSyntaxAndAllowsNarrowPattern():
    from server import validateCorsOriginRegex

    with pytest.raises(ValueError, match="invalid allow_origin_regex"):
        validateCorsOriginRegex("[")

    narrowPattern = r"^https://([a-z0-9-]+\.)?example\.com$"
    assert validateCorsOriginRegex(narrowPattern) == narrowPattern


def testShutdownCleanupContinuesAfterResourceFailures(monkeypatch):
    import server

    events = []

    class FakeManager:
        def __init__(self, name, shouldFail=False):
            self.name = name
            self.shouldFail = shouldFail

        async def disconnect(self):
            events.append(f"disconnect:{self.name}")
            if self.shouldFail:
                raise RuntimeError("disconnect failed")

    class FakeObserver:
        def stop(self):
            events.append("observer:stop")
            raise RuntimeError("stop failed")

        def join(self):
            events.append("observer:join")

    monkeypatch.setattr(
        server.DB,
        "dbManagers",
        {
            "first": FakeManager("first", shouldFail=True),
            "second": FakeManager("second"),
        },
    )
    monkeypatch.setattr(server, "sqlObserver", FakeObserver())

    asyncio.run(server.onShutdown())

    assert events == [
        "disconnect:first",
        "disconnect:second",
        "observer:stop",
        "observer:join",
    ]


def testOperationalSecurityHeadersOnHealthz():
    from server import app

    with TestClient(app) as client:
        response = client.get("/healthz")

    assert response.status_code == 200
    assert response.headers.get("Cache-Control") == "no-store"
    assertDefaultSecurityHeaders(response)


def testOperationalSecurityHeadersOnValidationError():
    from server import app

    testPath = "/__test__/operational/security-validation"

    if not any(getattr(route, "path", None) == testPath for route in app.routes):
        @app.get(testPath)
        def operationalSecurityValidationRoute(value: int):
            return {"value": value}

    with TestClient(app) as client:
        response = client.get(f"{testPath}?value=oops")

    assert response.status_code == 422
    assert response.headers.get("Cache-Control") == "no-store"
    requestId = response.headers.get("X-Request-Id")
    assert requestId
    assert response.json()["requestId"] == requestId
    assertDefaultSecurityHeaders(response)


def testOperationalReadyzErrorKeepsLocaleAndRequestId(monkeypatch):
    from server import app

    monkeypatch.setenv("MAINTENANCE_MODE", "true")
    with TestClient(app) as client:
        response = client.get("/readyz", headers={"Accept-Language": "ko-KR"})

    body = response.json()
    assert response.status_code == 503
    assert response.headers.get("Cache-Control") == "no-store"
    assert body["code"] == "OBS_503_NOT_READY"
    assert body["message"] == "준비되지 않았습니다"
    assert body["requestId"] == response.headers["X-Request-Id"]
    assertDefaultSecurityHeaders(response)


def testOperationalSecurityHeadersOnUnhandledError(monkeypatch):
    from server import app
    from lib import Middleware as middleware

    testPath = "/__test__/operational/security-error"
    logMessages = []

    def captureLog(message):
        try:
            logMessages.append(json.loads(message))
        except Exception:
            pass

    monkeypatch.setattr(middleware.logger, "info", captureLog)
    monkeypatch.setattr(middleware.logger, "exception", captureLog)

    if not any(getattr(route, "path", None) == testPath for route in app.routes):
        @app.get(testPath)
        def operationalSecurityErrorRoute():
            raise RuntimeError("boom")

    with TestClient(app, raise_server_exceptions=False) as client:
        response = client.get(testPath)

    assert response.status_code == 500
    assert response.headers.get("Cache-Control") == "no-store"
    requestId = response.headers.get("X-Request-Id")
    assert requestId
    assert response.json()["requestId"] == requestId
    accessLogs = [item for item in logMessages if item.get("msg") == "access"]
    exceptionLogs = [item for item in logMessages if item.get("msg") == "unhandled_exception"]
    assert len(accessLogs) == 1
    assert accessLogs[0]["status"] == 500
    assert accessLogs[0]["requestId"] == requestId
    assert len(exceptionLogs) == 1
    assert exceptionLogs[0]["requestId"] == requestId
    assertDefaultSecurityHeaders(response)


def testOperationalSecurityHeadersOnHttpExceptionPreserveAuthHeaders():
    from server import app

    testPath = "/__test__/operational/security-http-exception"

    if not any(getattr(route, "path", None) == testPath for route in app.routes):
        @app.get(testPath)
        def operationalSecurityHttpExceptionRoute():
            raise HTTPException(
                status_code=401,
                detail={"message": "auth required", "code": "AUTH_401_TEST"},
                headers={"WWW-Authenticate": "Bearer"},
            )

    with TestClient(app) as client:
        response = client.get(testPath)

    assert response.status_code == 401
    assert response.headers.get("WWW-Authenticate") == "Bearer"
    assert response.headers.get("Cache-Control") == "no-store"
    assert response.json()["code"] == "AUTH_401_TEST"
    requestId = response.headers.get("X-Request-Id")
    assert requestId
    assert response.json()["requestId"] == requestId
    assertDefaultSecurityHeaders(response)


def testHttpExceptionRedactsUnsafeDetailAndPreservesStatus():
    from server import app

    testPath = "/__test__/operational/unsafe-http-detail"

    if not any(getattr(route, "path", None) == testPath for route in app.routes):
        @app.get(testPath)
        def unsafeHttpDetailRoute():
            raise HTTPException(
                status_code=422,
                detail={
                    "message": ["not-public"],
                    "detail": {"nested": "not-public"},
                    "code": {"internal": "not-public"},
                    "secret": "not-public",
                },
            )

    with TestClient(app) as client:
        response = client.get(testPath)

    body = response.json()
    assert response.status_code == 422
    assert response.headers.get("Cache-Control") == "no-store"
    assert body["message"] == "error"
    assert body["code"] == "HTTP_422"
    assert body["result"] == {"path": testPath}
    assert "not-public" not in response.text
    assert body["requestId"] == response.headers["X-Request-Id"]


def testHttpException404PreservesUnrelatedHeaderAndNoStore():
    from server import app

    testPath = "/__test__/operational/missing-http-resource"

    if not any(getattr(route, "path", None) == testPath for route in app.routes):
        @app.get(testPath)
        def missingHttpResourceRoute():
            raise HTTPException(
                status_code=404,
                detail="missing",
                headers={"X-Test-Context": "preserved"},
            )

    with TestClient(app) as client:
        response = client.get(testPath)

    body = response.json()
    assert response.status_code == 404
    assert response.headers.get("Cache-Control") == "no-store"
    assert response.headers.get("X-Test-Context") == "preserved"
    assert body["code"] == "HTTP_404_NOT_FOUND"
    assert body["result"] == {"path": testPath, "detail": "missing"}
    assert body["requestId"] == response.headers["X-Request-Id"]


def testMappedServiceErrorRequestIdMatchesResponseHeader():
    from server import app

    testPath = "/__test__/operational/mapped-service-error"

    if not any(getattr(route, "path", None) == testPath for route in app.routes):
        @app.get(testPath)
        def mappedServiceErrorRoute():
            return buildMappedErrorResponse(
                ServiceError("OBS_503_NOT_READY"),
                includeNoStore=True,
            )

    with TestClient(app) as client:
        response = client.get(testPath)

    assert response.status_code == 503
    assert response.headers.get("Cache-Control") == "no-store"
    requestId = response.headers.get("X-Request-Id")
    assert requestId
    assert response.json()["requestId"] == requestId


def testDbBackendNotRunningOperationalMapping(monkeypatch):
    from lib.Database import DatabaseManager

    manager = DatabaseManager("postgresql://demo:demo@127.0.0.1:5432/demo")

    async def raiseBackendNotRunning(**kwargs):
        raise AssertionError("DatabaseBackend is not running")

    monkeypatch.setattr(manager.database, "execute", raiseBackendNotRunning)

    with pytest.raises(ServiceError) as raised:
        asyncio.run(manager.execute("SELECT 1", queryName="operational.test"))

    assert raised.value.code == "DB_NOT_READY"
