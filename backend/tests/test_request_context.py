"""요청 ID ContextVar 수명주기 회귀 테스트."""

import contextvars

import pytest

from lib import RequestContext


def testResetRequestIdRestoresNestedValues():
    outerToken = RequestContext.setRequestId("outer")
    innerToken = RequestContext.setRequestId("inner")

    RequestContext.resetRequestId(innerToken)
    assert RequestContext.getRequestId() == "outer"

    RequestContext.resetRequestId(outerToken)
    assert RequestContext.getRequestId() is None


def testResetRequestIdClearsValueForReusedToken():
    token = RequestContext.setRequestId("first")
    RequestContext.resetRequestId(token)
    RequestContext.setRequestId("stale")

    RequestContext.resetRequestId(token)

    assert RequestContext.getRequestId() is None


def testResetRequestIdClearsValueForInvalidToken():
    RequestContext.setRequestId("stale")

    RequestContext.resetRequestId(object())  # type: ignore[arg-type]

    assert RequestContext.getRequestId() is None


def testResetRequestIdClearsOnlyTheWrongContext():
    token = RequestContext.setRequestId("original")

    def resetInOtherContext():
        RequestContext.setRequestId("other")
        RequestContext.resetRequestId(token)
        assert RequestContext.getRequestId() is None

    contextvars.Context().run(resetInOtherContext)
    assert RequestContext.getRequestId() == "original"

    RequestContext.resetRequestId(token)
    assert RequestContext.getRequestId() is None


def testResetRequestIdDoesNotSwallowUnexpectedException(monkeypatch):
    class UnexpectedRequestIdVar:
        def reset(self, token):
            raise KeyError("unexpected")

    monkeypatch.setattr(RequestContext, "requestIdVar", UnexpectedRequestIdVar())

    with pytest.raises(KeyError, match="unexpected"):
        RequestContext.resetRequestId(object())  # type: ignore[arg-type]
