"""
파일명: backend/lib/OpenAPIHelpers.py
작성자: Codex
갱신일: 2026-06-24
설명: OpenAPI schema patch 공통 헬퍼
"""

from __future__ import annotations

import os
from typing import Any, Dict, Optional


TRUTHY_ENV_VALUES = ("1", "true", "yes", "on")


def schemaRef(schemaName: str) -> Dict[str, str]:
    return {"$ref": f"#/components/schemas/{schemaName}"}


def responseRef(responseName: str) -> Dict[str, str]:
    return {"$ref": f"#/components/responses/{responseName}"}


def parameterRef(parameterName: str) -> Dict[str, str]:
    return {"$ref": f"#/components/parameters/{parameterName}"}


def jsonSchemaContent(schemaName: str) -> Dict[str, Any]:
    return {"application/json": {"schema": schemaRef(schemaName)}}


def buildNoStoreHeader(description: str = "Responses with Cache-Control: no-store are not cacheable.") -> Dict[str, Any]:
    return {
        "description": description,
        "schema": {"type": "string", "example": "no-store"},
    }


def ensureJavaScriptCodeSample(operation: Dict[str, Any], source: str) -> None:
    samples = operation.setdefault("x-codeSamples", [])
    hasSample = any(
        isinstance(sample, dict)
        and sample.get("lang") == "JavaScript"
        and sample.get("label") == "openapi-client-axios"
        for sample in samples
    )
    if hasSample:
        return
    samples.append(
        {
            "lang": "JavaScript",
            "label": "openapi-client-axios",
            "source": source,
        }
    )


def ensureHeaderRef(operation: Dict[str, Any], refName: str) -> None:
    parameters = operation.setdefault("parameters", [])
    refPath = parameterRef(refName)
    hasRef = any(isinstance(param, dict) and param.get("$ref") == refPath["$ref"] for param in parameters)
    if not hasRef:
        parameters.append(refPath)


def ensureNoStoreResponse(response: Dict[str, Any], description: str, schemaName: str) -> None:
    response["description"] = description
    response.setdefault("headers", {})["Cache-Control"] = buildNoStoreHeader()
    response.setdefault("content", {}).update(jsonSchemaContent(schemaName))


def ensureErrorResponseRef(operation: Dict[str, Any], statusCode: str, responseName: str) -> None:
    operation.setdefault("responses", {})[statusCode] = responseRef(responseName)


def buildErrorResponseComponent(
    description: str,
    cacheControlDescription: str,
    *,
    headers: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    responseHeaders = dict(headers or {})
    responseHeaders["Cache-Control"] = buildNoStoreHeader(cacheControlDescription)
    return {
        "description": description,
        "headers": responseHeaders,
        "content": jsonSchemaContent("ErrorResponse"),
    }


def buildStandardErrorResponses() -> Dict[str, Dict[str, Any]]:
    return {
        "UnauthorizedErrorResponse": buildErrorResponseComponent(
            "Unauthorized",
            "Authentication error responses are not cacheable.",
            headers={
                "WWW-Authenticate": {
                    "description": "Bearer challenge for authentication failures.",
                    "schema": {"type": "string", "example": "Bearer"},
                }
            },
        ),
        "ForbiddenErrorResponse": buildErrorResponseComponent(
            "Forbidden",
            "Authorization error responses are not cacheable.",
        ),
        "NotFoundErrorResponse": buildErrorResponseComponent(
            "Not Found",
            "Not-found responses are not cacheable.",
        ),
        "ConflictErrorResponse": buildErrorResponseComponent(
            "Conflict",
            "Conflict responses are not cacheable.",
        ),
        "ValidationErrorResponse": buildErrorResponseComponent(
            "Unprocessable Entity",
            "Validation error responses are not cacheable.",
        ),
        "RateLimitErrorResponse": buildErrorResponseComponent(
            "Too Many Requests",
            "Rate-limit error responses are not cacheable.",
            headers={
                "Retry-After": {
                    "description": "Seconds until retry is allowed.",
                    "schema": {"type": "string", "example": "60"},
                }
            },
        ),
        "InternalServerErrorResponse": buildErrorResponseComponent(
            "Internal Server Error",
            "Server error responses are not cacheable.",
        ),
        "ServiceUnavailableErrorResponse": buildErrorResponseComponent(
            "Service Unavailable",
            "Dependency readiness errors are not cacheable.",
        ),
    }


def resolveServersFromConfig(config: Any) -> list[Dict[str, str]]:
    urls: list[str] = []
    try:
        serverSection = config["SERVER"]
    except Exception:
        serverSection = None

    if serverSection is not None:
        raw = (serverSection.get("servers") or "").strip()
        if raw:
            for url in [item.strip() for item in raw.split(",") if item.strip()]:
                if url not in urls:
                    urls.append(url)

        backendHost = (
            serverSection.get("backendHost")
            or serverSection.get("base_url")
            or serverSection.get("host")
        )
        if backendHost and backendHost not in urls:
            urls.insert(0, backendHost)

    if not urls:
        urls = ["http://localhost:4001"]
    return [{"url": url} for url in urls]


def isOpenapiPatchStrictEnabled(env: Optional[Dict[str, str]] = None) -> bool:
    source = env if env is not None else os.environ
    value = str(source.get("OPENAPI_PATCH_STRICT", "")).strip().lower()
    return value in TRUTHY_ENV_VALUES
