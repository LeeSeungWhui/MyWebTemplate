"""
파일: backend/lib/OpenAPI.py
작성: LSH
갱신: 2025-09-07
설명: FastAPI OpenAPI 스키마 커스터마이저 부착(보안 스키마/표준 응답/CSRF/servers/codeSamples 등).
"""

from __future__ import annotations

import os
from typing import Any, Dict

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from lib.Logger import logger


def attachOpenAPI(app: FastAPI, config) -> None:
    """
    이름: attachOpenAPI
    설명: 주어진 app에 custom openapi 함수 부착. config는 [AUTH]/기타 값을 제공.
    """

    def _patch_openapi(schema: Dict[str, Any]) -> Dict[str, Any]:
        try:
            components = schema.setdefault("components", {})
            security_schemes = components.setdefault("securitySchemes", {})
            session_cookie = config["AUTH"].get("session_cookie", "sid")
            security_schemes.update(
                {
                    "cookieAuth": {
                        "type": "apiKey",
                        "in": "cookie",
                        "name": session_cookie,
                    },
                    "bearerAuth": {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"},
                }
            )

            schemas = components.setdefault("schemas", {})
            if "StandardResponse" not in schemas:
                schemas["StandardResponse"] = {
                    "type": "object",
                    "properties": {
                        "status": {"type": "boolean"},
                        "message": {"type": "string"},
                        "result": {},
                        "count": {"type": "integer"},
                        "code": {"type": "string"},
                        "requestId": {"type": "string"},
                    },
                    "required": ["status", "message", "result", "requestId"],
                }
            if "ErrorResponse" not in schemas:
                schemas["ErrorResponse"] = schemas["StandardResponse"]

            params = components.setdefault("parameters", {})
            csrf_header_name = config["AUTH"].get("csrf_header", "X-CSRF-Token")
            params["CSRFToken"] = {
                "name": csrf_header_name,
                "in": "header",
                "required": False,
                "schema": {"type": "string"},
                "description": "CSRF token header for cookie-mode unsafe requests.",
            }

            # Resolve server URLs from config
            def _resolve_servers():
                urls = []
                try:
                    server_section = config["SERVER"]
                except Exception:
                    server_section = None
                # Optional: comma-separated list in [SERVER].servers
                if server_section is not None:
                    raw = (server_section.get("servers") or "").strip()
                    if raw:
                        for u in [x.strip() for x in raw.split(",") if x.strip()]:
                            if u not in urls:
                                urls.append(u)
                    # Fallback to backendHost if provided
                    bh = (
                        server_section.get("backendHost")
                        or server_section.get("base_url")
                        or server_section.get("host")
                    )
                    if bh and bh not in urls:
                        urls.insert(0, bh)
                if not urls:
                    urls = ["http://localhost:2000"]
                return [{"url": u} for u in urls]

            schema["servers"] = _resolve_servers()

            tags = sorted({tag for tag in (t.get("name") for t in schema.get("tags", [])) if tag})
            if tags:
                schema["x-tagGroups"] = [{"name": "default", "tags": tags}]

            paths = schema.get("paths", {})
            sess = paths.get("/api/v1/auth/session", {}).get("get")
            if isinstance(sess, dict):
                sess["security"] = [{"cookieAuth": []}, {"bearerAuth": []}]
            login = paths.get("/api/v1/auth/login", {}).get("post")
            if isinstance(login, dict):
                responses = login.setdefault("responses", {})
                res204 = responses.setdefault("204", {"description": "No Content"})
                headers = res204.setdefault("headers", {})
                headers["Set-Cookie"] = {
                    "description": "Session cookie is set on success.",
                    "schema": {"type": "string"},
                }
                login.setdefault("x-codeSamples", []).append(
                    {
                        "lang": "JavaScript",
                        "label": "openapi-client-axios",
                        "source": "// Example using openapi-client-axios\n// const client = ...;\n// await client.POST('/api/v1/auth/login', { body: { username: 'demo', password: 'password123' } });",
                    }
                )
            logout = paths.get("/api/v1/auth/logout", {}).get("post")
            if isinstance(logout, dict):
                logout.setdefault("parameters", []).append({"$ref": "#/components/parameters/CSRFToken"})

            # Generalize CSRF parameter to all unsafe methods
            csrf_ref = {"$ref": "#/components/parameters/CSRFToken"}
            unsafe_methods = ("post", "put", "patch", "delete")
            for _p, ops in paths.items():
                if not isinstance(ops, dict):
                    continue
                for m in unsafe_methods:
                    op = ops.get(m)
                    if not isinstance(op, dict):
                        continue
                    params = op.setdefault("parameters", [])
                    if not any(isinstance(p, dict) and p.get("$ref") == csrf_ref["$ref"] for p in params):
                        params.append(dict(csrf_ref))
        except Exception as e:
            logger.error(f"OpenAPI schema patching failed: {e}")
        return schema

    def custom_openapi():
        if app.openapi_schema:
            return app.openapi_schema
        openapi_schema = get_openapi(
            title="MyWebTemplate API",
            version=os.getenv("APP_VERSION", "dev"),
            description="API for Web/App backend.",
            routes=app.routes,
        )
        app.openapi_schema = _patch_openapi(openapi_schema)
        return app.openapi_schema

    app.openapi = custom_openapi  # type: ignore
