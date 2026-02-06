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
  - (문서용) 비멱등 엔드포인트에 선택적 `CSRFToken` 파라미터(`X-CSRF-Token`) 참조(현재 서버에서 강제하지 않음).
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
  - `servers: [{url:"http://localhost:2000"}, {url:"https://api.example.com"}]`
  - 태그 그룹용 `x-tagGroups`
  - `openapi-client-axios` 예제를 담은 `x-codeSamples`

### Data & Rules
- 로그인 응답은 `200 JSON + Set-Cookie`(Access/Refresh 쿠키)로 문서화한다.
- 401 응답은 `WWW-Authenticate` 헤더와 `ErrorResponse` 스키마를 사용한다.
- `CSRFToken` 파라미터는 OpenAPI에 등장할 수 있으나, 현재 서버는 이를 필수로 강제하지 않는다.
- Swagger UI 예제는 최소한으로 유지하고 자격 증명은 노출하지 않는다.

### NFR & A11y
- OpenAPI 스키마 검증으로 문서와 API의 동기화를 보장한다.

### 검증(스모크)
- OpenAPI 스키마 검증과 JS 스모크 스크립트는 템플릿 후속 작업으로 둔다(레포에 스크립트가 없으면 이 섹션은 “planned”로 간주).

### Defaults
- JS 클라이언트는 기본으로 `openapi-client-axios`를 사용한다.

### Acceptance Criteria
- **AC-1:** 로그인 API가 `200 + Set-Cookie` 응답을 문서화한다.
- **AC-2:** OpenAPI에 `CSRFToken` 파라미터가 포함되더라도 현재 서버는 이를 강제하지 않는다(403을 요구하지 않음).
- **AC-3:** JS 클라이언트 예제가 `openapi-client-axios`로 엔드포인트를 호출한다.

### Tasks
- T1: 쿠키 및 Bearer 보안 스키마 정의.
- T2: StandardResponse/ErrorResponse 스키마와 `WWW-Authenticate` 추가.
- T3: (선택) `CSRFToken` 파라미터 문서화(서버 강제 여부는 별도 유닛에서 결정).
- T4: 로그인 `200 + Set-Cookie` 응답 문서화.
- T5: `servers`, `x-tagGroups`, `operationId` 값 추가.
- T6: `openapi-client-axios` 코드 샘플 추가.
- T7: (선택) 릴리스 체크리스트에 OpenAPI 검증과 JS 스모크 테스트 포함.
- T8: Swagger UI 예제는 최소화하고 자격 증명은 숨긴다.
