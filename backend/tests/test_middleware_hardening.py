import asyncio
import json
import uuid

import pytest
from fastapi import BackgroundTasks, FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.testclient import TestClient

from lib.Database import incSqlCount
from lib import Middleware as middleware


def buildRequestIdApp() -> FastAPI:
    app = FastAPI()
    app.add_middleware(middleware.RequestLogMiddleware)

    @app.get("/request-id")
    async def requestIdRoute(request: Request):
        return {"requestId": request.state.requestId}

    return app


@pytest.mark.parametrize("invalidRequestId", ("", "bad id", "a" * 129, "slash/value"))
def testInvalidInboundRequestIdIsReplaced(invalidRequestId):
    with TestClient(buildRequestIdApp()) as client:
        response = client.get("/request-id", headers={"X-Request-Id": invalidRequestId})

    generated = response.headers["X-Request-Id"]
    assert generated != invalidRequestId
    assert str(uuid.UUID(generated)) == generated
    assert response.json()["requestId"] == generated


def testValidInboundRequestIdPropagatesUnchanged():
    requestId = "client.req_01:retry-2"
    with TestClient(buildRequestIdApp()) as client:
        response = client.get("/request-id", headers={"X-Request-Id": requestId})

    assert response.headers["X-Request-Id"] == requestId
    assert response.json()["requestId"] == requestId


def testAccessLogWaitsForStreamingBodyAndBackgroundWork(monkeypatch):
    app = FastAPI()
    app.add_middleware(middleware.RequestLogMiddleware)
    events = []

    def captureInfo(message):
        payload = json.loads(message)
        if payload.get("msg") == "access":
            events.append(("access", payload))

    monkeypatch.setattr(middleware.logger, "info", captureInfo)

    @app.get("/stream")
    async def streamRoute(backgroundTasks: BackgroundTasks):
        def lateBackgroundWork():
            incSqlCount()
            events.append(("background", None))

        async def body():
            yield b"first"
            incSqlCount()
            events.append(("stream", None))
            yield b"second"

        backgroundTasks.add_task(lateBackgroundWork)
        return StreamingResponse(body(), background=backgroundTasks)

    with TestClient(app) as client:
        response = client.get("/stream")

    assert response.content == b"firstsecond"
    assert [name for name, _ in events] == ["stream", "background", "access"]
    assert events[-1][1]["sql_count"] == 2


def testAccessLogTaskCapFailureAndDrain(monkeypatch):
    async def exercise():
        gate = asyncio.Event()
        errors = []
        warnings = []

        async def blockedWriter(**kwargs):
            await gate.wait()

        monkeypatch.setenv("ACCESS_LOG_PENDING_TASK_CAP", "1")
        monkeypatch.setattr(middleware, "writeUserAccessLogSafely", blockedWriter)
        monkeypatch.setattr(middleware.logger, "error", lambda message: errors.append(json.loads(message)))
        monkeypatch.setattr(middleware.logger, "warning", lambda message: warnings.append(json.loads(message)))

        assert middleware.scheduleUserAccessLog(requestId="first") is True
        assert middleware.scheduleUserAccessLog(requestId="second") is False
        assert len(middleware._pendingAccessLogTasks) == 1

        await middleware.drainUserAccessLogTasks(timeout=0)
        assert not middleware._pendingAccessLogTasks
        assert any(item["msg"] == "user_access_log_task_dropped" for item in warnings)
        assert any(item["msg"] == "user_access_log_task_drain_timeout" for item in warnings)

        async def failingWriter(**kwargs):
            raise RuntimeError("write failed")

        monkeypatch.setattr(middleware, "writeUserAccessLogSafely", failingWriter)
        assert middleware.scheduleUserAccessLog(requestId="failure") is True
        await middleware.drainUserAccessLogTasks(timeout=1)
        await asyncio.sleep(0)
        assert any(item["msg"] == "user_access_log_task_failed" for item in errors)
        assert not middleware._pendingAccessLogTasks

    asyncio.run(exercise())
