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

    def _patchOpenapi(schema: Dict[str, Any]) -> Dict[str, Any]:
        try:
            components = schema.setdefault("components", {})
            securitySchemes = components.setdefault("securitySchemes", {})
            sessionCookie = config["AUTH"].get("session_cookie", "sid")
            securitySchemes.update(
                {
                    "cookieAuth": {
                        "type": "apiKey",
                        "in": "cookie",
                        "name": sessionCookie,
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
            csrfHeaderName = config["AUTH"].get("csrf_header", "X-CSRF-Token")
            params["CSRFToken"] = {
                "name": csrfHeaderName,
                "in": "header",
                "required": False,
                "schema": {"type": "string"},
                "description": "CSRF token header for cookie-mode unsafe requests.",
            }

            # 설정값에서 서버 URL 목록을 구성
            def _resolveServers():
                urls = []
                try:
                    serverSection = config["SERVER"]
                except Exception:
                    serverSection = None
                # [SERVER].servers 콤마 리스트가 있으면 우선 사용
                if serverSection is not None:
                    raw = (serverSection.get("servers") or "").strip()
                    if raw:
                        for u in [x.strip() for x in raw.split(",") if x.strip()]:
                            if u not in urls:
                                urls.append(u)
                    # backendHost/base_url/host 값이 있으면 보조로 삽입
                    bh = (
                        serverSection.get("backendHost")
                        or serverSection.get("base_url")
                        or serverSection.get("host")
                    )
                    if bh and bh not in urls:
                        urls.insert(0, bh)
                if not urls:
                    urls = ["http://localhost:2000"]
                return [{"url": u} for u in urls]

            schema["servers"] = _resolveServers()

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
                        "source": (
                            "// Example using openapi-client-axios\n"
                            "// const client = ...;\n"
                            "// await client.POST('/api/v1/auth/login', { body: { username: 'demo', password: 'password123' } });"
                        ),
                    }
                )
            logout = paths.get("/api/v1/auth/logout", {}).get("post")
            if isinstance(logout, dict):
                logout.setdefault("parameters", []).append({"$ref": "#/components/parameters/CSRFToken"})

            # 비멱등 메서드 전체에 CSRF 파라미터를 공통으로 추가
            csrfRef = {"$ref": "#/components/parameters/CSRFToken"}
            unsafeMethods = ("post", "put", "patch", "delete")
            for _pathKey, ops in paths.items():
                if not isinstance(ops, dict):
                    continue
                for methodName in unsafeMethods:
                    op = ops.get(methodName)
                    if not isinstance(op, dict):
                        continue
                    params = op.setdefault("parameters", [])
                    if not any(isinstance(param, dict) and param.get("$ref") == csrfRef["$ref"] for param in params):
                        params.append(dict(csrfRef))
        except Exception as e:
            logger.error(f"OpenAPI schema patching failed: {e}")
        return schema

    def customOpenapi():
        if app.openapi_schema:
            return app.openapi_schema
        openapiSchema = get_openapi(
            title="MyWebTemplate API",
            version=os.getenv("APP_VERSION", "dev"),
            description="API for Web/App backend.",
            routes=app.routes,
        )
        app.openapi_schema = _patchOpenapi(openapiSchema)
        return app.openapi_schema

    app.openapi = customOpenapi  # type: ignore
