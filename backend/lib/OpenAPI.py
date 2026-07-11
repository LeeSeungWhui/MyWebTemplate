"""
파일명: backend/lib/OpenAPI.py
작성자: LSH
갱신일: 2025-09-07
설명: FastAPI OpenAPI 스키마 커스터마이저 부착(보안 스키마/표준 응답/CSRF/servers/codeSamples 등)
"""

from __future__ import annotations

import os
from typing import Any, Dict, Optional

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from lib.Logger import logger
from lib.OpenAPIHelpers import (
    buildStandardErrorResponses,
    ensureErrorResponseRef,
    ensureHeaderRef,
    ensureJavaScriptCodeSample,
    ensureNoStoreResponse,
    isOpenapiPatchStrictEnabled,
    resolveServersFromConfig,
    schemaRef,
)
from service.DashboardService import DASHBOARD_STATUS_ORDER, ALLOWED_SORT_ORDER
from service.SampleService import (
    SAMPLE_ADMIN_ROLE_ORDER,
    SAMPLE_ADMIN_STATUS_ORDER,
    SAMPLE_TASK_STATUS_ORDER,
)


def attachOpenAPI(app: FastAPI, config) -> None:
    """
    이름: attachOpenAPI
    설명: 주어진 app에 custom openapi 함수 부착. config는 [AUTH]/기타 값 제공
    갱신일: 2026-02-24
    """

    def readConfigValue(section: Optional[object], key: str, fallback: Optional[str] = None) -> Optional[str]:
        """
        설명: configparser 섹션에서 설정 값을 안전 조회
        처리 규칙: 섹션/키 조회 실패 시 fallback을 반환
        반환값: 설정 문자열 또는 fallback 값을 반환
        갱신일: 2026-02-26
        """
        if section is None:
            return fallback
        getter = getattr(section, "get", None)
        if not callable(getter):
            return fallback
        try:
            return getter(key, fallback=fallback)  # type: ignore[misc]
        except Exception:
            return fallback

    def patchOpenapi(schema: Dict[str, Any]) -> Dict[str, Any]:
        """
        설명: OpenAPI 스키마에 보안/응답/파라미터/코드샘플 정책 패치
        처리 규칙: components/paths를 보강하되 예외 발생 시 로그만 남기고 원본 schema를 반환
        반환값: 패치가 적용된 OpenAPI schema dict를 반환
        갱신일: 2026-02-26
        """
        try:
            authSection = None
            try:
                authSection = config["AUTH"]
            except Exception:
                authSection = None

            accessCookie = (
                readConfigValue(authSection, "access_cookie")
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
                schemas["ErrorResponse"] = {
                    "type": "object",
                    "properties": {
                        "status": {"type": "boolean", "const": False, "example": False},
                        "message": {"type": "string", "example": "invalid input"},
                        "result": {
                            "anyOf": [
                                {"type": "object", "additionalProperties": True},
                                {"type": "array", "items": {}},
                                {"type": "string"},
                                {"type": "number"},
                                {"type": "integer"},
                                {"type": "boolean"},
                                {"type": "null"},
                            ],
                            "example": None,
                        },
                        "code": {"type": "string", "example": "AUTH_422_INVALID_INPUT"},
                        "requestId": {"type": "string", "example": "req-demo"},
                    },
                    "required": ["status", "message", "code", "requestId"],
                    "additionalProperties": False,
                }

            if "AuthWebSessionResult" not in schemas:
                schemas["AuthWebSessionResult"] = {
                    "type": "object",
                    "properties": {
                        "tokenType": {"type": "string", "example": "cookie"},
                        "expiresIn": {"type": "integer", "example": 3600},
                        "refreshExpiresIn": {"type": "integer", "example": 604800},
                    },
                    "required": ["tokenType", "expiresIn", "refreshExpiresIn"],
                }
            if "AuthWebSessionResponse" not in schemas:
                schemas["AuthWebSessionResponse"] = {
                    "allOf": [
                        {"$ref": "#/components/schemas/StandardResponse"},
                        {
                            "type": "object",
                            "properties": {"result": {"$ref": "#/components/schemas/AuthWebSessionResult"}},
                        },
                    ]
                }
            if "AuthLoginRequest" not in schemas:
                schemas["AuthLoginRequest"] = {
                    "type": "object",
                    "properties": {
                        "username": {"type": "string", "example": "demo@demo.demo"},
                        "password": {"type": "string", "example": "password123"},
                        "rememberMe": {
                            "type": "boolean",
                            "example": False,
                            "description": (
                                "Optional remember-me flag. Send JSON boolean true to persist the refresh token; "
                                "runtime treats non-boolean values as false."
                            ),
                        },
                    },
                    "required": ["username", "password"],
                    "additionalProperties": False,
                }
            if "AuthSignupRequest" not in schemas:
                schemas["AuthSignupRequest"] = {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string", "example": "Demo User"},
                        "email": {"type": "string", "format": "email", "example": "demo@demo.demo"},
                        "password": {"type": "string", "example": "password123"},
                    },
                    "required": ["name", "email", "password"],
                    "additionalProperties": False,
                }
            if "AuthSignupResult" not in schemas:
                schemas["AuthSignupResult"] = {
                    "type": "object",
                    "properties": {
                        "userId": {"type": "string", "format": "email", "example": "demo@demo.demo"},
                        "userNm": {"type": "string", "example": "Demo User"},
                    },
                    "required": ["userId", "userNm"],
                }
            if "AuthSignupResponse" not in schemas:
                schemas["AuthSignupResponse"] = {
                    "allOf": [
                        {"$ref": "#/components/schemas/StandardResponse"},
                        {
                            "type": "object",
                            "properties": {"result": {"$ref": "#/components/schemas/AuthSignupResult"}},
                        },
                    ]
                }

            if "AuthAppTokenResult" not in schemas:
                schemas["AuthAppTokenResult"] = {
                    "type": "object",
                    "properties": {
                        "accessToken": {"type": "string"},
                        "refreshToken": {"type": "string"},
                        "tokenType": {"type": "string", "example": "bearer"},
                        "expiresIn": {"type": "integer", "example": 3600},
                        "refreshExpiresIn": {"type": "integer", "example": 604800},
                    },
                    "required": ["accessToken", "refreshToken", "tokenType", "expiresIn", "refreshExpiresIn"],
                }
            if "AuthAppTokenResponse" not in schemas:
                schemas["AuthAppTokenResponse"] = {
                    "allOf": [
                        {"$ref": "#/components/schemas/StandardResponse"},
                        {
                            "type": "object",
                            "properties": {"result": {"$ref": "#/components/schemas/AuthAppTokenResult"}},
                        },
                    ]
                }
            if "AuthAppLoginRequest" not in schemas:
                schemas["AuthAppLoginRequest"] = dict(schemas["AuthLoginRequest"])
            if "AuthAppRefreshRequest" not in schemas:
                schemas["AuthAppRefreshRequest"] = {
                    "type": "object",
                    "properties": {
                        "refreshToken": {"type": "string", "example": "<refresh-token>"},
                    },
                    "required": ["refreshToken"],
                    "additionalProperties": False,
                }
            if "AuthAppLogoutRequest" not in schemas:
                schemas["AuthAppLogoutRequest"] = {
                    "type": "object",
                    "properties": {
                        "refreshToken": {"type": "string", "example": "<refresh-token>"},
                    },
                    "additionalProperties": False,
                    "description": "Optional JSON body for explicit refresh-token revoke. Empty body is also accepted.",
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

            if "PasswordResetRequestResult" not in schemas:
                schemas["PasswordResetRequestResult"] = {
                    "type": "object",
                    "properties": {
                        "accepted": {"type": "boolean", "example": True},
                    },
                    "required": ["accepted"],
                    "description": "Password reset request acceptance result. Account existence is not disclosed.",
                }
            if "PasswordResetRequestResponse" not in schemas:
                schemas["PasswordResetRequestResponse"] = {
                    "allOf": [
                        {"$ref": "#/components/schemas/StandardResponse"},
                        {
                            "type": "object",
                            "properties": {"result": {"$ref": "#/components/schemas/PasswordResetRequestResult"}},
                        },
                    ]
                }
            if "PasswordResetRequest" not in schemas:
                schemas["PasswordResetRequest"] = {
                    "type": "object",
                    "properties": {
                        "email": {"type": "string", "format": "email", "example": "demo@demo.demo"},
                    },
                    "required": ["email"],
                    "additionalProperties": False,
                }

            if "HealthzResult" not in schemas:
                schemas["HealthzResult"] = {
                    "type": "object",
                    "properties": {
                        "ok": {"type": "boolean", "example": True},
                        "version": {"type": "string", "example": "dev"},
                        "gitSha": {"type": "string", "example": "unknown"},
                        "startedAt": {"type": "string", "format": "date-time"},
                        "uptimeSeconds": {"type": "integer", "minimum": 0},
                    },
                    "required": ["ok", "version", "gitSha", "startedAt", "uptimeSeconds"],
                }
            if "HealthzResponse" not in schemas:
                schemas["HealthzResponse"] = {
                    "allOf": [
                        {"$ref": "#/components/schemas/StandardResponse"},
                        {
                            "type": "object",
                            "properties": {"result": {"$ref": "#/components/schemas/HealthzResult"}},
                        },
                    ]
                }

            if "ReadyzResult" not in schemas:
                schemas["ReadyzResult"] = {
                    "type": "object",
                    "properties": {
                        "ok": {"type": "boolean"},
                        "db": {"type": "string", "enum": ["up", "down", "skipped"]},
                        "dbTimeoutMs": {"type": "integer", "minimum": 1},
                        "dbTargets": {"type": "array", "items": {"type": "string"}},
                        "dbLatencyMs": {"type": "integer", "minimum": 0},
                    },
                    "required": ["ok"],
                    "description": "Readiness payload. DB fields are omitted when maintenance mode short-circuits checks.",
                }
            if "ReadyzResponse" not in schemas:
                schemas["ReadyzResponse"] = {
                    "allOf": [
                        {"$ref": "#/components/schemas/StandardResponse"},
                        {
                            "type": "object",
                            "properties": {"result": {"$ref": "#/components/schemas/ReadyzResult"}},
                        },
                    ]
                }
            if "ReadyzErrorResponse" not in schemas:
                schemas["ReadyzErrorResponse"] = dict(schemas["ReadyzResponse"])

            nullableStringSchema = {"anyOf": [{"type": "string"}, {"type": "null"}]}
            if "ProfileMeResult" not in schemas:
                schemas["ProfileMeResult"] = {
                    "type": "object",
                    "properties": {
                        "userNo": {"type": "integer", "example": 1},
                        "userId": {"type": "string", "example": "demo@demo.demo"},
                        "userNm": nullableStringSchema,
                        "userEml": nullableStringSchema,
                        "roleCd": nullableStringSchema,
                        "notifyEmail": {"type": "boolean", "example": True},
                        "notifySms": {"type": "boolean", "example": False},
                        "notifyPush": {"type": "boolean", "example": True},
                    },
                    "required": [
                        "userNo",
                        "userId",
                        "userNm",
                        "userEml",
                        "roleCd",
                        "notifyEmail",
                        "notifySms",
                        "notifyPush",
                    ],
                    "description": "Authenticated user's profile plus notification preferences.",
                }
            if "ProfileUpdateRequest" not in schemas:
                schemas["ProfileUpdateRequest"] = {
                    "type": "object",
                    "properties": {
                        "userNm": {
                            "type": "string",
                            "minLength": 2,
                            "maxLength": 80,
                            "example": "Demo Profile",
                        },
                        "notifyEmail": {"type": "boolean", "example": True},
                        "notifySms": {"type": "boolean", "example": False},
                        "notifyPush": {"type": "boolean", "example": True},
                    },
                    "anyOf": [
                        {"required": ["userNm"]},
                        {"required": ["notifyEmail"]},
                        {"required": ["notifySms"]},
                        {"required": ["notifyPush"]},
                    ],
                    "additionalProperties": False,
                    "description": "At least one profile or notification field must be provided.",
                }
            if "ProfileMeResponse" not in schemas:
                schemas["ProfileMeResponse"] = {
                    "allOf": [
                        {"$ref": "#/components/schemas/StandardResponse"},
                        {
                            "type": "object",
                            "properties": {"result": {"$ref": "#/components/schemas/ProfileMeResult"}},
                        },
                    ]
                }
            if "ProfileUpdateResponse" not in schemas:
                schemas["ProfileUpdateResponse"] = {
                    "allOf": [
                        {"$ref": "#/components/schemas/StandardResponse"},
                        {
                            "type": "object",
                            "properties": {"result": {"$ref": "#/components/schemas/ProfileMeResult"}},
                        },
                    ]
                }

            dashboardStatusSchema = {
                "type": "string",
                "enum": list(DASHBOARD_STATUS_ORDER),
                "example": DASHBOARD_STATUS_ORDER[0],
            }
            dashboardTagsSchema = {
                "anyOf": [
                    {"type": "string", "example": "[\"qa\"]"},
                    {"type": "array", "items": {"type": "string"}, "example": ["qa"]},
                ]
            }
            if "DashboardItem" not in schemas:
                schemas["DashboardItem"] = {
                    "type": "object",
                    "properties": {
                        "id": {"type": "integer", "example": 1},
                        "title": {"type": "string", "example": "테스트 업무"},
                        "description": {"type": "string", "example": "REST 경로 검증"},
                        "status": dashboardStatusSchema,
                        "amount": {"type": "number", "example": 1000},
                        "tags": dashboardTagsSchema,
                        "createdAt": nullableStringSchema,
                    },
                    "required": ["id", "title", "description", "status", "amount", "tags", "createdAt"],
                    "description": "Dashboard work item owned by the authenticated user.",
                }
            if "DashboardListMeta" not in schemas:
                schemas["DashboardListMeta"] = {
                    "type": "object",
                    "properties": {
                        "page": {"type": "integer", "minimum": 1, "example": 1},
                        "size": {"type": "integer", "minimum": 1, "maximum": 500, "example": 20},
                        "sort": {
                            "type": "string",
                            "enum": list(ALLOWED_SORT_ORDER),
                            "example": ALLOWED_SORT_ORDER[0],
                        },
                        "q": {"type": "string", "example": "테스트"},
                        "status": {"type": "string", "example": "ready"},
                        "totalCount": {"type": "integer", "minimum": 0, "example": 1},
                    },
                    "required": ["page", "size", "sort", "q", "status", "totalCount"],
                }
            if "DashboardListResult" not in schemas:
                schemas["DashboardListResult"] = {
                    "type": "object",
                    "properties": {
                        "dataTemplateList": {
                            "type": "array",
                            "items": {"$ref": "#/components/schemas/DashboardItem"},
                        },
                        "listMetaObj": {"$ref": "#/components/schemas/DashboardListMeta"},
                    },
                    "required": ["dataTemplateList", "listMetaObj"],
                }
            if "DashboardStatsItem" not in schemas:
                schemas["DashboardStatsItem"] = {
                    "type": "object",
                    "properties": {
                        "status": dashboardStatusSchema,
                        "count": {"type": "integer", "minimum": 0, "example": 1},
                        "amountSum": {"type": "number", "example": 1000},
                    },
                    "required": ["status", "count", "amountSum"],
                }
            if "DashboardStatsResult" not in schemas:
                schemas["DashboardStatsResult"] = {
                    "type": "object",
                    "properties": {
                        "totalCount": {"type": "integer", "minimum": 0, "example": 2},
                        "totalAmount": {"type": "number", "example": 3000},
                        "statusSummaryList": {
                            "type": "array",
                            "items": {"$ref": "#/components/schemas/DashboardStatsItem"},
                        },
                    },
                    "required": ["totalCount", "totalAmount", "statusSummaryList"],
                }
            if "DashboardWriteRequest" not in schemas:
                schemas["DashboardWriteRequest"] = {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string", "minLength": 1, "maxLength": 200, "example": "신규 업무"},
                        "description": {"type": "string", "example": "CRUD 생성 테스트"},
                        "status": dashboardStatusSchema,
                        "amount": {"type": "number", "example": 32100},
                        "tags": dashboardTagsSchema,
                    },
                    "required": ["title", "status"],
                    "additionalProperties": False,
                }
            if "DashboardPatchRequest" not in schemas:
                schemas["DashboardPatchRequest"] = {
                    "type": "object",
                    "properties": schemas["DashboardWriteRequest"]["properties"],
                    "anyOf": [
                        {"required": ["title"]},
                        {"required": ["description"]},
                        {"required": ["status"]},
                        {"required": ["amount"]},
                        {"required": ["tags"]},
                    ],
                    "additionalProperties": False,
                }
            if "DashboardDeleteResult" not in schemas:
                schemas["DashboardDeleteResult"] = {
                    "type": "object",
                    "properties": {"id": {"type": "integer", "example": 1}},
                    "required": ["id"],
                }
            dashboardResponseMap = {
                "DashboardListResponse": "DashboardListResult",
                "DashboardStatsResponse": "DashboardStatsResult",
                "DashboardItemResponse": "DashboardItem",
                "DashboardCreateResponse": "DashboardItem",
                "DashboardUpdateResponse": "DashboardItem",
                "DashboardDeleteResponse": "DashboardDeleteResult",
            }
            for responseName, resultName in dashboardResponseMap.items():
                if responseName not in schemas:
                    schemas[responseName] = {
                        "allOf": [
                            {"$ref": "#/components/schemas/StandardResponse"},
                            {
                                "type": "object",
                                "properties": {"result": {"$ref": f"#/components/schemas/{resultName}"}},
                            },
                        ]
                    }

            sampleTaskStatusSchema = {
                "type": "string",
                "enum": list(SAMPLE_TASK_STATUS_ORDER),
                "example": SAMPLE_TASK_STATUS_ORDER[0],
            }
            sampleAdminRoleSchema = {
                "type": "string",
                "enum": list(SAMPLE_ADMIN_ROLE_ORDER),
                "example": SAMPLE_ADMIN_ROLE_ORDER[1],
            }
            sampleAdminStatusSchema = {
                "type": "string",
                "enum": list(SAMPLE_ADMIN_STATUS_ORDER),
                "example": SAMPLE_ADMIN_STATUS_ORDER[0],
            }
            if "SampleOverviewResult" not in schemas:
                schemas["SampleOverviewResult"] = {
                    "type": "object",
                    "properties": {
                        "taskCount": {"type": "integer", "minimum": 0, "example": 3},
                        "adminUserCount": {"type": "integer", "minimum": 0, "example": 3},
                        "formSubmissionCount": {"type": "integer", "minimum": 0, "example": 1},
                    },
                    "required": ["taskCount", "adminUserCount", "formSubmissionCount"],
                }
            if "SampleDashboardSummaryItem" not in schemas:
                schemas["SampleDashboardSummaryItem"] = {
                    "type": "object",
                    "properties": {
                        "status": sampleTaskStatusSchema,
                        "count": {"type": "integer", "minimum": 0, "example": 1},
                        "amountSum": {"type": "number", "example": 210000},
                    },
                    "required": ["status", "count", "amountSum"],
                }
            if "SampleDashboardTrendItem" not in schemas:
                schemas["SampleDashboardTrendItem"] = {
                    "type": "object",
                    "properties": {
                        "label": {"type": "string", "example": "3월"},
                        "count": {"type": "integer", "minimum": 0, "example": 2},
                        "amount": {"type": "number", "example": 430000},
                    },
                    "required": ["label", "count", "amount"],
                }
            if "SampleTaskItem" not in schemas:
                schemas["SampleTaskItem"] = {
                    "type": "object",
                    "properties": {
                        "id": {"type": "integer", "example": 1},
                        "title": {"type": "string", "example": "공개 샘플 신규 업무"},
                        "description": {"type": "string", "example": "DB 연동 CRUD 검증"},
                        "owner": {"type": "string", "example": "테스트"},
                        "status": sampleTaskStatusSchema,
                        "amount": {"type": "number", "example": 210000},
                        "attachmentName": {"type": "string", "example": "sample.md"},
                        "createdAt": nullableStringSchema,
                    },
                    "required": ["id", "title", "description", "owner", "status", "amount", "attachmentName", "createdAt"],
                }
            if "SampleDashboardResult" not in schemas:
                schemas["SampleDashboardResult"] = {
                    "type": "object",
                    "properties": {
                        "statusSummaryList": {
                            "type": "array",
                            "items": {"$ref": "#/components/schemas/SampleDashboardSummaryItem"},
                        },
                        "trendList": {
                            "type": "array",
                            "items": {"$ref": "#/components/schemas/SampleDashboardTrendItem"},
                        },
                        "recentList": {
                            "type": "array",
                            "items": {"$ref": "#/components/schemas/SampleTaskItem"},
                        },
                    },
                    "required": ["statusSummaryList", "trendList", "recentList"],
                }
            if "SampleTaskListMeta" not in schemas:
                schemas["SampleTaskListMeta"] = {
                    "type": "object",
                    "properties": {
                        "page": {"type": "integer", "minimum": 1, "example": 1},
                        "size": {"type": "integer", "minimum": 1, "maximum": 500, "example": 20},
                        "q": {"type": "string", "example": "샘플"},
                        "status": {"type": "string", "example": "running"},
                        "fromDate": {"type": "string", "example": "2026-03-01"},
                        "toDate": {"type": "string", "example": "2026-03-31"},
                        "totalCount": {"type": "integer", "minimum": 0, "example": 3},
                    },
                    "required": ["page", "size", "q", "status", "fromDate", "toDate", "totalCount"],
                }
            if "SampleTaskListResult" not in schemas:
                schemas["SampleTaskListResult"] = {
                    "type": "object",
                    "properties": {
                        "sampleTaskList": {
                            "type": "array",
                            "items": {"$ref": "#/components/schemas/SampleTaskItem"},
                        },
                        "listMetaObj": {"$ref": "#/components/schemas/SampleTaskListMeta"},
                    },
                    "required": ["sampleTaskList", "listMetaObj"],
                }
            if "SampleTaskWriteRequest" not in schemas:
                schemas["SampleTaskWriteRequest"] = {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string", "example": "공개 샘플 신규 업무"},
                        "status": sampleTaskStatusSchema,
                        "description": {"type": "string", "example": "DB 연동 CRUD 검증"},
                        "owner": {"type": "string", "example": "테스트"},
                        "amount": {"type": "number", "example": 210000},
                        "attachmentName": {"type": "string", "example": "sample.md"},
                    },
                    "required": ["title", "status"],
                    "additionalProperties": False,
                }
            if "SampleTaskPatchRequest" not in schemas:
                schemas["SampleTaskPatchRequest"] = {
                    "type": "object",
                    "properties": dict(schemas["SampleTaskWriteRequest"]["properties"]),
                    "minProperties": 1,
                    "additionalProperties": False,
                }
            if "SampleTaskDeleteResult" not in schemas:
                schemas["SampleTaskDeleteResult"] = {
                    "type": "object",
                    "properties": {"id": {"type": "integer", "example": 1}},
                    "required": ["id"],
                }
            if "SampleFormSubmissionItem" not in schemas:
                schemas["SampleFormSubmissionItem"] = {
                    "type": "object",
                    "properties": {
                        "id": {"type": "integer", "example": 1},
                        "name": {"type": "string", "example": "홍길동"},
                        "email": {"type": "string", "format": "email", "example": "hong@example.com"},
                        "phone": {"type": "string", "example": "010-1234-5678"},
                        "category": {"type": "string", "example": "web"},
                        "startDate": {"type": "string", "example": "2026-03-01"},
                        "endDate": {"type": "string", "example": "2026-03-10"},
                        "budgetRange": {"type": "string", "example": "300만 ~ 500만"},
                        "requirement": {"type": "string", "example": "대시보드 고도화"},
                        "selectedFeatures": {"type": "array", "items": {"type": "string"}, "example": ["login", "chart"]},
                        "referenceUrl": {"type": "string", "example": "https://example.com/spec"},
                        "attachmentName": {"type": "string", "example": "brief.pdf"},
                        "createdAt": nullableStringSchema,
                    },
                    "required": [
                        "id",
                        "name",
                        "email",
                        "phone",
                        "category",
                        "startDate",
                        "endDate",
                        "budgetRange",
                        "requirement",
                        "selectedFeatures",
                        "referenceUrl",
                        "attachmentName",
                        "createdAt",
                    ],
                }
            if "SampleFormSubmissionSummary" not in schemas:
                schemas["SampleFormSubmissionSummary"] = {
                    "type": "object",
                    "properties": {
                        "id": {"type": "integer", "example": 1},
                        "category": {"type": "string", "example": "web"},
                        "selectedFeatures": {"type": "array", "items": {"type": "string"}, "example": ["login", "chart"]},
                        "createdAt": nullableStringSchema,
                    },
                    "required": ["id", "category", "selectedFeatures", "createdAt"],
                }
            if "SampleFormMetaResult" not in schemas:
                schemas["SampleFormMetaResult"] = {
                    "type": "object",
                    "properties": {
                        "categoryCodeList": {"type": "array", "items": {"type": "string"}, "example": ["web", "app"]},
                        "featureCodeList": {"type": "array", "items": {"type": "string"}, "example": ["login", "chart"]},
                        "submissionCount": {"type": "integer", "minimum": 0, "example": 1},
                        "latestSubmission": {
                            "anyOf": [
                                {"$ref": "#/components/schemas/SampleFormSubmissionSummary"},
                                {"type": "null"},
                            ]
                        },
                    },
                    "required": ["categoryCodeList", "featureCodeList", "submissionCount", "latestSubmission"],
                }
            if "SampleFormSubmitRequest" not in schemas:
                schemas["SampleFormSubmitRequest"] = {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string", "example": "홍길동"},
                        "email": {"type": "string", "format": "email", "example": "hong@example.com"},
                        "phone": {"type": "string", "example": "010-1234-5678"},
                        "category": {"type": "string", "example": "web"},
                        "startDate": {"type": "string", "example": "2026-03-01"},
                        "endDate": {"type": "string", "example": "2026-03-10"},
                        "budgetRange": {"type": "string", "example": "300만 ~ 500만"},
                        "requirement": {"type": "string", "example": "대시보드 고도화"},
                        "selectedFeatures": {"type": "array", "items": {"type": "string"}, "example": ["login", "chart"]},
                        "referenceUrl": {"type": "string", "example": "https://example.com/spec"},
                        "attachmentName": {"type": "string", "example": "brief.pdf"},
                    },
                    "required": ["name", "email", "phone", "category", "startDate", "endDate", "budgetRange"],
                    "additionalProperties": False,
                }
            if "SampleAdminUserItem" not in schemas:
                schemas["SampleAdminUserItem"] = {
                    "type": "object",
                    "properties": {
                        "id": {"type": "integer", "example": 1},
                        "name": {"type": "string", "example": "신규 운영자"},
                        "email": {"type": "string", "format": "email", "example": "new-admin@example.com"},
                        "role": sampleAdminRoleSchema,
                        "status": sampleAdminStatusSchema,
                        "notifyEmail": {"type": "boolean", "example": True},
                        "notifySms": {"type": "boolean", "example": False},
                        "notifyPush": {"type": "boolean", "example": True},
                        "profileImageUrl": {"type": "string", "example": "https://example.com/profile.png"},
                        "createdAt": nullableStringSchema,
                    },
                    "required": [
                        "id",
                        "name",
                        "email",
                        "role",
                        "status",
                        "notifyEmail",
                        "notifySms",
                        "notifyPush",
                        "profileImageUrl",
                        "createdAt",
                    ],
                }
            if "SampleAdminUserListMeta" not in schemas:
                schemas["SampleAdminUserListMeta"] = {
                    "type": "object",
                    "properties": {
                        "page": {"type": "integer", "minimum": 1, "example": 1},
                        "size": {"type": "integer", "minimum": 1, "maximum": 500, "example": 50},
                        "totalCount": {"type": "integer", "minimum": 0, "example": 3},
                    },
                    "required": ["page", "size", "totalCount"],
                }
            if "SampleAdminUserListResult" not in schemas:
                schemas["SampleAdminUserListResult"] = {
                    "type": "object",
                    "properties": {
                        "sampleAdminUserList": {
                            "type": "array",
                            "items": {"$ref": "#/components/schemas/SampleAdminUserItem"},
                        },
                        "listMetaObj": {"$ref": "#/components/schemas/SampleAdminUserListMeta"},
                    },
                    "required": ["sampleAdminUserList", "listMetaObj"],
                }
            if "SampleAdminUserWriteRequest" not in schemas:
                schemas["SampleAdminUserWriteRequest"] = {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string", "example": "신규 운영자"},
                        "email": {"type": "string", "format": "email", "example": "new-admin@example.com"},
                        "role": sampleAdminRoleSchema,
                        "status": sampleAdminStatusSchema,
                        "notifyEmail": {"type": "boolean", "example": True},
                        "notifySms": {"type": "boolean", "example": False},
                        "notifyPush": {"type": "boolean", "example": True},
                        "profileImageUrl": {"type": "string", "example": "https://example.com/profile.png"},
                    },
                    "required": ["name", "email", "role", "status"],
                    "additionalProperties": False,
                }
            if "SampleAdminUserPatchRequest" not in schemas:
                schemas["SampleAdminUserPatchRequest"] = {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string", "example": "수정 운영자"},
                        "role": sampleAdminRoleSchema,
                        "status": sampleAdminStatusSchema,
                        "notifyEmail": {"type": "boolean", "example": True},
                        "notifySms": {"type": "boolean", "example": False},
                        "notifyPush": {"type": "boolean", "example": True},
                        "profileImageUrl": {"type": "string", "example": "https://example.com/profile.png"},
                    },
                    "minProperties": 1,
                    "additionalProperties": False,
                }
            if "SampleAdminRolePermissionMap" not in schemas:
                schemas["SampleAdminRolePermissionMap"] = {
                    "type": "object",
                    "properties": {
                        "manageUser": {"type": "boolean", "example": True},
                        "editContent": {"type": "boolean", "example": True},
                        "changeSetting": {"type": "boolean", "example": True},
                        "viewLog": {"type": "boolean", "example": True},
                        "deleteData": {"type": "boolean", "example": False},
                    },
                    "required": ["manageUser", "editContent", "changeSetting", "viewLog", "deleteData"],
                }
            if "SampleAdminSystemSetting" not in schemas:
                schemas["SampleAdminSystemSetting"] = {
                    "type": "object",
                    "properties": {
                        "siteName": {"type": "string", "example": "Web Sample"},
                        "adminEmail": {"type": "string", "format": "email", "example": "admin@example.com"},
                        "maintenanceMode": {"type": "boolean", "example": False},
                        "sessionTimeout": {"type": "integer", "minimum": 1, "example": 60},
                        "maxUploadMb": {"type": "integer", "minimum": 1, "example": 30},
                    },
                    "required": ["siteName", "adminEmail", "maintenanceMode", "sessionTimeout", "maxUploadMb"],
                }
            if "SampleAdminSettingsResult" not in schemas:
                schemas["SampleAdminSettingsResult"] = {
                    "type": "object",
                    "properties": {
                        "systemSetting": {"$ref": "#/components/schemas/SampleAdminSystemSetting"},
                        "rolePermissionMap": {
                            "type": "object",
                            "properties": {
                                "admin": {"$ref": "#/components/schemas/SampleAdminRolePermissionMap"},
                                "editor": {"$ref": "#/components/schemas/SampleAdminRolePermissionMap"},
                                "user": {"$ref": "#/components/schemas/SampleAdminRolePermissionMap"},
                            },
                            "required": ["admin", "editor", "user"],
                        },
                    },
                    "required": ["systemSetting", "rolePermissionMap"],
                }
            if "SampleAdminSettingsUpdateRequest" not in schemas:
                schemas["SampleAdminSettingsUpdateRequest"] = {
                    "type": "object",
                    "properties": {
                        "siteName": {"type": "string", "example": "MyWebTemplate Sample"},
                        "adminEmail": {"type": "string", "format": "email", "example": "sample-admin@example.com"},
                        "sessionTimeout": {"type": "integer", "minimum": 1, "maximum": 1440, "example": 90},
                        "maxUploadMb": {"type": "integer", "minimum": 1, "maximum": 1000, "example": 50},
                        "maintenanceMode": {"type": "boolean", "example": True},
                    },
                    "required": ["siteName", "adminEmail", "sessionTimeout", "maxUploadMb"],
                    "additionalProperties": False,
                }
            sampleResponseMap = {
                "SampleOverviewResponse": "SampleOverviewResult",
                "SampleDashboardResponse": "SampleDashboardResult",
                "SampleTaskListResponse": "SampleTaskListResult",
                "SampleTaskDetailResponse": "SampleTaskItem",
                "SampleTaskCreateResponse": "SampleTaskItem",
                "SampleTaskUpdateResponse": "SampleTaskItem",
                "SampleTaskDeleteResponse": "SampleTaskDeleteResult",
                "SampleFormMetaResponse": "SampleFormMetaResult",
                "SampleFormSubmitResponse": "SampleFormSubmissionItem",
                "SampleAdminUserListResponse": "SampleAdminUserListResult",
                "SampleAdminUserCreateResponse": "SampleAdminUserItem",
                "SampleAdminUserUpdateResponse": "SampleAdminUserItem",
                "SampleAdminSettingsResponse": "SampleAdminSettingsResult",
                "SampleAdminSettingsUpdateResponse": "SampleAdminSettingsResult",
            }
            for responseName, resultName in sampleResponseMap.items():
                if responseName not in schemas:
                    schemas[responseName] = {
                        "allOf": [
                            {"$ref": "#/components/schemas/StandardResponse"},
                            {
                                "type": "object",
                                "properties": {"result": {"$ref": f"#/components/schemas/{resultName}"}},
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
            params["OriginHeader"] = {
                "name": "Origin",
                "in": "header",
                "required": False,
                "schema": {"type": "string"},
                "description": "Allowed origin for Web cookie-authorized endpoints (/api/v1/auth/refresh|logout).",
            }
            params["RefererHeader"] = {
                "name": "Referer",
                "in": "header",
                "required": False,
                "schema": {"type": "string"},
                "description": "Fallback header for Web cookie-authorized endpoint origin checks.",
            }
            params["IdempotencyKey"] = {
                "name": "Idempotency-Key",
                "in": "header",
                "required": False,
                "schema": {"type": "string", "minLength": 1, "maxLength": 128},
                "description": "Optional retry-safe idempotency key for create requests.",
            }
            responseComponents = components.setdefault("responses", {})
            for responseName, responseSchema in buildStandardErrorResponses().items():
                responseComponents.setdefault(responseName, responseSchema)

            schema["servers"] = resolveServersFromConfig(config)

            tags = sorted({tag for tag in (t.get("name") for t in schema.get("tags", [])) if tag})
            if tags:
                schema["x-tagGroups"] = [{"name": "default", "tags": tags}]

            paths = schema.get("paths", {})

            healthz = paths.get("/healthz", {}).get("get")
            if isinstance(healthz, dict):
                responses = healthz.setdefault("responses", {})
                res200 = responses.setdefault("200", {"description": "OK"})
                res200["description"] = "OK (process is alive)"
                res200.setdefault("content", {}).setdefault("application/json", {})["schema"] = schemaRef(
                    "HealthzResponse"
                )
                ensureJavaScriptCodeSample(
                    healthz,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.GET('/healthz');\n"
                        "// console.log(res.data.result.ok);"
                    ),
                )

            readyz = paths.get("/readyz", {}).get("get")
            if isinstance(readyz, dict):
                responses = readyz.setdefault("responses", {})
                res200 = responses.setdefault("200", {"description": "OK"})
                res200["description"] = "OK (service dependencies are ready)"
                res200.setdefault("content", {}).setdefault("application/json", {})["schema"] = schemaRef(
                    "ReadyzResponse"
                )
                res503 = responses.setdefault("503", {"description": "Service Unavailable"})
                res503["description"] = "Service Unavailable (maintenance mode or dependency check failed)"
                res503.setdefault("content", {}).setdefault("application/json", {})["schema"] = schemaRef(
                    "ReadyzErrorResponse"
                )
                ensureJavaScriptCodeSample(
                    readyz,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.GET('/readyz');\n"
                        "// console.log(res.data.result.ok);"
                    ),
                )

            # 실제 구현은 /api/v1/auth/me 를 사용한다.
            me = paths.get("/api/v1/auth/me", {}).get("get")
            if isinstance(me, dict):

                # backend는 Bearer 토큰을 신뢰한다(Auth.getCurrentUser).
                me["security"] = [{"bearerAuth": []}, {"OAuth2PasswordBearer": []}]
                responses = me.setdefault("responses", {})
                res200 = responses.setdefault("200", {"description": "OK"})
                res200["description"] = res200.get("description") or "OK"
                res200.setdefault("content", {}).setdefault("application/json", {})["schema"] = schemaRef(
                    "AuthMeResponse"
                )
                ensureErrorResponseRef(me, "401", "UnauthorizedErrorResponse")

            profileMeGet = paths.get("/api/v1/profile/me", {}).get("get")
            if isinstance(profileMeGet, dict):
                profileMeGet["security"] = [{"bearerAuth": []}, {"OAuth2PasswordBearer": []}]
                responses = profileMeGet.setdefault("responses", {})
                res200 = responses.setdefault("200", {"description": "OK"})
                res200["description"] = "OK (returns authenticated user's profile and notification settings)"
                res200.setdefault("headers", {})["Cache-Control"] = {
                    "description": "Profile responses are not cacheable.",
                    "schema": {"type": "string", "example": "no-store"},
                }
                res200.setdefault("content", {}).setdefault("application/json", {})["schema"] = {
                    "$ref": "#/components/schemas/ProfileMeResponse"
                }
                ensureErrorResponseRef(profileMeGet, "401", "UnauthorizedErrorResponse")
                ensureErrorResponseRef(profileMeGet, "404", "NotFoundErrorResponse")
                ensureErrorResponseRef(profileMeGet, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    profileMeGet,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.GET('/api/v1/profile/me');\n"
                        "// console.log(res.data.result.notifyEmail);"
                    ),
                )

            profileMePut = paths.get("/api/v1/profile/me", {}).get("put")
            if isinstance(profileMePut, dict):
                profileMePut["security"] = [{"bearerAuth": []}, {"OAuth2PasswordBearer": []}]
                profileMePut["requestBody"] = {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {"$ref": "#/components/schemas/ProfileUpdateRequest"},
                        }
                    },
                }
                responses = profileMePut.setdefault("responses", {})
                res200 = responses.setdefault("200", {"description": "OK"})
                res200["description"] = "OK (updates profile name and/or notification settings)"
                res200.setdefault("headers", {})["Cache-Control"] = {
                    "description": "Profile responses are not cacheable.",
                    "schema": {"type": "string", "example": "no-store"},
                }
                res200.setdefault("content", {}).setdefault("application/json", {})["schema"] = {
                    "$ref": "#/components/schemas/ProfileUpdateResponse"
                }
                ensureErrorResponseRef(profileMePut, "401", "UnauthorizedErrorResponse")
                ensureErrorResponseRef(profileMePut, "404", "NotFoundErrorResponse")
                ensureErrorResponseRef(profileMePut, "422", "ValidationErrorResponse")
                ensureErrorResponseRef(profileMePut, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    profileMePut,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.PUT('/api/v1/profile/me', {\n"
                        "//   body: { userNm: 'Demo Profile', notifyEmail: true, notifySms: false, notifyPush: true },\n"
                        "// });\n"
                        "// console.log(res.data.result.userNm);"
                    ),
                )

            dashboardList = paths.get("/api/v1/dashboard", {}).get("get")
            if isinstance(dashboardList, dict):
                dashboardList["security"] = [{"bearerAuth": []}, {"OAuth2PasswordBearer": []}]
                responses = dashboardList.setdefault("responses", {})
                ensureNoStoreResponse(
                    responses.setdefault("200", {"description": "OK"}),
                    "OK (returns authenticated user's dashboard items with list metadata)",
                    "DashboardListResponse",
                )
                ensureErrorResponseRef(dashboardList, "401", "UnauthorizedErrorResponse")
                ensureErrorResponseRef(dashboardList, "422", "ValidationErrorResponse")
                ensureErrorResponseRef(dashboardList, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    dashboardList,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.GET('/api/v1/dashboard', {\n"
                        "//   params: { query: { page: 1, size: 20, status: 'ready', sort: 'reg_dt_desc' } },\n"
                        "// });\n"
                        "// console.log(res.data.result.dataTemplateList);"
                    ),
                )

            dashboardStats = paths.get("/api/v1/dashboard/stats", {}).get("get")
            if isinstance(dashboardStats, dict):
                dashboardStats["security"] = [{"bearerAuth": []}, {"OAuth2PasswordBearer": []}]
                responses = dashboardStats.setdefault("responses", {})
                ensureNoStoreResponse(
                    responses.setdefault("200", {"description": "OK"}),
                    "OK (returns dashboard status summary for authenticated user)",
                    "DashboardStatsResponse",
                )
                ensureErrorResponseRef(dashboardStats, "401", "UnauthorizedErrorResponse")
                ensureErrorResponseRef(dashboardStats, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    dashboardStats,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.GET('/api/v1/dashboard/stats');\n"
                        "// console.log(res.data.result.statusSummaryList);"
                    ),
                )

            dashboardDetail = paths.get("/api/v1/dashboard/{dataId}", {}).get("get")
            if isinstance(dashboardDetail, dict):
                dashboardDetail["security"] = [{"bearerAuth": []}, {"OAuth2PasswordBearer": []}]
                responses = dashboardDetail.setdefault("responses", {})
                ensureNoStoreResponse(
                    responses.setdefault("200", {"description": "OK"}),
                    "OK (returns one dashboard item owned by authenticated user)",
                    "DashboardItemResponse",
                )
                ensureErrorResponseRef(dashboardDetail, "401", "UnauthorizedErrorResponse")
                ensureErrorResponseRef(dashboardDetail, "404", "NotFoundErrorResponse")
                ensureErrorResponseRef(dashboardDetail, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    dashboardDetail,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.GET('/api/v1/dashboard/{dataId}', {\n"
                        "//   params: { path: { dataId: 1 } },\n"
                        "// });\n"
                        "// console.log(res.data.result.title);"
                    ),
                )

            dashboardCreate = paths.get("/api/v1/dashboard", {}).get("post")
            if isinstance(dashboardCreate, dict):
                dashboardCreate["security"] = [{"bearerAuth": []}, {"OAuth2PasswordBearer": []}]
                dashboardCreate["requestBody"] = {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {"$ref": "#/components/schemas/DashboardWriteRequest"},
                        }
                    },
                }
                ensureHeaderRef(dashboardCreate, "IdempotencyKey")
                responses = dashboardCreate.setdefault("responses", {})
                responses.pop("200", None)
                ensureNoStoreResponse(
                    responses.setdefault("201", {"description": "Created"}),
                    "Created (returns the new dashboard item)",
                    "DashboardCreateResponse",
                )
                ensureErrorResponseRef(dashboardCreate, "401", "UnauthorizedErrorResponse")
                ensureErrorResponseRef(dashboardCreate, "409", "ConflictErrorResponse")
                ensureErrorResponseRef(dashboardCreate, "422", "ValidationErrorResponse")
                ensureErrorResponseRef(dashboardCreate, "500", "InternalServerErrorResponse")
                ensureErrorResponseRef(dashboardCreate, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    dashboardCreate,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.POST('/api/v1/dashboard', {\n"
                        "//   headers: { 'Idempotency-Key': crypto.randomUUID() },\n"
                        "//   body: { title: '신규 업무', status: 'running', amount: 32100, tags: ['web'] },\n"
                        "// });\n"
                        "// console.log(res.data.result.id);"
                    ),
                )

            dashboardUpdate = paths.get("/api/v1/dashboard/{dataId}", {}).get("put")
            if isinstance(dashboardUpdate, dict):
                dashboardUpdate["security"] = [{"bearerAuth": []}, {"OAuth2PasswordBearer": []}]
                dashboardUpdate["requestBody"] = {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {"$ref": "#/components/schemas/DashboardPatchRequest"},
                        }
                    },
                }
                responses = dashboardUpdate.setdefault("responses", {})
                ensureNoStoreResponse(
                    responses.setdefault("200", {"description": "OK"}),
                    "OK (returns the updated dashboard item)",
                    "DashboardUpdateResponse",
                )
                ensureErrorResponseRef(dashboardUpdate, "401", "UnauthorizedErrorResponse")
                ensureErrorResponseRef(dashboardUpdate, "404", "NotFoundErrorResponse")
                ensureErrorResponseRef(dashboardUpdate, "422", "ValidationErrorResponse")
                ensureErrorResponseRef(dashboardUpdate, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    dashboardUpdate,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.PUT('/api/v1/dashboard/{dataId}', {\n"
                        "//   params: { path: { dataId: 1 } },\n"
                        "//   body: { status: 'done', tags: 'release,done' },\n"
                        "// });\n"
                        "// console.log(res.data.result.status);"
                    ),
                )

            dashboardDelete = paths.get("/api/v1/dashboard/{dataId}", {}).get("delete")
            if isinstance(dashboardDelete, dict):
                dashboardDelete["security"] = [{"bearerAuth": []}, {"OAuth2PasswordBearer": []}]
                responses = dashboardDelete.setdefault("responses", {})
                ensureNoStoreResponse(
                    responses.setdefault("200", {"description": "OK"}),
                    "OK (deletes one dashboard item owned by authenticated user)",
                    "DashboardDeleteResponse",
                )
                ensureErrorResponseRef(dashboardDelete, "401", "UnauthorizedErrorResponse")
                ensureErrorResponseRef(dashboardDelete, "404", "NotFoundErrorResponse")
                ensureErrorResponseRef(dashboardDelete, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    dashboardDelete,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// await client.DELETE('/api/v1/dashboard/{dataId}', {\n"
                        "//   params: { path: { dataId: 1 } },\n"
                        "// });"
                    ),
                )

            login = paths.get("/api/v1/auth/login", {}).get("post")
            if isinstance(login, dict):
                login["requestBody"] = {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {"$ref": "#/components/schemas/AuthLoginRequest"},
                        }
                    },
                }
                responses = login.setdefault("responses", {})

                # 참고: 실제 구현은 200 JSON(successResponse) + Set-Cookie 이다(AuthRouter.login).
                responses.pop("204", None)

                res200 = responses.setdefault("200", {"description": "OK"})
                res200["description"] = "OK (sets access/refresh cookies; token strings are hidden in JSON body)"
                res200.setdefault("headers", {})["Set-Cookie"] = {
                    "description": f"Sets `{accessCookie}` and `{refreshCookie}` cookies on success.",
                    "schema": {"type": "string"},
                }
                res200.setdefault("content", {}).setdefault("application/json", {})["schema"] = {
                    "$ref": "#/components/schemas/AuthWebSessionResponse"
                }
                ensureErrorResponseRef(login, "401", "UnauthorizedErrorResponse")
                ensureErrorResponseRef(login, "422", "ValidationErrorResponse")
                ensureErrorResponseRef(login, "429", "RateLimitErrorResponse")
                ensureErrorResponseRef(login, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    login,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// await client.POST('/api/v1/auth/login', {\n"
                        "//   body: { username: 'demo@demo.demo', password: 'password123', rememberMe: false },\n"
                        "// });\n"
                        "// The backend responds 200 JSON(tokenType/expiresIn only) and sets HttpOnly cookies."
                    ),
                )

            signup = paths.get("/api/v1/auth/signup", {}).get("post")
            if isinstance(signup, dict):
                signup["requestBody"] = {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {"$ref": "#/components/schemas/AuthSignupRequest"},
                        }
                    },
                }
                ensureHeaderRef(signup, "IdempotencyKey")
                responses = signup.setdefault("responses", {})
                responses.pop("200", None)
                res201 = responses.setdefault("201", {"description": "Created"})
                res201["description"] = "Created (returns the newly registered user summary)"
                res201.setdefault("content", {}).setdefault("application/json", {})["schema"] = {
                    "$ref": "#/components/schemas/AuthSignupResponse"
                }
                ensureErrorResponseRef(signup, "409", "ConflictErrorResponse")
                ensureErrorResponseRef(signup, "422", "ValidationErrorResponse")
                ensureErrorResponseRef(signup, "500", "InternalServerErrorResponse")
                ensureErrorResponseRef(signup, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    signup,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.POST('/api/v1/auth/signup', {\n"
                        "//   headers: { 'Idempotency-Key': crypto.randomUUID() },\n"
                        "//   body: { name: 'Demo User', email: 'demo@demo.demo', password: 'password123' },\n"
                        "// });\n"
                        "// console.log(res.data.result.userId);"
                    ),
                )

            refresh = paths.get("/api/v1/auth/refresh", {}).get("post")
            if isinstance(refresh, dict):

                # Refresh는 refresh cookie로 새 토큰 발급 + Set-Cookie 를 반환한다.
                responses = refresh.setdefault("responses", {})
                res200 = responses.setdefault("200", {"description": "OK"})
                res200["description"] = "OK (rotates access/refresh cookies; token strings are hidden in JSON body)"
                res200.setdefault("headers", {})["Set-Cookie"] = {
                    "description": f"Rotates `{accessCookie}` and `{refreshCookie}` cookies on success.",
                    "schema": {"type": "string"},
                }
                res200.setdefault("content", {}).setdefault("application/json", {})["schema"] = {
                    "$ref": "#/components/schemas/AuthWebSessionResponse"
                }
                ensureHeaderRef(refresh, "OriginHeader")
                ensureHeaderRef(refresh, "RefererHeader")
                ensureErrorResponseRef(refresh, "401", "UnauthorizedErrorResponse")
                ensureErrorResponseRef(refresh, "403", "ForbiddenErrorResponse")
                ensureJavaScriptCodeSample(
                    refresh,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// await client.POST('/api/v1/auth/refresh', {\n"
                        "//   headers: { Origin: 'http://localhost:3000' },\n"
                        "// });\n"
                        "// Web refresh uses HttpOnly refresh cookie + Origin/Referer allowlist."
                    ),
                )

            logout = paths.get("/api/v1/auth/logout", {}).get("post")
            if isinstance(logout, dict):

                # 실제 구현은 204(No Content).
                responses = logout.setdefault("responses", {})
                responses.setdefault("204", {"description": "No Content"})
                responses.pop("200", None)
                ensureHeaderRef(logout, "OriginHeader")
                ensureHeaderRef(logout, "RefererHeader")
                ensureErrorResponseRef(logout, "401", "UnauthorizedErrorResponse")
                ensureErrorResponseRef(logout, "403", "ForbiddenErrorResponse")
                ensureJavaScriptCodeSample(
                    logout,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// await client.POST('/api/v1/auth/logout', {\n"
                        "//   headers: { Origin: 'http://localhost:3000' },\n"
                        "// });"
                    ),
                )

            appLogin = paths.get("/api/v1/auth/app/login", {}).get("post")
            if isinstance(appLogin, dict):
                appLogin["requestBody"] = {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {"$ref": "#/components/schemas/AuthAppLoginRequest"},
                        }
                    },
                }
                responses = appLogin.setdefault("responses", {})
                responses.pop("204", None)
                res200 = responses.setdefault("200", {"description": "OK"})
                res200["description"] = "OK (returns access/refresh tokens in JSON; no cookies)"
                res200.setdefault("content", {}).setdefault("application/json", {})["schema"] = {
                    "$ref": "#/components/schemas/AuthAppTokenResponse"
                }
                ensureErrorResponseRef(appLogin, "401", "UnauthorizedErrorResponse")
                ensureErrorResponseRef(appLogin, "422", "ValidationErrorResponse")
                ensureErrorResponseRef(appLogin, "429", "RateLimitErrorResponse")
                ensureErrorResponseRef(appLogin, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    appLogin,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.POST('/api/v1/auth/app/login', {\n"
                        "//   body: { username: 'demo@demo.demo', password: 'password123', rememberMe: false },\n"
                        "// });\n"
                        "// console.log(res.data.result.accessToken);"
                    ),
                )

            appRefresh = paths.get("/api/v1/auth/app/refresh", {}).get("post")
            if isinstance(appRefresh, dict):
                appRefresh["requestBody"] = {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {"$ref": "#/components/schemas/AuthAppRefreshRequest"},
                        }
                    },
                }
                responses = appRefresh.setdefault("responses", {})
                responses.pop("204", None)
                res200 = responses.setdefault("200", {"description": "OK"})
                res200["description"] = "OK (returns rotated access/refresh tokens in JSON; no cookies)"
                res200.setdefault("content", {}).setdefault("application/json", {})["schema"] = {
                    "$ref": "#/components/schemas/AuthAppTokenResponse"
                }
                ensureErrorResponseRef(appRefresh, "401", "UnauthorizedErrorResponse")
                ensureErrorResponseRef(appRefresh, "422", "ValidationErrorResponse")
                ensureJavaScriptCodeSample(
                    appRefresh,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.POST('/api/v1/auth/app/refresh', {\n"
                        "//   body: { refreshToken: '<refresh-token>' },\n"
                        "// });\n"
                        "// console.log(res.data.result.accessToken);"
                    ),
                )

            appLogout = paths.get("/api/v1/auth/app/logout", {}).get("post")
            if isinstance(appLogout, dict):
                appLogout["requestBody"] = {
                    "required": False,
                    "content": {
                        "application/json": {
                            "schema": {"$ref": "#/components/schemas/AuthAppLogoutRequest"},
                        }
                    },
                }
                responses = appLogout.setdefault("responses", {})
                responses.setdefault("204", {"description": "No Content"})
                responses.pop("200", None)
                ensureErrorResponseRef(appLogout, "422", "ValidationErrorResponse")
                ensureJavaScriptCodeSample(
                    appLogout,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// await client.POST('/api/v1/auth/app/logout', {\n"
                        "//   body: { refreshToken: '<refresh-token>' },\n"
                        "// });"
                    ),
                )

            passwordResetPaths = (
                "/api/v1/auth/passwordResetRequest",
                "/api/v1/auth/password-reset/request",
                "/api/v1/auth/passwordReset/request",
            )
            for passwordResetPath in passwordResetPaths:
                passwordReset = paths.get(passwordResetPath, {}).get("post")
                if not isinstance(passwordReset, dict):
                    continue
                passwordReset["requestBody"] = {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {"$ref": "#/components/schemas/PasswordResetRequest"},
                        }
                    },
                }
                responses = passwordReset.setdefault("responses", {})
                res200 = responses.setdefault("200", {"description": "OK"})
                res200["description"] = (
                    "OK (accepts password reset request without disclosing whether the account exists)"
                )
                res200.setdefault("content", {}).setdefault("application/json", {})["schema"] = {
                    "$ref": "#/components/schemas/PasswordResetRequestResponse"
                }
                ensureErrorResponseRef(passwordReset, "422", "ValidationErrorResponse")
                ensureErrorResponseRef(passwordReset, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    passwordReset,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        f"// await client.POST('{passwordResetPath}', {{\n"
                        "//   body: { email: 'demo@demo.demo' },\n"
                        "// });"
                    ),
                )

            sampleOverview = paths.get("/api/v1/sample/overview", {}).get("get")
            if isinstance(sampleOverview, dict):
                responses = sampleOverview.setdefault("responses", {})
                ensureNoStoreResponse(
                    responses.setdefault("200", {"description": "OK"}),
                    "OK (returns public sample overview counters)",
                    "SampleOverviewResponse",
                )
                ensureErrorResponseRef(sampleOverview, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    sampleOverview,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.GET('/api/v1/sample/overview');\n"
                        "// console.log(res.data.result.taskCount);"
                    ),
                )

            sampleDashboard = paths.get("/api/v1/sample/dashboard", {}).get("get")
            if isinstance(sampleDashboard, dict):
                responses = sampleDashboard.setdefault("responses", {})
                ensureNoStoreResponse(
                    responses.setdefault("200", {"description": "OK"}),
                    "OK (returns public sample dashboard KPI, trend, and recent task bundles)",
                    "SampleDashboardResponse",
                )
                ensureErrorResponseRef(sampleDashboard, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    sampleDashboard,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.GET('/api/v1/sample/dashboard');\n"
                        "// console.log(res.data.result.recentList);"
                    ),
                )

            sampleTaskList = paths.get("/api/v1/sample/tasks", {}).get("get")
            if isinstance(sampleTaskList, dict):
                responses = sampleTaskList.setdefault("responses", {})
                ensureNoStoreResponse(
                    responses.setdefault("200", {"description": "OK"}),
                    "OK (returns public sample task list and list metadata)",
                    "SampleTaskListResponse",
                )
                ensureErrorResponseRef(sampleTaskList, "422", "ValidationErrorResponse")
                ensureErrorResponseRef(sampleTaskList, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    sampleTaskList,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.GET('/api/v1/sample/tasks', {\n"
                        "//   params: { query: { page: 1, size: 20, status: 'running' } },\n"
                        "// });\n"
                        "// console.log(res.data.result.sampleTaskList);"
                    ),
                )

            sampleTaskDetail = paths.get("/api/v1/sample/tasks/{taskId}", {}).get("get")
            if isinstance(sampleTaskDetail, dict):
                responses = sampleTaskDetail.setdefault("responses", {})
                ensureNoStoreResponse(
                    responses.setdefault("200", {"description": "OK"}),
                    "OK (returns one public sample task)",
                    "SampleTaskDetailResponse",
                )
                ensureErrorResponseRef(sampleTaskDetail, "404", "NotFoundErrorResponse")
                ensureErrorResponseRef(sampleTaskDetail, "422", "ValidationErrorResponse")
                ensureErrorResponseRef(sampleTaskDetail, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    sampleTaskDetail,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.GET('/api/v1/sample/tasks/{taskId}', {\n"
                        "//   params: { path: { taskId: 1 } },\n"
                        "// });\n"
                        "// console.log(res.data.result.title);"
                    ),
                )

            sampleTaskCreate = paths.get("/api/v1/sample/tasks", {}).get("post")
            if isinstance(sampleTaskCreate, dict):
                sampleTaskCreate["requestBody"] = {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {"$ref": "#/components/schemas/SampleTaskWriteRequest"},
                        }
                    },
                }
                ensureHeaderRef(sampleTaskCreate, "IdempotencyKey")
                responses = sampleTaskCreate.setdefault("responses", {})
                responses.pop("200", None)
                ensureNoStoreResponse(
                    responses.setdefault("201", {"description": "Created"}),
                    "Created (returns the newly created public sample task)",
                    "SampleTaskCreateResponse",
                )
                ensureErrorResponseRef(sampleTaskCreate, "409", "ConflictErrorResponse")
                ensureErrorResponseRef(sampleTaskCreate, "422", "ValidationErrorResponse")
                ensureErrorResponseRef(sampleTaskCreate, "500", "InternalServerErrorResponse")
                ensureErrorResponseRef(sampleTaskCreate, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    sampleTaskCreate,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.POST('/api/v1/sample/tasks', {\n"
                        "//   headers: { 'Idempotency-Key': crypto.randomUUID() },\n"
                        "//   body: { title: '공개 샘플 신규 업무', status: 'running', amount: 210000 },\n"
                        "// });\n"
                        "// console.log(res.data.result.id);"
                    ),
                )

            sampleTaskUpdate = paths.get("/api/v1/sample/tasks/{taskId}", {}).get("put")
            if isinstance(sampleTaskUpdate, dict):
                sampleTaskUpdate["requestBody"] = {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {"$ref": "#/components/schemas/SampleTaskPatchRequest"},
                        }
                    },
                }
                responses = sampleTaskUpdate.setdefault("responses", {})
                ensureNoStoreResponse(
                    responses.setdefault("200", {"description": "OK"}),
                    "OK (returns the updated public sample task)",
                    "SampleTaskUpdateResponse",
                )
                ensureErrorResponseRef(sampleTaskUpdate, "404", "NotFoundErrorResponse")
                ensureErrorResponseRef(sampleTaskUpdate, "422", "ValidationErrorResponse")
                ensureErrorResponseRef(sampleTaskUpdate, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    sampleTaskUpdate,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.PUT('/api/v1/sample/tasks/{taskId}', {\n"
                        "//   params: { path: { taskId: 1 } },\n"
                        "//   body: { status: 'done', owner: '수정자' },\n"
                        "// });\n"
                        "// console.log(res.data.result.status);"
                    ),
                )

            sampleTaskDelete = paths.get("/api/v1/sample/tasks/{taskId}", {}).get("delete")
            if isinstance(sampleTaskDelete, dict):
                responses = sampleTaskDelete.setdefault("responses", {})
                ensureNoStoreResponse(
                    responses.setdefault("200", {"description": "OK"}),
                    "OK (deletes one public sample task)",
                    "SampleTaskDeleteResponse",
                )
                ensureErrorResponseRef(sampleTaskDelete, "404", "NotFoundErrorResponse")
                ensureErrorResponseRef(sampleTaskDelete, "422", "ValidationErrorResponse")
                ensureErrorResponseRef(sampleTaskDelete, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    sampleTaskDelete,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.DELETE('/api/v1/sample/tasks/{taskId}', {\n"
                        "//   params: { path: { taskId: 1 } },\n"
                        "// });\n"
                        "// console.log(res.data.result.id);"
                    ),
                )

            sampleFormMeta = paths.get("/api/v1/sample/forms/meta", {}).get("get")
            if isinstance(sampleFormMeta, dict):
                responses = sampleFormMeta.setdefault("responses", {})
                ensureNoStoreResponse(
                    responses.setdefault("200", {"description": "OK"}),
                    "OK (returns public sample form meta and latest submission summary)",
                    "SampleFormMetaResponse",
                )
                ensureErrorResponseRef(sampleFormMeta, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    sampleFormMeta,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.GET('/api/v1/sample/forms/meta');\n"
                        "// console.log(res.data.result.categoryCodeList);"
                    ),
                )

            sampleFormSubmit = paths.get("/api/v1/sample/forms", {}).get("post")
            if isinstance(sampleFormSubmit, dict):
                sampleFormSubmit["requestBody"] = {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {"$ref": "#/components/schemas/SampleFormSubmitRequest"},
                        }
                    },
                }
                ensureHeaderRef(sampleFormSubmit, "IdempotencyKey")
                responses = sampleFormSubmit.setdefault("responses", {})
                responses.pop("200", None)
                ensureNoStoreResponse(
                    responses.setdefault("201", {"description": "Created"}),
                    "Created (returns the saved public sample form submission)",
                    "SampleFormSubmitResponse",
                )
                ensureErrorResponseRef(sampleFormSubmit, "409", "ConflictErrorResponse")
                ensureErrorResponseRef(sampleFormSubmit, "422", "ValidationErrorResponse")
                ensureErrorResponseRef(sampleFormSubmit, "500", "InternalServerErrorResponse")
                ensureErrorResponseRef(sampleFormSubmit, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    sampleFormSubmit,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.POST('/api/v1/sample/forms', {\n"
                        "//   headers: { 'Idempotency-Key': crypto.randomUUID() },\n"
                        "//   body: { name: '홍길동', email: 'hong@example.com', phone: '010-1234-5678', category: 'web', startDate: '2026-03-01', endDate: '2026-03-10', budgetRange: '300만 ~ 500만' },\n"
                        "// });\n"
                        "// console.log(res.data.result.id);"
                    ),
                )

            sampleAdminUsers = paths.get("/api/v1/sample/admin/users", {}).get("get")
            if isinstance(sampleAdminUsers, dict):
                responses = sampleAdminUsers.setdefault("responses", {})
                ensureNoStoreResponse(
                    responses.setdefault("200", {"description": "OK"}),
                    "OK (returns public sample admin user list and list metadata)",
                    "SampleAdminUserListResponse",
                )
                ensureErrorResponseRef(sampleAdminUsers, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    sampleAdminUsers,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.GET('/api/v1/sample/admin/users', {\n"
                        "//   params: { query: { page: 1, size: 50 } },\n"
                        "// });\n"
                        "// console.log(res.data.result.sampleAdminUserList);"
                    ),
                )

            sampleAdminUserCreate = paths.get("/api/v1/sample/admin/users", {}).get("post")
            if isinstance(sampleAdminUserCreate, dict):
                sampleAdminUserCreate["requestBody"] = {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {"$ref": "#/components/schemas/SampleAdminUserWriteRequest"},
                        }
                    },
                }
                ensureHeaderRef(sampleAdminUserCreate, "IdempotencyKey")
                responses = sampleAdminUserCreate.setdefault("responses", {})
                responses.pop("200", None)
                ensureNoStoreResponse(
                    responses.setdefault("201", {"description": "Created"}),
                    "Created (returns the newly created public sample admin user)",
                    "SampleAdminUserCreateResponse",
                )
                ensureErrorResponseRef(sampleAdminUserCreate, "409", "ConflictErrorResponse")
                ensureErrorResponseRef(sampleAdminUserCreate, "422", "ValidationErrorResponse")
                ensureErrorResponseRef(sampleAdminUserCreate, "500", "InternalServerErrorResponse")
                ensureErrorResponseRef(sampleAdminUserCreate, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    sampleAdminUserCreate,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.POST('/api/v1/sample/admin/users', {\n"
                        "//   headers: { 'Idempotency-Key': crypto.randomUUID() },\n"
                        "//   body: { name: '신규 운영자', email: 'new-admin@example.com', role: 'editor', status: 'active' },\n"
                        "// });\n"
                        "// console.log(res.data.result.id);"
                    ),
                )

            sampleAdminUserUpdate = paths.get("/api/v1/sample/admin/users/{userId}", {}).get("put")
            if isinstance(sampleAdminUserUpdate, dict):
                sampleAdminUserUpdate["requestBody"] = {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {"$ref": "#/components/schemas/SampleAdminUserPatchRequest"},
                        }
                    },
                }
                responses = sampleAdminUserUpdate.setdefault("responses", {})
                ensureNoStoreResponse(
                    responses.setdefault("200", {"description": "OK"}),
                    "OK (returns the updated public sample admin user)",
                    "SampleAdminUserUpdateResponse",
                )
                ensureErrorResponseRef(sampleAdminUserUpdate, "404", "NotFoundErrorResponse")
                ensureErrorResponseRef(sampleAdminUserUpdate, "422", "ValidationErrorResponse")
                ensureErrorResponseRef(sampleAdminUserUpdate, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    sampleAdminUserUpdate,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.PUT('/api/v1/sample/admin/users/{userId}', {\n"
                        "//   params: { path: { userId: 1 } },\n"
                        "//   body: { role: 'admin', notifySms: true },\n"
                        "// });\n"
                        "// console.log(res.data.result.role);"
                    ),
                )

            sampleAdminSettings = paths.get("/api/v1/sample/admin/settings", {}).get("get")
            if isinstance(sampleAdminSettings, dict):
                responses = sampleAdminSettings.setdefault("responses", {})
                ensureNoStoreResponse(
                    responses.setdefault("200", {"description": "OK"}),
                    "OK (returns public sample admin system settings and role permissions)",
                    "SampleAdminSettingsResponse",
                )
                ensureErrorResponseRef(sampleAdminSettings, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    sampleAdminSettings,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.GET('/api/v1/sample/admin/settings');\n"
                        "// console.log(res.data.result.systemSetting.siteName);"
                    ),
                )

            sampleAdminSettingsUpdate = paths.get("/api/v1/sample/admin/settings", {}).get("put")
            if isinstance(sampleAdminSettingsUpdate, dict):
                sampleAdminSettingsUpdate["requestBody"] = {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {"$ref": "#/components/schemas/SampleAdminSettingsUpdateRequest"},
                        }
                    },
                }
                responses = sampleAdminSettingsUpdate.setdefault("responses", {})
                ensureNoStoreResponse(
                    responses.setdefault("200", {"description": "OK"}),
                    "OK (returns the updated public sample admin settings)",
                    "SampleAdminSettingsUpdateResponse",
                )
                ensureErrorResponseRef(sampleAdminSettingsUpdate, "422", "ValidationErrorResponse")
                ensureErrorResponseRef(sampleAdminSettingsUpdate, "503", "ServiceUnavailableErrorResponse")
                ensureJavaScriptCodeSample(
                    sampleAdminSettingsUpdate,
                    (
                        "// Example using openapi-client-axios\n"
                        "// const client = ...;\n"
                        "// const res = await client.PUT('/api/v1/sample/admin/settings', {\n"
                        "//   body: { siteName: 'MyWebTemplate Sample', adminEmail: 'sample-admin@example.com', sessionTimeout: 90, maxUploadMb: 50, maintenanceMode: true },\n"
                        "// });\n"
                        "// console.log(res.data.result.systemSetting.maintenanceMode);"
                    ),
                )

            # 참고: 템플릿 기본(토큰 모드)에서는 CSRF 헤더를 강제하지 않는다.
            # 쿠키가 직접 권한을 갖는 엔드포인트를 추가하는 경우에만,
            # 해당 라우트에 CSRFToken 파라미터를 수동으로 붙여 문서화한다.
        except Exception as e:
            strictMode = isOpenapiPatchStrictEnabled()
            logger.error(f"OpenAPI schema patching failed (strict={strictMode}): {e}")
            if strictMode:
                raise
        return schema

    def customOpenapi():
        """
        설명: FastAPI 기본 스키마 생성 후 patchOpenapi를 적용해 캐시
        처리 규칙: 이미 캐시(app.openapi_schema)가 있으면 재생성하지 않고 그대로 반환
        반환값: FastAPI에서 사용하는 최종 OpenAPI schema 객체를 반환
        갱신일: 2026-02-26
        """
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

    app.openapi_schema = None
    app.openapi = customOpenapi  # type: ignore
