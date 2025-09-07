---
id: CU-BE-005
name: OpenAPI Docs & JS Client
module: backend
status: implemented
priority: P1
links: [CU-BE-001]
---

### Purpose
- Provide Swagger/OpenAPI docs and a JavaScript client template without TypeScript.

### Scope
- Include
  - Document cookie session and bearer token auth in `components.securitySchemes` with OR relationship.
  - Response wrapper `{status, message, result, count?, code?, requestId}` schemas.
  - 401 responses with `WWW-Authenticate` header.
  - `CSRFToken` parameter (`X-CSRF-Token`) referenced by non-idempotent endpoints.
  - Servers, tag groups, `operationId`, and `x-codeSamples` using `openapi-client-axios` (JS).
- Exclude
  - TypeScript bindings or generators.

### Interface
- Export
  - OpenAPI JSON: `GET /openapi.json`
  - Swagger UI: `GET /docs`
  - `components.securitySchemes`
  - `components.schemas.StandardResponse`, `ErrorResponse`
  - `components.parameters.CSRFToken`
  - `servers: [{url:"http://localhost:8000"}, {url:"https://api.example.com"}]`
  - `x-tagGroups` for tag grouping
  - `x-codeSamples` with `openapi-client-axios` examples

### Data & Rules
- Login response documented as `204` with `Set-Cookie` header.
- 401 responses include `WWW-Authenticate` and use `ErrorResponse` schema.
- CSRFToken parameter appears in non-idempotent routes.
- Swagger UI keeps code samples minimal and avoids exposing credentials.

### NFR & A11y
- OpenAPI schema validation ensures docs and APIs stay in sync.

### CI(검증 & JS 클라이언트 스모크)
- OpenAPI validation: `scripts/openapi_validate.py`.
- JS smoke test: Node script `scripts/js_smoke.mjs` hitting `/healthz`.
- Workflow: Python tests → `openapi_validate.py` → start server → `js_smoke.mjs`.

### Defaults
- JS client uses `openapi-client-axios` by default.

### Acceptance Criteria
- **AC-1:** Login API documents `204 + Set-Cookie` response.
- **AC-2:** `CSRFToken` parameter required in non-idempotent routes and returns `403` when missing.
- **AC-3:** JS client example uses `openapi-client-axios` to call an endpoint.
- **AC-4:** `openapi_validate.py` passes in CI.
- **AC-5:** `js_smoke.mjs` calls `/healthz` using `openapi-client-axios`.

### Tasks
- T1: Define cookie and bearer security schemes.
- T2: Add StandardResponse/ErrorResponse schemas and `WWW-Authenticate`.
- T3: Define `CSRFToken` parameter and reference it in non-idempotent routes.
- T4: Document login `204 + Set-Cookie` response.
- T5: Provide `servers`, `x-tagGroups`, and `operationId` values.
- T6: Add `openapi-client-axios` code samples.
- T7: Include OpenAPI validation and JS smoke in CI.
- T8: Keep Swagger UI examples minimal without credentials.

