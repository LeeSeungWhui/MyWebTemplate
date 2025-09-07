---
id: CU-BE-005
name: OpenAPI 문서 & JS 클라이언트
module: backend
status: implemented
priority: P1
links: [CU-BE-001]
---

### Purpose
- Swagger/OpenAPI 문서와 TypeScript 없는 JavaScript 클라이언트 템플릿을 제공한다.

### Scope
- 포함
  - `components.securitySchemes`에 쿠키 세션과 Bearer 토큰 인증을 OR 관계로 문서화.
  - `{status, message, result, count?, code?, requestId}` 래퍼 스키마.
  - 401 응답에 `WWW-Authenticate` 헤더 표기.
  - 비멱등 엔드포인트에 `CSRFToken` 파라미터(`X-CSRF-Token`) 참조.
  - 서버 목록, 태그 그룹, `operationId`, `openapi-client-axios` 기반 `x-codeSamples`.
- 제외
  - TypeScript 바인딩 및 코드 생성기.

### Interface
- Export
  - OpenAPI JSON: `GET /openapi.json`
  - Swagger UI: `GET /docs`
  - `components.securitySchemes`
  - `components.schemas.StandardResponse`, `ErrorResponse`
  - `components.parameters.CSRFToken`
  - `servers: [{url:"http://localhost:8000"}, {url:"https://api.example.com"}]`
  - 태그 그룹용 `x-tagGroups`
  - `openapi-client-axios` 예제를 담은 `x-codeSamples`

### Data & Rules
- 로그인 응답은 `204`와 `Set-Cookie` 헤더로 문서화한다.
- 401 응답은 `WWW-Authenticate` 헤더와 `ErrorResponse` 스키마를 사용한다.
- `CSRFToken` 파라미터는 비멱등 라우트에 등장한다.
- Swagger UI 예제는 최소한으로 유지하고 자격 증명은 노출하지 않는다.

### NFR & A11y
- OpenAPI 스키마 검증으로 문서와 API의 동기화를 보장한다.

### CI(검증 & JS 클라이언트 스모크)
- OpenAPI 검증: `scripts/openapi_validate.py`.
- JS 스모크 테스트: `scripts/js_smoke.mjs`가 `/healthz` 호출.
- 워크플로: Python tests → `openapi_validate.py` → 서버 기동 → `js_smoke.mjs`.

### Defaults
- JS 클라이언트는 기본으로 `openapi-client-axios`를 사용한다.

### Acceptance Criteria
- **AC-1:** 로그인 API가 `204 + Set-Cookie` 응답을 문서화한다.
- **AC-2:** 비멱등 라우트에 `CSRFToken` 파라미터가 필요하며 없으면 `403`을 반환한다.
- **AC-3:** JS 클라이언트 예제가 `openapi-client-axios`로 엔드포인트를 호출한다.
- **AC-4:** `openapi_validate.py`가 CI에서 통과한다.
- **AC-5:** `js_smoke.mjs`가 `openapi-client-axios`로 `/healthz`를 호출한다.

### Tasks
- T1: 쿠키 및 Bearer 보안 스키마 정의.
- T2: StandardResponse/ErrorResponse 스키마와 `WWW-Authenticate` 추가.
- T3: `CSRFToken` 파라미터 정의 후 비멱등 라우트에 참조.
- T4: 로그인 `204 + Set-Cookie` 응답 문서화.
- T5: `servers`, `x-tagGroups`, `operationId` 값 추가.
- T6: `openapi-client-axios` 코드 샘플 추가.
- T7: CI에 OpenAPI 검증과 JS 스모크 테스트 포함.
- T8: Swagger UI 예제는 최소화하고 자격 증명은 숨긴다.

