import os
import sys
from fastapi.testclient import TestClient

from conftest import pgTestSettings
from db_support import executePg


baseDir = os.path.dirname(os.path.dirname(__file__))
if baseDir not in sys.path:
    sys.path.insert(0, baseDir)


def authHeaderFromCookie(client):
    token = client.cookies.get("access_token")
    return {"Authorization": f"Bearer {token}"} if token else {}


def ensureDataTableAndSeed():
    executePg(pgTestSettings, "DROP TABLE IF EXISTS T_DATA")
    executePg(
        pgTestSettings,
        """
        CREATE TABLE T_DATA (
            DATA_NO BIGSERIAL PRIMARY KEY,
            USER_ID TEXT NOT NULL,
            DATA_NM TEXT NOT NULL,
            DATA_DESC TEXT,
            STAT_CD TEXT NOT NULL,
            AMT NUMERIC,
            TAG_JSON TEXT,
            REG_DT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
    )
    executePg(
        pgTestSettings,
        """
        INSERT INTO T_DATA (USER_ID, DATA_NM, DATA_DESC, STAT_CD, AMT, TAG_JSON)
        VALUES ($1, $2, $3, $4, $5, $6)
        """,
        "demo@demo.demo",
        "테스트 업무",
        "REST 경로 검증",
        "ready",
        1000,
        '["qa"]',
    )
    executePg(
        pgTestSettings,
        """
        INSERT INTO T_DATA (USER_ID, DATA_NM, DATA_DESC, STAT_CD, AMT, TAG_JSON)
        VALUES ($1, $2, $3, $4, $5, $6)
        """,
        "demo@demo.demo",
        "운영 점검",
        "필터용 샘플",
        "pending",
        2000,
        '["ops","night"]',
    )
    executePg(
        pgTestSettings,
        """
        INSERT INTO T_DATA (USER_ID, DATA_NM, DATA_DESC, STAT_CD, AMT, TAG_JSON)
        VALUES ($1, $2, $3, $4, $5, $6)
        """,
        "viewer@demo.demo",
        "다른 사용자 업무",
        "소유권 검증 샘플",
        "ready",
        500,
        '["other"]',
    )


def loginAs(client, username: str, password: str):
    response = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password, "rememberMe": True},
    )
    assert response.status_code == 200


def loginAsDemo(client):
    loginAs(client, "demo@demo.demo", "password123")


def ensureSignup(client, *, name: str, email: str, password: str):
    response = client.post(
        "/api/v1/auth/signup",
        json={"name": name, "email": email, "password": password},
    )
    assert response.status_code in (201, 409)


def testDashboardListRestPath():
    from server import app

    ensureDataTableAndSeed()
    with TestClient(app) as client:
        loginAsDemo(client)

        response = client.get(
            "/api/v1/dashboard?page=1&size=10&q=테스트&status=ready",
            headers=authHeaderFromCookie(client),
        )
        assert response.status_code == 200
        body = response.json()
        assert body["status"] is True
        result = body["result"]["dataTemplateList"]
        assert isinstance(result, list)
        assert body["count"] >= 1
        assert result[0]["title"] == "테스트 업무"
        assert isinstance(result[0]["amount"], (int, float))

        statsResponse = client.get("/api/v1/dashboard/stats", headers=authHeaderFromCookie(client))
        assert statsResponse.status_code == 200
        statusSummaryList = statsResponse.json()["result"]["statusSummaryList"]
        assert statusSummaryList
        assert isinstance(statusSummaryList[0]["amountSum"], (int, float))


def testDashboardCrudFlow():
    from server import app

    ensureDataTableAndSeed()
    with TestClient(app) as client:
        loginAsDemo(client)
        headers = authHeaderFromCookie(client)

        createResponse = client.post(
            "/api/v1/dashboard",
            json={
                "title": "신규 업무",
                "description": "CRUD 생성 테스트",
                "status": "running",
                "amount": 32100,
                "tags": ["web", "portfolio"],
            },
            headers=headers,
        )
        assert createResponse.status_code == 201
        createBody = createResponse.json()
        assert createBody["status"] is True
        assert createBody["result"]["title"] == "신규 업무"

        listResponse = client.get("/api/v1/dashboard?q=신규 업무&size=10&page=1", headers=headers)
        assert listResponse.status_code == 200
        listItems = listResponse.json()["result"]["dataTemplateList"]
        assert len(listItems) >= 1
        dataId = int(listItems[0]["id"])

        updateResponse = client.put(
            f"/api/v1/dashboard/{dataId}",
            json={"status": "done", "amount": 55500, "tags": "release, done"},
            headers=headers,
        )
        assert updateResponse.status_code == 200
        updateResult = updateResponse.json()["result"]
        assert updateResult["status"] == "done"
        assert float(updateResult["amount"]) == 55500

        detailResponse = client.get(f"/api/v1/dashboard/{dataId}", headers=headers)
        assert detailResponse.status_code == 200
        detailResult = detailResponse.json()["result"]
        assert detailResult["status"] == "done"

        deleteResponse = client.delete(f"/api/v1/dashboard/{dataId}", headers=headers)
        assert deleteResponse.status_code == 200
        assert deleteResponse.json()["status"] is True

        missingResponse = client.get(f"/api/v1/dashboard/{dataId}", headers=headers)
        assert missingResponse.status_code == 404
        missingBody = missingResponse.json()
        assert missingBody["status"] is False
        assert missingBody["code"] == "DASH_404_NOT_FOUND"


def testDashboardInvalidPayloadReturns422():
    from server import app

    ensureDataTableAndSeed()
    with TestClient(app) as client:
        loginAsDemo(client)
        headers = authHeaderFromCookie(client)

        response = client.post(
            "/api/v1/dashboard",
            json={"title": "", "status": "unknown"},
            headers=headers,
        )
        assert response.status_code == 422
        body = response.json()
        assert body["status"] is False
        assert body["code"] == "DASH_422_INVALID_INPUT"


def testDashboardRejectsUnknownWriteFields():
    from server import app

    ensureDataTableAndSeed()
    with TestClient(app) as client:
        loginAsDemo(client)
        headers = authHeaderFromCookie(client)

        createResponse = client.post(
            "/api/v1/dashboard",
            json={"title": "신규 업무", "status": "ready", "unknownField": True},
            headers=headers,
        )
        assert createResponse.status_code == 422
        createBody = createResponse.json()
        assert createBody["status"] is False
        assert createBody["code"] == "DASH_422_INVALID_INPUT"

        listResponse = client.get("/api/v1/dashboard?q=테스트 업무&size=10&page=1", headers=headers)
        assert listResponse.status_code == 200
        dataId = int(listResponse.json()["result"]["dataTemplateList"][0]["id"])

        updateResponse = client.put(
            f"/api/v1/dashboard/{dataId}",
            json={"status": "done", "unknownField": True},
            headers=headers,
        )
        assert updateResponse.status_code == 422
        updateBody = updateResponse.json()
        assert updateBody["status"] is False
        assert updateBody["code"] == "DASH_422_INVALID_INPUT"


def testDashboardRequiresAuth():
    from server import app

    ensureDataTableAndSeed()
    with TestClient(app) as client:
        response = client.get("/api/v1/dashboard")
        assert response.status_code == 401
        assert response.headers.get("WWW-Authenticate") == "Bearer"


def testDashboardRejectsCrossUserDetailAccess():
    from server import app

    ensureDataTableAndSeed()
    with TestClient(app) as client:
        loginAsDemo(client)
        ownerHeaders = authHeaderFromCookie(client)
        ownerList = client.get("/api/v1/dashboard?q=테스트 업무&size=10&page=1", headers=ownerHeaders)
        assert ownerList.status_code == 200
        ownerItems = ownerList.json()["result"]["dataTemplateList"]
        assert len(ownerItems) == 1
        ownerDataId = int(ownerItems[0]["id"])

    with TestClient(app) as client:
        ensureSignup(client, name="Viewer", email="viewer@demo.demo", password="password123")
        loginAs(client, "viewer@demo.demo", "password123")
        viewerHeaders = authHeaderFromCookie(client)
        detailResponse = client.get(f"/api/v1/dashboard/{ownerDataId}", headers=viewerHeaders)
        assert detailResponse.status_code == 404
        body = detailResponse.json()
        assert body["status"] is False
        assert body["code"] == "DASH_404_NOT_FOUND"


def testOpenapiDocumentsDashboardContracts():
    from server import app

    app.openapi_schema = None
    with TestClient(app) as client:
        response = client.get("/openapi.json")

    assert response.status_code == 200
    schema = response.json()
    schemas = schema["components"]["schemas"]
    for schemaName in (
        "DashboardItem",
        "DashboardListMeta",
        "DashboardListResult",
        "DashboardStatsItem",
        "DashboardStatsResult",
        "DashboardWriteRequest",
        "DashboardPatchRequest",
        "DashboardDeleteResult",
        "DashboardListResponse",
        "DashboardStatsResponse",
        "DashboardItemResponse",
        "DashboardCreateResponse",
        "DashboardUpdateResponse",
        "DashboardDeleteResponse",
    ):
        assert schemaName in schemas

    itemProperties = schemas["DashboardItem"]["properties"]
    for fieldName in ("id", "title", "description", "status", "amount", "tags", "createdAt"):
        assert fieldName in itemProperties
    assert schemas["DashboardWriteRequest"]["required"] == ["title", "status"]
    assert schemas["DashboardWriteRequest"]["additionalProperties"] is False
    assert {"required": ["status"]} in schemas["DashboardPatchRequest"]["anyOf"]
    assert schemas["DashboardPatchRequest"]["additionalProperties"] is False

    listOperation = schema["paths"]["/api/v1/dashboard"]["get"]
    listSchema = listOperation["responses"]["200"]["content"]["application/json"]["schema"]
    assert listSchema == {"$ref": "#/components/schemas/DashboardListResponse"}
    assert {"bearerAuth": []} in listOperation["security"]
    assert listOperation["responses"]["200"]["headers"]["Cache-Control"]["schema"]["example"] == "no-store"
    assert any(
        sample.get("lang") == "JavaScript"
        and sample.get("label") == "openapi-client-axios"
        and "/api/v1/dashboard" in sample.get("source", "")
        for sample in listOperation.get("x-codeSamples", [])
    )

    statsOperation = schema["paths"]["/api/v1/dashboard/stats"]["get"]
    statsSchema = statsOperation["responses"]["200"]["content"]["application/json"]["schema"]
    assert statsSchema == {"$ref": "#/components/schemas/DashboardStatsResponse"}

    pathOperations = schema["paths"]["/api/v1/dashboard/{dataId}"]
    detailSchema = pathOperations["get"]["responses"]["200"]["content"]["application/json"]["schema"]
    updateRequestSchema = pathOperations["put"]["requestBody"]["content"]["application/json"]["schema"]
    updateResponseSchema = pathOperations["put"]["responses"]["200"]["content"]["application/json"]["schema"]
    deleteResponseSchema = pathOperations["delete"]["responses"]["200"]["content"]["application/json"]["schema"]
    assert detailSchema == {"$ref": "#/components/schemas/DashboardItemResponse"}
    assert updateRequestSchema == {"$ref": "#/components/schemas/DashboardPatchRequest"}
    assert updateResponseSchema == {"$ref": "#/components/schemas/DashboardUpdateResponse"}
    assert deleteResponseSchema == {"$ref": "#/components/schemas/DashboardDeleteResponse"}

    createOperation = schema["paths"]["/api/v1/dashboard"]["post"]
    createRequestSchema = createOperation["requestBody"]["content"]["application/json"]["schema"]
    createResponseSchema = createOperation["responses"]["201"]["content"]["application/json"]["schema"]
    assert "200" not in createOperation["responses"]
    assert createRequestSchema == {"$ref": "#/components/schemas/DashboardWriteRequest"}
    assert createResponseSchema == {"$ref": "#/components/schemas/DashboardCreateResponse"}
    assert {"$ref": "#/components/parameters/IdempotencyKey"} in createOperation["parameters"]
    assert any(
        sample.get("lang") == "JavaScript"
        and sample.get("label") == "openapi-client-axios"
        and "Idempotency-Key" in sample.get("source", "")
        for sample in createOperation.get("x-codeSamples", [])
    )
