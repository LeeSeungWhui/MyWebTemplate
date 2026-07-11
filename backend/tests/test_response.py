"""공통 응답 헬퍼의 직렬화 계약 회귀 테스트."""

import pytest
from pydantic import BaseModel

from lib.RequestContext import resetRequestId, setRequestId
from lib.Response import errorResponse, successResponse


def testSuccessResponseIncludesNullResultAndRequestId():
    token = setRequestId("req-success")
    try:
        response = successResponse()
    finally:
        resetRequestId(token)

    assert response == {
        "status": True,
        "message": "success",
        "requestId": "req-success",
        "result": None,
    }


def testSuccessResponseKeepsListCount():
    response = successResponse(result=[{"id": 1}, {"id": 2}])

    assert response["result"] == [{"id": 1}, {"id": 2}]
    assert response["count"] == 2


def testSuccessResponseKeepsSerializedBaseModelResult():
    class ResultModel(BaseModel):
        itemId: int

    response = successResponse(result=ResultModel(itemId=7))

    assert response["result"] == {"itemId": 7}


def testErrorResponseIncludesRequiredCodeAndRequestId():
    token = setRequestId("req-error")
    try:
        response = errorResponse(code="TEST_400_INVALID", message="invalid")
    finally:
        resetRequestId(token)

    assert response == {
        "status": False,
        "message": "invalid",
        "code": "TEST_400_INVALID",
        "requestId": "req-error",
    }


def testErrorResponseKeepsPositionalMessageAndResultCompatibility():
    response = errorResponse(
        "invalid",
        {"field": "username"},
        code="TEST_400_INVALID",
    )

    assert response == {
        "status": False,
        "message": "invalid",
        "result": {"field": "username"},
        "code": "TEST_400_INVALID",
    }


def testErrorResponseRejectsMissingCode():
    with pytest.raises(TypeError):
        errorResponse()  # type: ignore[call-arg]


@pytest.mark.parametrize("code", [None, 1, object()])
def testErrorResponseRejectsNonStringCode(code):
    with pytest.raises(TypeError, match="code must be a string"):
        errorResponse(code=code)  # type: ignore[arg-type]


@pytest.mark.parametrize("code", ["", " ", "\t\n"])
def testErrorResponseRejectsBlankCode(code):
    with pytest.raises(ValueError, match="code must not be blank"):
        errorResponse(code=code)
