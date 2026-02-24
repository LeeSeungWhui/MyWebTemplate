import os
import sys
import sqlite3
from fastapi.testclient import TestClient


baseDir = os.path.dirname(os.path.dirname(__file__))
if baseDir not in sys.path:
    sys.path.insert(0, baseDir)


def authHeaderFromCookie(client):
    token = client.cookies.get("access_token")
    return {"Authorization": f"Bearer {token}"} if token else {}


def ensureDataTableAndSeed():
    dbPath = os.path.join(baseDir, "data", "test.db")
    os.makedirs(os.path.dirname(dbPath), exist_ok=True)
    con = sqlite3.connect(dbPath)
    try:
        con.execute(
            """
            CREATE TABLE IF NOT EXISTS T_DATA (
                DATA_NO INTEGER PRIMARY KEY AUTOINCREMENT,
                DATA_NM TEXT NOT NULL,
                DATA_DESC TEXT,
                STAT_CD TEXT NOT NULL,
                AMT REAL,
                TAG_JSON TEXT,
                REG_DT TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        con.execute("DELETE FROM T_DATA")
        con.execute(
            """
            INSERT INTO T_DATA (DATA_NM, DATA_DESC, STAT_CD, AMT, TAG_JSON)
            VALUES (?, ?, ?, ?, ?)
            """,
            ("테스트 업무", "REST 경로 검증", "ready", 1000, '["qa"]'),
        )
        con.execute(
            """
            INSERT INTO T_DATA (DATA_NM, DATA_DESC, STAT_CD, AMT, TAG_JSON)
            VALUES (?, ?, ?, ?, ?)
            """,
            ("운영 점검", "필터용 샘플", "pending", 2000, '["ops","night"]'),
        )
        con.commit()
    finally:
        con.close()


def loginAsDemo(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "demo@demo.demo", "password": "password123", "rememberMe": True},
    )
    assert response.status_code == 200


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
        result = body["result"]
        assert isinstance(result["items"], list)
        assert result["count"] == 1
        assert result["total"] >= 1
        assert result["items"][0]["title"] == "테스트 업무"


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
        listItems = listResponse.json()["result"]["items"]
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


def testDashboardRequiresAuth():
    from server import app

    ensureDataTableAndSeed()
    with TestClient(app) as client:
        response = client.get("/api/v1/dashboard")
        assert response.status_code == 401
        assert response.headers.get("WWW-Authenticate") == "Bearer"
