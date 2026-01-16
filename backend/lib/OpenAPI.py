"""
파일: backend/lib/OpenAPI.py
작성: LSH
갱신: 2025-09-07
설명: FastAPI OpenAPI 스키마 커스터마이저 부착(보안 스키마/표준 응답/CSRF/servers/codeSamples 등).
"""

from __future__ import annotations

import os
from typing import Any, Dict, Optional

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from lib.Logger import logger


def attachOpenAPI(app: FastAPI, config) -> None:
    """
    이름: attachOpenAPI
    설명: 주어진 app에 custom openapi 함수 부착. config는 [AUTH]/기타 값을 제공.
    """

    def readConfigValue(section: Optional[object], key: str, fallback: Optional[str] = None) -> Optional[str]:
        """
        configparser.SectionProxy / dict 모두에서 안전하게 값을 읽는다.
        """
        if section is None:
            return fallback
        getter = getattr(section, "get", None)
        if not callable(getter):
            return fallback
        try:
            # configparser.SectionProxy는 fallback 키워드를 지원한다.
            return getter(key, fallback=fallback)  # type: ignore[misc]
        except TypeError:
            # dict.get은 fallback 키워드를 지원하지 않는다.
            try:
                return getter(key, fallback)  # type: ignore[misc]
            except Exception:
                return fallback
        except Exception:
            return fallback

    def patchOpenapi(schema: Dict[str, Any]) -> Dict[str, Any]:
        try:
            authSection = None
            try:
                authSection = config["AUTH"]
            except Exception:
                authSection = None

            accessCookie = (
                readConfigValue(authSection, "access_cookie")
                or readConfigValue(authSection, "session_cookie")
                or "access_token"
            )
            refreshCookie = readConfigValue(authSection, "refresh_cookie") or "refresh_token"

            components = schema.setdefault("components", {})
            securitySchemes = components.setdefault("securitySchemes", {})
            securitySchemes.update(
                {
                    "cookieAuth": {
                        "type": "apiKey",
                        "in": "cookie",
                        "name": accessCookie,
                        "description": (
                            "Browser clients may send this HttpOnly cookie to the Web BFF, "
                            "which forwards it as `Authorization: Bearer <token>` to the backend."
                        ),
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
                schemas["ErrorResponse"] = dict(schemas["StandardResponse"])

            if "AuthTokenResult" not in schemas:
                schemas["AuthTokenResult"] = {
                    "type": "object",
                    "properties": {
                        "accessToken": {"type": "string"},
                        "tokenType": {"type": "string", "example": "bearer"},
                        "expiresIn": {"type": "integer", "example": 3600},
                        "refreshExpiresIn": {"type": "integer", "example": 604800},
                    },
                    "required": ["accessToken", "tokenType", "expiresIn", "refreshExpiresIn"],
                }
            if "AuthTokenResponse" not in schemas:
                schemas["AuthTokenResponse"] = {
                    "allOf": [
                        {"$ref": "#/components/schemas/StandardResponse"},
                        {
                            "type": "object",
                            "properties": {"result": {"$ref": "#/components/schemas/AuthTokenResult"}},
                        },
                    ]
                }

            if "AuthMeResult" not in schemas:
                schemas["AuthMeResult"] = {
                    "type": "object",
                    "properties": {"username": {"type": "string"}},
                    "required": ["username"],
                }
            if "AuthMeResponse" not in schemas:
                schemas["AuthMeResponse"] = {
                    "allOf": [
                        {"$ref": "#/components/schemas/StandardResponse"},
                        {
                            "type": "object",
                            "properties": {"result": {"$ref": "#/components/schemas/AuthMeResult"}},
                        },
                    ]
                }

            params = components.setdefault("parameters", {})
            csrfHeaderName = readConfigValue(authSection, "csrf_header", "X-CSRF-Token")
            params["CSRFToken"] = {
                "name": csrfHeaderName,
                "in": "header",
                "required": False,
                "schema": {"type": "string"},
                "description": "CSRF token header for cookie-mode unsafe requests.",
            }

            # 설정값에서 서버 URL 목록을 구성
            def resolveServers():
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

            schema["servers"] = resolveServers()

            tags = sorted({tag for tag in (t.get("name") for t in schema.get("tags", [])) if tag})
            if tags:
                schema["x-tagGroups"] = [{"name": "default", "tags": tags}]

            paths = schema.get("paths", {})
            # 실제 구현은 /api/v1/auth/me 를 사용한다.
            me = paths.get("/api/v1/auth/me", {}).get("get")
            if isinstance(me, dict):
                # backend는 Bearer 토큰을 신뢰한다(Auth.getCurrentUser).
                me["security"] = [{"bearerAuth": []}, {"OAuth2PasswordBearer": []}]
                responses = me.setdefault("responses", {})
                res200 = responses.setdefault("200", {"description": "OK"})
                res200["description"] = res200.get("description") or "OK"
                res200.setdefault("content", {}).setdefault("application/json", {})["schema"] = {
                    "$ref": "#/components/schemas/AuthMeResponse"
                }

            login = paths.get("/api/v1/auth/login", {}).get("post")
            if isinstance(login, dict):
                responses = login.setdefault("responses", {})
                # NOTE: 실제 구현은 200 JSON(successResponse) + Set-Cookie 이다(AuthRouter.login).
                responses.pop("204", None)

                res200 = responses.setdefault("200", {"description": "OK"})
                res200["description"] = "OK (sets access/refresh cookies on success)"
                res200.setdefault("headers", {})["Set-Cookie"] = {
                    "description": f"Sets `{accessCookie}` and `{refreshCookie}` cookies on success.",
                    "schema": {"type": "string"},
                }
                res200.setdefault("content", {}).setdefault("application/json", {})["schema"] = {
                    "$ref": "#/components/schemas/AuthTokenResponse"
                }

                samples = login.setdefault("x-codeSamples", [])
                hasSample = any(
                    isinstance(sample, dict)
                    and sample.get("lang") == "JavaScript"
                    and sample.get("label") == "openapi-client-axios"
                    for sample in samples
                )
                if not hasSample:
                    samples.append(
                        {
                            "lang": "JavaScript",
                            "label": "openapi-client-axios",
                            "source": (
                                "// Example using openapi-client-axios\n"
                                "// const client = ...;\n"
                                "// await client.POST('/api/v1/auth/login', {\n"
                                "//   body: { username: 'demo@demo.demo', password: 'password123', rememberMe: false },\n"
                                "// });\n"
                                "// The backend responds 200 JSON and also sets HttpOnly cookies."
                            ),
                        }
                    )

            refresh = paths.get("/api/v1/auth/refresh", {}).get("post")
            if isinstance(refresh, dict):
                # Refresh는 refresh cookie로 새 토큰 발급 + Set-Cookie 를 반환한다.
                responses = refresh.setdefault("responses", {})
                res200 = responses.setdefault("200", {"description": "OK"})
                res200["description"] = "OK (rotates access/refresh cookies on success)"
                res200.setdefault("headers", {})["Set-Cookie"] = {
                    "description": f"Rotates `{accessCookie}` and `{refreshCookie}` cookies on success.",
                    "schema": {"type": "string"},
                }
                res200.setdefault("content", {}).setdefault("application/json", {})["schema"] = {
                    "$ref": "#/components/schemas/AuthTokenResponse"
                }

            logout = paths.get("/api/v1/auth/logout", {}).get("post")
            if isinstance(logout, dict):
                logout.setdefault("parameters", []).append({"$ref": "#/components/parameters/CSRFToken"})
                # 실제 구현은 204(No Content).
                responses = logout.setdefault("responses", {})
                responses.setdefault("204", {"description": "No Content"})
                responses.pop("200", None)

            # 비멱등 메서드 전체에 CSRF 파라미터를 공통으로 추가
            csrfRef = {"$ref": "#/components/parameters/CSRFToken"}
            unsafeMethods = ("post", "put", "patch", "delete")
            for ops in paths.values():
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
        app.openapi_schema = patchOpenapi(openapiSchema)
        return app.openapi_schema

    app.openapi = customOpenapi  # type: ignore
