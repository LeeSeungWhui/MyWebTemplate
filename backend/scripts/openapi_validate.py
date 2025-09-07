#!/usr/bin/env python
"""
Validate FastAPI OpenAPI schema and basic invariants.

Runs in-process without a network server.
Exits with non-zero on failure.
"""

from __future__ import annotations

import sys
from typing import Any, Dict


def validate_schema(j: Dict[str, Any]) -> None:
    assert isinstance(j, dict), "schema must be an object"
    assert "openapi" in j and isinstance(j.get("paths"), dict), "paths missing"
    comps = j.get("components", {})
    assert "securitySchemes" in comps, "securitySchemes missing"
    params = comps.get("parameters", {})
    assert "CSRFToken" in params, "CSRFToken param missing"
    # must have session + auth endpoints
    paths = j.get("paths", {})
    assert "/api/v1/auth/login" in paths and "/api/v1/auth/session" in paths


def main() -> int:
    from fastapi.testclient import TestClient
    from backend.server import app  # type: ignore

    with TestClient(app) as client:
        r = client.get("/openapi.json")
        if r.status_code != 200:
            print("openapi.json fetch failed", file=sys.stderr)
            return 2
        j = r.json()
        try:
            validate_schema(j)
        except AssertionError as e:
            print(f"OpenAPI validation failed: {e}", file=sys.stderr)
            return 3
        print("OpenAPI OK")
        return 0


if __name__ == "__main__":
    raise SystemExit(main())

