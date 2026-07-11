import os
import sys
import asyncio
from fastapi.testclient import TestClient

from conftest import pgTestSettings
from db_support import fetchRowPg


baseDir = os.path.dirname(os.path.dirname(__file__))
if baseDir not in sys.path:
    sys.path.insert(0, baseDir)


def authHeaderFromCookie(client):
    token = client.cookies.get("access_token")
    return {"Authorization": f"Bearer {token}"} if token else {}


def loginAsDemo(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "demo@demo.demo", "password": "password123", "rememberMe": True},
    )
    assert response.status_code == 200


def testProfileLookupDoesNotRunSchemaDdl(monkeypatch):
    from service import ProfileService

    class FakeDb:
        async def fetchOneQuery(self, queryName, params):
            assert queryName == "profile.me"
            assert params == {"userId": "demo@demo.demo"}
            return {
                "USER_NO": 1,
                "USER_ID": "demo@demo.demo",
                "USER_NM": "Demo User",
                "USER_EML": "demo@demo.demo",
                "ROLE_CD": "user",
                "NOTIFY_EMAIL": 1,
                "NOTIFY_SMS": 0,
                "NOTIFY_PUSH": 1,
            }

        async def executeQuery(self, queryName, params=None):
            raise AssertionError(f"profile lookup must not run DDL or write query: {queryName}")

    class User:
        username = "demo@demo.demo"

    monkeypatch.setattr(ProfileService.DB, "getManager", lambda: FakeDb())

    result = asyncio.run(ProfileService.getMyProfile(User()))

    assert result["userId"] == "demo@demo.demo"
    assert result["notifyEmail"] is True
    assert result["notifySms"] is False
    assert result["notifyPush"] is True


def testProfileMeGetAndUpdateFlow():
    from server import app

    with TestClient(app) as client:
        loginAsDemo(client)
        headers = authHeaderFromCookie(client)

        getResponse = client.get("/api/v1/profile/me", headers=headers)
        assert getResponse.status_code == 200
        getBody = getResponse.json()
        assert getBody["status"] is True
        assert getBody["result"]["userId"] == "demo@demo.demo"

        updateResponse = client.put(
            "/api/v1/profile/me",
            json={
                "userNm": "Demo Profile",
                "notifyEmail": True,
                "notifySms": False,
                "notifyPush": True,
            },
            headers=headers,
        )
        assert updateResponse.status_code == 200
        updateBody = updateResponse.json()
        assert updateBody["status"] is True
        assert updateBody["result"]["userNm"] == "Demo Profile"
        assert updateBody["result"]["notifyEmail"] is True
        assert updateBody["result"]["notifyPush"] is True

        emailOnlyResponse = client.put(
            "/api/v1/profile/me",
            json={"notifyEmail": False},
            headers=headers,
        )
        assert emailOnlyResponse.status_code == 200
        assert emailOnlyResponse.json()["result"]["notifyEmail"] is False
        assert emailOnlyResponse.json()["result"]["notifyPush"] is True

        smsOnlyResponse = client.put(
            "/api/v1/profile/me",
            json={"notifySms": True},
            headers=headers,
        )
        assert smsOnlyResponse.status_code == 200
        assert smsOnlyResponse.json()["result"]["notifyEmail"] is False
        assert smsOnlyResponse.json()["result"]["notifySms"] is True
        assert smsOnlyResponse.json()["result"]["notifyPush"] is True

        refetchResponse = client.get("/api/v1/profile/me", headers=headers)
        assert refetchResponse.status_code == 200
        refetchResult = refetchResponse.json()["result"]
        assert refetchResult["userNm"] == "Demo Profile"
        assert refetchResult["notifyEmail"] is False
        assert refetchResult["notifySms"] is True
        assert refetchResult["notifyPush"] is True

        dbRow = fetchRowPg(
            pgTestSettings,
            """
            SELECT USER_NM, NOTIFY_EMAIL, NOTIFY_SMS, NOTIFY_PUSH
              FROM T_USER
             WHERE USER_ID = $1
            """,
            "demo@demo.demo",
        )
        assert dbRow is not None
        assert dbRow["user_nm"] == "Demo Profile"
        assert dbRow["notify_email"] == 0
        assert dbRow["notify_sms"] == 1
        assert dbRow["notify_push"] == 1


def testProfileNotifyPersistsAcrossClientLifecycle():
    from server import app

    with TestClient(app) as client:
        loginAsDemo(client)
        headers = authHeaderFromCookie(client)
        updateResponse = client.put(
            "/api/v1/profile/me",
            json={"notifyEmail": True, "notifySms": True, "notifyPush": False},
            headers=headers,
        )
        assert updateResponse.status_code == 200

    with TestClient(app) as client:
        loginAsDemo(client)
        headers = authHeaderFromCookie(client)
        refetchResponse = client.get("/api/v1/profile/me", headers=headers)
        assert refetchResponse.status_code == 200
        refetchResult = refetchResponse.json()["result"]
        assert refetchResult["notifyEmail"] is True
        assert refetchResult["notifySms"] is True
        assert refetchResult["notifyPush"] is False


def testProfileUpdateInvalidInputReturns422():
    from server import app

    with TestClient(app) as client:
        loginAsDemo(client)
        headers = authHeaderFromCookie(client)

        response = client.put("/api/v1/profile/me", json={"userNm": "A"}, headers=headers)
        assert response.status_code == 422
        body = response.json()
        assert body["status"] is False
        assert body["code"] == "AUTH_422_INVALID_INPUT"


def testProfileUpdateRejectsUnknownFields():
    from server import app

    with TestClient(app) as client:
        loginAsDemo(client)
        headers = authHeaderFromCookie(client)

        response = client.put(
            "/api/v1/profile/me",
            json={"userNm": "Demo Profile", "unexpectedField": True},
            headers=headers,
        )
        assert response.status_code == 422
        body = response.json()
        assert body["status"] is False
        assert body["code"] == "AUTH_422_INVALID_INPUT"


def testProfileRequiresAuth():
    from server import app

    with TestClient(app) as client:
        response = client.get("/api/v1/profile/me")
        assert response.status_code == 401
        assert response.headers.get("WWW-Authenticate") == "Bearer"


def testOpenapiDocumentsProfileContracts():
    from server import app

    app.openapi_schema = None
    with TestClient(app) as client:
        response = client.get("/openapi.json")

    assert response.status_code == 200
    schema = response.json()
    schemas = schema["components"]["schemas"]
    assert "ProfileMeResult" in schemas
    assert "ProfileUpdateRequest" in schemas
    assert "ProfileMeResponse" in schemas
    assert "ProfileUpdateResponse" in schemas

    resultProperties = schemas["ProfileMeResult"]["properties"]
    for fieldName in (
        "userNo",
        "userId",
        "userNm",
        "userEml",
        "roleCd",
        "notifyEmail",
        "notifySms",
        "notifyPush",
    ):
        assert fieldName in resultProperties

    updateRequest = schemas["ProfileUpdateRequest"]
    assert updateRequest["additionalProperties"] is False
    assert {"required": ["notifyEmail"]} in updateRequest["anyOf"]

    getOperation = schema["paths"]["/api/v1/profile/me"]["get"]
    getSchema = getOperation["responses"]["200"]["content"]["application/json"]["schema"]
    assert getSchema == {"$ref": "#/components/schemas/ProfileMeResponse"}
    assert {"bearerAuth": []} in getOperation["security"]
    assert getOperation["responses"]["200"]["headers"]["Cache-Control"]["schema"]["example"] == "no-store"
    assert any(
        sample.get("lang") == "JavaScript"
        and sample.get("label") == "openapi-client-axios"
        and "/api/v1/profile/me" in sample.get("source", "")
        for sample in getOperation.get("x-codeSamples", [])
    )

    putOperation = schema["paths"]["/api/v1/profile/me"]["put"]
    requestSchema = putOperation["requestBody"]["content"]["application/json"]["schema"]
    responseSchema = putOperation["responses"]["200"]["content"]["application/json"]["schema"]
    assert requestSchema == {"$ref": "#/components/schemas/ProfileUpdateRequest"}
    assert responseSchema == {"$ref": "#/components/schemas/ProfileUpdateResponse"}
    assert {"bearerAuth": []} in putOperation["security"]
    assert any(
        sample.get("lang") == "JavaScript"
        and sample.get("label") == "openapi-client-axios"
        and "notifyEmail" in sample.get("source", "")
        for sample in putOperation.get("x-codeSamples", [])
    )
