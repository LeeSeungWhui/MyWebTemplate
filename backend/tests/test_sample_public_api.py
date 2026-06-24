import os
import sys

from fastapi.testclient import TestClient

from conftest import resetIntegrationDbState


baseDir = os.path.dirname(os.path.dirname(__file__))
if baseDir not in sys.path:
    sys.path.insert(0, baseDir)


def resetSampleTables():
    resetIntegrationDbState()


def testSampleOverviewAndDashboardArePublic():
    from server import app

    resetSampleTables()
    with TestClient(app) as client:
        overviewResponse = client.get("/api/v1/sample/overview")
        assert overviewResponse.status_code == 200
        overviewResult = overviewResponse.json()["result"]
        assert overviewResult["taskCount"] >= 1
        assert overviewResult["adminUserCount"] >= 1
        assert overviewResult["formSubmissionCount"] == 0

        dashboardResponse = client.get("/api/v1/sample/dashboard")
        assert dashboardResponse.status_code == 200
        dashboardResult = dashboardResponse.json()["result"]
        assert isinstance(dashboardResult["statusSummaryList"], list)
        assert isinstance(dashboardResult["recentList"], list)
        assert len(dashboardResult["recentList"]) >= 1


def testSampleTaskCrudFlow():
    from server import app

    resetSampleTables()
    with TestClient(app) as client:
        listResponse = client.get("/api/v1/sample/tasks?page=1&size=20")
        assert listResponse.status_code == 200
        initialCount = listResponse.json()["count"]
        assert initialCount >= 1

        createResponse = client.post(
            "/api/v1/sample/tasks",
            json={
                "title": "공개 샘플 신규 업무",
                "description": "DB 연동 CRUD 검증",
                "owner": "테스트",
                "status": "running",
                "amount": 210000,
                "attachmentName": "sample.md",
            },
        )
        assert createResponse.status_code == 201
        createResult = createResponse.json()["result"]
        taskId = int(createResult["id"])

        detailResponse = client.get(f"/api/v1/sample/tasks/{taskId}")
        assert detailResponse.status_code == 200
        assert detailResponse.json()["result"]["title"] == "공개 샘플 신규 업무"

        updateResponse = client.put(
            f"/api/v1/sample/tasks/{taskId}",
            json={
                "status": "done",
                "amount": 333000,
                "owner": "수정자",
            },
        )
        assert updateResponse.status_code == 200
        updateResult = updateResponse.json()["result"]
        assert updateResult["status"] == "done"
        assert float(updateResult["amount"]) == 333000

        deleteResponse = client.delete(f"/api/v1/sample/tasks/{taskId}")
        assert deleteResponse.status_code == 200
        assert deleteResponse.json()["result"]["id"] == taskId

        missingResponse = client.get(f"/api/v1/sample/tasks/{taskId}")
        assert missingResponse.status_code == 404
        assert missingResponse.json()["code"] == "SAMPLE_404_NOT_FOUND"


def testSampleTaskCreateIdempotencyReplayAndPayloadMismatch():
    from server import app

    resetSampleTables()
    with TestClient(app) as client:
        headers = {"Idempotency-Key": f"idem-sample-task:{os.urandom(8).hex()}"}
        payload = {
            "title": "공개 샘플 idem 업무",
            "description": "idem replay 검증",
            "owner": "테스트",
            "status": "running",
            "amount": 210000,
            "attachmentName": "sample.md",
        }

        first = client.post("/api/v1/sample/tasks", json=payload, headers=headers)
        assert first.status_code == 201
        firstBody = first.json()
        assert firstBody["status"] is True

        replay = client.post("/api/v1/sample/tasks", json=payload, headers=headers)
        assert replay.status_code == 201
        replayBody = replay.json()
        assert replayBody["status"] is True
        assert replayBody["result"] == firstBody["result"]

        mismatch = client.post(
            "/api/v1/sample/tasks",
            json={**payload, "title": "공개 샘플 idem 변경"},
            headers=headers,
        )
        assert mismatch.status_code == 409
        mismatchBody = mismatch.json()
        assert mismatchBody["status"] is False
        assert mismatchBody["code"] == "IDEMPOTENCY_409_PAYLOAD_MISMATCH"


def testSampleWriteApisRejectUnknownFields():
    from server import app

    resetSampleTables()
    with TestClient(app) as client:
        createTaskResponse = client.post(
            "/api/v1/sample/tasks",
            json={"title": "오타 업무", "status": "ready", "unknownField": True},
        )
        assert createTaskResponse.status_code == 422
        assert createTaskResponse.json()["code"] == "SAMPLE_422_INVALID_INPUT"

        taskListResponse = client.get("/api/v1/sample/tasks?page=1&size=1")
        assert taskListResponse.status_code == 200
        taskId = int(taskListResponse.json()["result"]["sampleTaskList"][0]["id"])
        updateTaskResponse = client.put(
            f"/api/v1/sample/tasks/{taskId}",
            json={"status": "done", "unknownField": True},
        )
        assert updateTaskResponse.status_code == 422
        assert updateTaskResponse.json()["code"] == "SAMPLE_422_INVALID_INPUT"

        submitFormResponse = client.post(
            "/api/v1/sample/forms",
            json={
                "name": "홍길동",
                "email": "hong@example.com",
                "phone": "010-1234-5678",
                "category": "web",
                "startDate": "2026-03-01",
                "endDate": "2026-03-10",
                "budgetRange": "300만 ~ 500만",
                "selectedFeatures": ["login"],
                "unknownField": True,
            },
        )
        assert submitFormResponse.status_code == 422
        assert submitFormResponse.json()["code"] == "SAMPLE_422_INVALID_INPUT"

        createUserResponse = client.post(
            "/api/v1/sample/admin/users",
            json={
                "name": "신규 운영자",
                "email": "new-admin@example.com",
                "role": "editor",
                "status": "active",
                "unknownField": True,
            },
        )
        assert createUserResponse.status_code == 422
        assert createUserResponse.json()["code"] == "SAMPLE_422_INVALID_INPUT"

        userListResponse = client.get("/api/v1/sample/admin/users?page=1&size=1")
        assert userListResponse.status_code == 200
        userId = int(userListResponse.json()["result"]["sampleAdminUserList"][0]["id"])
        updateUserResponse = client.put(
            f"/api/v1/sample/admin/users/{userId}",
            json={"role": "admin", "unknownField": True},
        )
        assert updateUserResponse.status_code == 422
        assert updateUserResponse.json()["code"] == "SAMPLE_422_INVALID_INPUT"

        updateSettingsResponse = client.put(
            "/api/v1/sample/admin/settings",
            json={
                "siteName": "MyWebTemplate Sample",
                "adminEmail": "sample-admin@example.com",
                "sessionTimeout": 90,
                "maxUploadMb": 50,
                "unknownField": True,
            },
        )
        assert updateSettingsResponse.status_code == 422
        assert updateSettingsResponse.json()["code"] == "SAMPLE_422_INVALID_INPUT"


def testSampleListRoutersPassRawPaginationToService(monkeypatch):
    from server import app
    from router import SampleRouter

    captured = {}

    async def fakeListSampleTasks(**kwargs):
        captured["tasks"] = dict(kwargs)
        return {
            "sampleTaskList": [],
            "total": 0,
            "page": 1,
            "size": 50,
            "q": kwargs.get("q") or "",
            "status": kwargs.get("status") or "",
            "fromDate": kwargs.get("fromDate") or "",
            "toDate": kwargs.get("toDate") or "",
        }

    async def fakeListSampleAdminUsers(**kwargs):
        captured["users"] = dict(kwargs)
        return {
            "sampleAdminUserList": [],
            "total": 0,
            "page": 1,
            "size": 50,
        }

    monkeypatch.setattr(SampleRouter.SampleService, "listSampleTasks", fakeListSampleTasks)
    monkeypatch.setattr(SampleRouter.SampleService, "listSampleAdminUsers", fakeListSampleAdminUsers)

    with TestClient(app) as client:
        taskResponse = client.get("/api/v1/sample/tasks?page=0&size=999&q=demo")
        assert taskResponse.status_code == 200
        userResponse = client.get("/api/v1/sample/admin/users?page=-5&size=777")
        assert userResponse.status_code == 200

    assert captured["tasks"] == {
        "q": "demo",
        "status": None,
        "fromDate": None,
        "toDate": None,
        "page": 0,
        "size": 999,
    }
    assert captured["users"] == {
        "page": -5,
        "size": 777,
    }


def testSampleFormMetaAndSubmit():
    from server import app

    resetSampleTables()
    with TestClient(app) as client:
        metaResponse = client.get("/api/v1/sample/forms/meta")
        assert metaResponse.status_code == 200
        metaResult = metaResponse.json()["result"]
        assert metaResult["submissionCount"] == 0
        assert "web" in metaResult["categoryCodeList"]
        assert "login" in metaResult["featureCodeList"]

        submitResponse = client.post(
            "/api/v1/sample/forms",
            json={
                "name": "홍길동",
                "email": "hong@example.com",
                "phone": "010-1234-5678",
                "category": "web",
                "startDate": "2026-03-01",
                "endDate": "2026-03-10",
                "budgetRange": "300만 ~ 500만",
                "requirement": "대시보드 고도화",
                "selectedFeatures": ["login", "chart"],
                "referenceUrl": "https://example.com/spec",
                "attachmentName": "brief.pdf",
            },
        )
        assert submitResponse.status_code == 201
        submitResult = submitResponse.json()["result"]
        assert submitResult["name"] == "홍길동"
        assert submitResult["email"] == "hong@example.com"
        assert submitResult["selectedFeatures"] == ["login", "chart"]

        metaReloadResponse = client.get("/api/v1/sample/forms/meta")
        assert metaReloadResponse.status_code == 200
        metaReloadResult = metaReloadResponse.json()["result"]
        assert metaReloadResult["submissionCount"] == 1
        latestSubmission = metaReloadResult["latestSubmission"]
        assert set(latestSubmission.keys()) == {"id", "category", "selectedFeatures", "createdAt"}
        assert latestSubmission["category"] == "web"
        assert latestSubmission["selectedFeatures"] == ["login", "chart"]
        for piiField in ("name", "email", "phone", "requirement", "referenceUrl", "attachmentName"):
            assert piiField not in latestSubmission


def testSampleAdminUserAndSettingFlow():
    from server import app

    resetSampleTables()
    with TestClient(app) as client:
        userListResponse = client.get("/api/v1/sample/admin/users")
        assert userListResponse.status_code == 200
        userResult = userListResponse.json()["result"]
        userList = userResult["sampleAdminUserList"]
        assert len(userList) >= 3
        assert userResult["listMetaObj"]["page"] == 1
        assert userResult["listMetaObj"]["size"] == 50
        assert userResult["listMetaObj"]["totalCount"] >= len(userList)

        createUserResponse = client.post(
            "/api/v1/sample/admin/users",
            json={
                "name": "신규 운영자",
                "email": "new-admin@example.com",
                "role": "editor",
                "status": "active",
                "notifyEmail": True,
                "notifySms": False,
                "notifyPush": True,
            },
        )
        assert createUserResponse.status_code == 201
        createdUser = createUserResponse.json()["result"]
        userId = int(createdUser["id"])

        updateUserResponse = client.put(
            f"/api/v1/sample/admin/users/{userId}",
            json={
                "name": "수정 운영자",
                "role": "admin",
                "status": "inactive",
                "notifySms": True,
            },
        )
        assert updateUserResponse.status_code == 200
        updatedUser = updateUserResponse.json()["result"]
        assert updatedUser["name"] == "수정 운영자"
        assert updatedUser["role"] == "admin"
        assert updatedUser["notifySms"] is True

        settingsResponse = client.get("/api/v1/sample/admin/settings")
        assert settingsResponse.status_code == 200
        settingsResult = settingsResponse.json()["result"]
        assert settingsResult["systemSetting"]["siteName"] == "MyWebTemplate"
        assert settingsResult["rolePermissionMap"]["admin"]["manageUser"] is True

        saveSettingsResponse = client.put(
            "/api/v1/sample/admin/settings",
            json={
                "siteName": "MyWebTemplate Sample",
                "adminEmail": "sample-admin@example.com",
                "maintenanceMode": True,
                "sessionTimeout": 90,
                "maxUploadMb": 50,
            },
        )
        assert saveSettingsResponse.status_code == 200
        savedSetting = saveSettingsResponse.json()["result"]["systemSetting"]
        assert savedSetting["siteName"] == "MyWebTemplate Sample"
        assert savedSetting["maintenanceMode"] is True


def testSampleOpenApiSchemasDocumentWriteContracts():
    from server import app

    with TestClient(app) as client:
        schema = client.get("/openapi.json").json()

    components = schema["components"]["schemas"]

    requiredSchemas = {
        "SampleOverviewResponse",
        "SampleDashboardResponse",
        "SampleTaskListResponse",
        "SampleTaskDetailResponse",
        "SampleTaskCreateResponse",
        "SampleTaskUpdateResponse",
        "SampleTaskDeleteResponse",
        "SampleFormMetaResponse",
        "SampleFormSubmitResponse",
        "SampleAdminUserListResponse",
        "SampleAdminUserCreateResponse",
        "SampleAdminUserUpdateResponse",
        "SampleAdminSettingsResponse",
        "SampleAdminSettingsUpdateResponse",
        "SampleTaskWriteRequest",
        "SampleTaskPatchRequest",
        "SampleFormSubmitRequest",
        "SampleAdminUserWriteRequest",
        "SampleAdminUserPatchRequest",
        "SampleAdminSettingsUpdateRequest",
    }
    assert requiredSchemas.issubset(components.keys())

    for schemaName in (
        "SampleTaskWriteRequest",
        "SampleTaskPatchRequest",
        "SampleFormSubmitRequest",
        "SampleAdminUserWriteRequest",
        "SampleAdminUserPatchRequest",
        "SampleAdminSettingsUpdateRequest",
    ):
        assert components[schemaName]["additionalProperties"] is False

    assert components["SampleTaskPatchRequest"]["minProperties"] == 1
    assert components["SampleAdminUserPatchRequest"]["minProperties"] == 1
    assert components["SampleAdminSettingsUpdateRequest"]["properties"]["sessionTimeout"]["maximum"] == 1440
    assert components["SampleAdminSettingsUpdateRequest"]["properties"]["maxUploadMb"]["maximum"] == 1000


def testSampleOpenApiPathsUseSchemaRefsAndCodeSamples():
    from server import app

    with TestClient(app) as client:
        schema = client.get("/openapi.json").json()

    paths = schema["paths"]

    responseExpectations = {
        ("/api/v1/sample/overview", "get", "200"): "#/components/schemas/SampleOverviewResponse",
        ("/api/v1/sample/dashboard", "get", "200"): "#/components/schemas/SampleDashboardResponse",
        ("/api/v1/sample/tasks", "get", "200"): "#/components/schemas/SampleTaskListResponse",
        ("/api/v1/sample/tasks/{taskId}", "get", "200"): "#/components/schemas/SampleTaskDetailResponse",
        ("/api/v1/sample/tasks", "post", "201"): "#/components/schemas/SampleTaskCreateResponse",
        ("/api/v1/sample/tasks/{taskId}", "put", "200"): "#/components/schemas/SampleTaskUpdateResponse",
        ("/api/v1/sample/tasks/{taskId}", "delete", "200"): "#/components/schemas/SampleTaskDeleteResponse",
        ("/api/v1/sample/forms/meta", "get", "200"): "#/components/schemas/SampleFormMetaResponse",
        ("/api/v1/sample/forms", "post", "201"): "#/components/schemas/SampleFormSubmitResponse",
        ("/api/v1/sample/admin/users", "get", "200"): "#/components/schemas/SampleAdminUserListResponse",
        ("/api/v1/sample/admin/users", "post", "201"): "#/components/schemas/SampleAdminUserCreateResponse",
        ("/api/v1/sample/admin/users/{userId}", "put", "200"): "#/components/schemas/SampleAdminUserUpdateResponse",
        ("/api/v1/sample/admin/settings", "get", "200"): "#/components/schemas/SampleAdminSettingsResponse",
        ("/api/v1/sample/admin/settings", "put", "200"): "#/components/schemas/SampleAdminSettingsUpdateResponse",
    }
    for (path, method, statusCode), schemaRef in responseExpectations.items():
        operation = paths[path][method]
        response = operation["responses"][statusCode]
        responseSchema = response["content"]["application/json"]["schema"]
        assert responseSchema["$ref"] == schemaRef
        cacheControlHeader = response["headers"]["Cache-Control"]
        assert cacheControlHeader["schema"]["type"] == "string"
        assert cacheControlHeader["schema"]["example"] == "no-store"

    requestBodyExpectations = {
        ("/api/v1/sample/tasks", "post"): "#/components/schemas/SampleTaskWriteRequest",
        ("/api/v1/sample/tasks/{taskId}", "put"): "#/components/schemas/SampleTaskPatchRequest",
        ("/api/v1/sample/forms", "post"): "#/components/schemas/SampleFormSubmitRequest",
        ("/api/v1/sample/admin/users", "post"): "#/components/schemas/SampleAdminUserWriteRequest",
        ("/api/v1/sample/admin/users/{userId}", "put"): "#/components/schemas/SampleAdminUserPatchRequest",
        ("/api/v1/sample/admin/settings", "put"): "#/components/schemas/SampleAdminSettingsUpdateRequest",
    }
    for (path, method), schemaRef in requestBodyExpectations.items():
        operation = paths[path][method]
        requestSchema = operation["requestBody"]["content"]["application/json"]["schema"]
        assert requestSchema["$ref"] == schemaRef

    for path, method in (
        ("/api/v1/sample/tasks", "post"),
        ("/api/v1/sample/forms", "post"),
        ("/api/v1/sample/admin/users", "post"),
    ):
        parameters = paths[path][method]["parameters"]
        assert {"$ref": "#/components/parameters/IdempotencyKey"} in parameters

    for path, method in (
        ("/api/v1/sample/overview", "get"),
        ("/api/v1/sample/tasks", "post"),
        ("/api/v1/sample/admin/settings", "put"),
    ):
        codeSamples = paths[path][method]["x-codeSamples"]
        assert any(
            sample.get("lang") == "JavaScript" and sample.get("label") == "openapi-client-axios"
            for sample in codeSamples
        )
