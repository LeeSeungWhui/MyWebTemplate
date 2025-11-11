import os
from fastapi.testclient import TestClient


def test_openapi_components_and_servers():
    from server import app
    with TestClient(app) as client:
        r = client.get("/openapi.json")
        assert r.status_code == 200
        j = r.json()
        comps = j.get("components", {})
        schemes = comps.get("securitySchemes", {})
        assert "cookieAuth" in schemes and "bearerAuth" in schemes
        schemas = comps.get("schemas", {})
        assert "StandardResponse" in schemas and "ErrorResponse" in schemas
        params = comps.get("parameters", {})
        assert "CSRFToken" in params
        servers = j.get("servers", [])
        urls = [s.get("url") for s in servers]
        assert "http://localhost:2000" in urls


def test_login_204_set_cookie_documented():
    from server import app
    with TestClient(app) as client:
        j = client.get("/openapi.json").json()
        op = j["paths"].get("/api/v1/auth/login", {}).get("post")
        assert op
        res204 = op["responses"].get("204")
        assert res204
        headers = res204.get("headers", {})
        assert "Set-Cookie" in headers


def test_session_security_allows_cookie_or_bearer():
    from server import app
    with TestClient(app) as client:
        j = client.get("/openapi.json").json()
        op = j["paths"].get("/api/v1/auth/session", {}).get("get")
        assert op
        sec = op.get("security", [])
        # must include OR between cookie and bearer
        assert any("cookieAuth" in s for s in sec)
        assert any("bearerAuth" in s for s in sec)


def test_unsafe_methods_require_csrf_parameter():
    from server import app
    with TestClient(app) as client:
        j = client.get("/openapi.json").json()
        # Use logout endpoint as representative unsafe POST
        op = j["paths"].get("/api/v1/auth/logout", {}).get("post")
        assert op
        params = op.get("parameters", [])
        # Ensure CSRF Token parameter is present via $ref
        assert any(p.get("$ref") == "#/components/parameters/CSRFToken" for p in params)


def test_openapi_patcher_logs_errors(caplog):
    # Re-attach with broken config to trigger error logging, reset schema cache
    from server import app
    from lib.OpenAPI import attachOpenAPI

    class BrokenCfg(dict):
        # Provide AUTH with wrong type to trigger AttributeError
        pass

    with TestClient(app) as client:
        # After startup attaches normal openapi, override with broken config
        app.openapi_schema = None
        attachOpenAPI(app, BrokenCfg({"AUTH": object()}))
        caplog.clear()
        _ = client.get("/openapi.json")
    # check logs contain our error message
    assert any("OpenAPI schema patching failed" in r.message for r in caplog.records)
