import asyncio
import os
import sys

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from lib.ServiceError import ServiceError


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
    assertDefaultSecurityHeaders(response)


def testOperationalSecurityHeadersOnUnhandledError():
    from server import app

    testPath = "/__test__/operational/security-error"

    if not any(getattr(route, "path", None) == testPath for route in app.routes):
        @app.get(testPath)
        def operationalSecurityErrorRoute():
            raise RuntimeError("boom")

    with TestClient(app, raise_server_exceptions=False) as client:
        response = client.get(testPath)

    assert response.status_code == 500
    assert response.headers.get("Cache-Control") == "no-store"
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
    assertDefaultSecurityHeaders(response)


def testDbBackendNotRunningOperationalMapping(monkeypatch):
    from lib.Database import DatabaseManager

    manager = DatabaseManager("postgresql://demo:demo@127.0.0.1:5432/demo")

    async def raiseBackendNotRunning(**kwargs):
        raise AssertionError("DatabaseBackend is not running")

    monkeypatch.setattr(manager.database, "execute", raiseBackendNotRunning)

    with pytest.raises(ServiceError) as raised:
        asyncio.run(manager.execute("SELECT 1", queryName="operational.test"))

    assert raised.value.code == "DB_NOT_READY"
