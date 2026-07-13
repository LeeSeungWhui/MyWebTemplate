import os
import sys

from fastapi import FastAPI
from fastapi.testclient import TestClient

from service.DashboardService import ALLOWED_SORT_ORDER, DASHBOARD_STATUS_ORDER
from service.SampleService import (
    SAMPLE_ADMIN_ROLE_ORDER,
    SAMPLE_ADMIN_STATUS_ORDER,
    SAMPLE_TASK_STATUS_ORDER,
)


baseDir = os.path.dirname(os.path.dirname(__file__))
if baseDir not in sys.path:
    sys.path.insert(0, baseDir)


def readOpenapiSchema():
    from server import app

    app.openapi_schema = None
    with TestClient(app) as client:
        response = client.get("/openapi.json")
    assert response.status_code == 200
    return response.json()


def iterRefs(value):
    if isinstance(value, dict):
        ref = value.get("$ref")
        if isinstance(ref, str):
            yield ref
        for nested in value.values():
            yield from iterRefs(nested)
    elif isinstance(value, list):
        for item in value:
            yield from iterRefs(item)


def resolveLocalRef(schema, ref: str):
    assert ref.startswith("#/"), ref
    current = schema
    for part in ref[2:].split("/"):
        assert isinstance(current, dict), ref
        assert part in current, ref
        current = current[part]
    return current


def testOpenapiErrorComponentsAndEnumSync():
    schema = readOpenapiSchema()
    components = schema["components"]
    standardSchema = components["schemas"]["StandardResponse"]
    errorSchema = components["schemas"]["ErrorResponse"]

    assert standardSchema["required"] == ["status", "message", "result", "requestId"]
    assert errorSchema["required"] == ["status", "message", "code", "requestId"]
    assert errorSchema["properties"]["status"]["const"] is False
    assert errorSchema["additionalProperties"] is False

    for responseName in (
        "UnauthorizedErrorResponse",
        "ForbiddenErrorResponse",
        "NotFoundErrorResponse",
        "ConflictErrorResponse",
        "ValidationErrorResponse",
        "RateLimitErrorResponse",
        "InternalServerErrorResponse",
        "ServiceUnavailableErrorResponse",
    ):
        assert responseName in components["responses"]
        response = components["responses"][responseName]
        assert response["content"]["application/json"]["schema"] == {
            "$ref": "#/components/schemas/ErrorResponse"
        }

    schemas = components["schemas"]
    assert schemas["DashboardItem"]["properties"]["status"]["enum"] == list(DASHBOARD_STATUS_ORDER)
    assert schemas["DashboardListMeta"]["properties"]["sort"]["enum"] == list(ALLOWED_SORT_ORDER)
    assert schemas["SampleTaskItem"]["properties"]["status"]["enum"] == list(SAMPLE_TASK_STATUS_ORDER)
    assert schemas["SampleAdminUserItem"]["properties"]["role"]["enum"] == list(SAMPLE_ADMIN_ROLE_ORDER)
    assert schemas["SampleAdminUserItem"]["properties"]["status"]["enum"] == list(SAMPLE_ADMIN_STATUS_ORDER)


def testOpenapiErrorRefsAppliedToCoreOperations():
    schema = readOpenapiSchema()
    paths = schema["paths"]

    expectations = {
        ("/api/v1/auth/login", "post"): {
            "401": "UnauthorizedErrorResponse",
            "422": "ValidationErrorResponse",
            "429": "RateLimitErrorResponse",
        },
        ("/api/v1/auth/signup", "post"): {
            "409": "ConflictErrorResponse",
            "422": "ValidationErrorResponse",
            "500": "InternalServerErrorResponse",
            "503": "ServiceUnavailableErrorResponse",
        },
        ("/api/v1/auth/password-reset/request", "post"): {
            "422": "ValidationErrorResponse",
            "500": "InternalServerErrorResponse",
        },
        ("/api/v1/auth/password-reset/complete", "post"): {
            "400": "ValidationErrorResponse",
            "422": "ValidationErrorResponse",
            "500": "InternalServerErrorResponse",
            "503": "ServiceUnavailableErrorResponse",
        },
        ("/api/v1/profile/me", "put"): {
            "401": "UnauthorizedErrorResponse",
            "404": "NotFoundErrorResponse",
            "422": "ValidationErrorResponse",
            "503": "ServiceUnavailableErrorResponse",
        },
        ("/api/v1/profile/me", "get"): {
            "401": "UnauthorizedErrorResponse",
            "404": "NotFoundErrorResponse",
            "503": "ServiceUnavailableErrorResponse",
        },
        ("/api/v1/dashboard", "post"): {
            "401": "UnauthorizedErrorResponse",
            "409": "ConflictErrorResponse",
            "422": "ValidationErrorResponse",
            "500": "InternalServerErrorResponse",
            "503": "ServiceUnavailableErrorResponse",
        },
        ("/api/v1/sample/tasks", "post"): {
            "409": "ConflictErrorResponse",
            "422": "ValidationErrorResponse",
            "500": "InternalServerErrorResponse",
            "503": "ServiceUnavailableErrorResponse",
        },
    }

    for (path, method), statusMap in expectations.items():
        responses = paths[path][method]["responses"]
        for statusCode, componentName in statusMap.items():
            assert responses[statusCode] == {
                "$ref": f"#/components/responses/{componentName}"
            }
    assert "503" not in paths["/api/v1/auth/password-reset/request"]["post"]["responses"]


def testOpenapiLocalRefsResolveAndCoreOperationsExist():
    schema = readOpenapiSchema()

    requiredOperations = (
        ("/healthz", "get"),
        ("/readyz", "get"),
        ("/api/v1/auth/login", "post"),
        ("/api/v1/auth/signup", "post"),
        ("/api/v1/auth/me", "get"),
        ("/api/v1/profile/me", "get"),
        ("/api/v1/profile/me", "put"),
        ("/api/v1/dashboard", "get"),
        ("/api/v1/dashboard", "post"),
        ("/api/v1/sample/tasks", "get"),
        ("/api/v1/sample/tasks", "post"),
        ("/api/v1/sample/admin/users", "post"),
    )
    for path, method in requiredOperations:
        assert method in schema["paths"][path]

    refs = set(iterRefs(schema))
    assert refs
    for ref in refs:
        resolveLocalRef(schema, ref)


def testOpenapiPatchStrictEnvTruthTable():
    from lib.OpenAPIHelpers import isOpenapiPatchStrictEnabled

    for value in ("1", "true", "TRUE", " yes ", "On"):
        assert isOpenapiPatchStrictEnabled({"OPENAPI_PATCH_STRICT": value}) is True

    for value in ("", "0", "false", "no", "off", "random"):
        assert isOpenapiPatchStrictEnabled({"OPENAPI_PATCH_STRICT": value}) is False


def testOpenapiPatchFailureStaysNonStrictByDefault(monkeypatch):
    from lib import OpenAPI

    app = FastAPI()

    @app.get("/healthz")
    def healthz():
        return {"status": True}

    OpenAPI.attachOpenAPI(app, {})

    def raisePatchFailure(*args, **kwargs):
        raise RuntimeError("boom")

    monkeypatch.setattr(OpenAPI, "ensureJavaScriptCodeSample", raisePatchFailure)
    monkeypatch.delenv("OPENAPI_PATCH_STRICT", raising=False)

    schema = app.openapi()
    assert schema["paths"]["/healthz"]["get"]["responses"]["200"]["description"] == "OK (process is alive)"


def testOpenapiPatchFailureRaisesInStrictMode(monkeypatch):
    from lib import OpenAPI

    app = FastAPI()

    @app.get("/healthz")
    def healthz():
        return {"status": True}

    OpenAPI.attachOpenAPI(app, {})

    def raisePatchFailure(*args, **kwargs):
        raise RuntimeError("boom")

    monkeypatch.setattr(OpenAPI, "ensureJavaScriptCodeSample", raisePatchFailure)
    monkeypatch.setenv("OPENAPI_PATCH_STRICT", "true")

    try:
        app.openapi()
        assert False, "strict mode must re-raise openapi patch failures"
    except RuntimeError as exc:
        assert str(exc) == "boom"


def testAttachOpenapiInvalidatesPreviouslyCachedDefaultSchema():
    from lib import OpenAPI

    app = FastAPI()

    @app.get("/healthz")
    def healthz():
        return {"status": True}

    defaultSchema = app.openapi()
    assert "ErrorResponse" not in defaultSchema.get("components", {}).get("schemas", {})

    OpenAPI.attachOpenAPI(app, {})

    patchedSchema = app.openapi()
    assert patchedSchema is not defaultSchema
    assert "ErrorResponse" in patchedSchema["components"]["schemas"]
