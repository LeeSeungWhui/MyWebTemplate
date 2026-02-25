---
id: CU-BE-005
name: OpenAPI 문서 & JS 클라이언트
module: backend
status: in-progress
priority: P1
links: [CU-BE-001]
---

### Purpose
- Swagger/OpenAPI 문서와 TypeScript 없는 JavaScript 클라이언트 템플릿을 제공한다.

### Scope
- 포함
  - Web 쿠키 계약(`/api/v1/auth/*`)과 App 토큰 계약(`/api/v1/auth/app/*`)을 분리 문서화.
  - `components.securitySchemes`에 쿠키 인증과 Bearer 인증을 분리 정의.
  - `{status, message, result, count?, code?, requestId}` 래퍼 스키마.
  - 401 응답에 `WWW-Authenticate` 헤더 표기.
  - Web 쿠키 권한 경로(`refresh/logout`)의 Origin/Referer 검증 정책 문서화.
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
- Web 로그인/리프레시 응답은 `200 JSON + Set-Cookie`로 문서화하고, JSON 본문에서 `accessToken`/`refreshToken`을 제외한다.
- App 로그인/리프레시 응답은 `200 JSON(accessToken, refreshToken, expiresIn...)`으로 문서화하고, `Set-Cookie`는 제외한다.
- 401 응답은 `WWW-Authenticate` 헤더와 `ErrorResponse` 스키마를 사용한다.
- Web 쿠키 권한 경로는 `Origin`/`Referer` 검증 요구사항을 설명한다.
- Swagger UI 예제는 최소한으로 유지하고 자격 증명은 노출하지 않는다.

### NFR & A11y
- OpenAPI 스키마 검증으로 문서와 API의 동기화를 보장한다.

### 검증(스모크)
- OpenAPI 스키마 검증과 JS 스모크 스크립트는 템플릿 후속 작업으로 둔다(레포에 스크립트가 없으면 이 섹션은 “planned”로 간주).

### Defaults
- JS 클라이언트는 기본으로 `openapi-client-axios`를 사용한다.

### Acceptance Criteria
- **AC-1:** Web 인증 경로는 `200 + Set-Cookie` 응답이며 JSON 본문 토큰 비노출로 문서화된다.
- **AC-2:** App 인증 경로는 토큰 JSON 응답이며 쿠키 비의존 계약으로 문서화된다.
- **AC-3:** 401/403 응답은 `WWW-Authenticate`와 `ErrorResponse` 스키마를 일관 적용한다.
- **AC-4:** JS 클라이언트 예제가 `openapi-client-axios`로 Web/App 인증 경로를 호출한다.

### Tasks
- T1: Web/App 분리 인증 보안 스키마 정의(cookieAuth, bearerAuth).
- T2: StandardResponse/ErrorResponse 스키마와 `WWW-Authenticate` 추가.
- T3: Web 쿠키 권한 경로 Origin/Referer 검증 정책 문서화.
- T4: Web 로그인 `200 + Set-Cookie(토큰 비노출)` 응답 문서화.
- T5: App 로그인 `200 + token JSON(쿠키 비사용)` 응답 문서화.
- T6: `servers`, `x-tagGroups`, `operationId` 값 추가.
- T7: `openapi-client-axios` 코드 샘플 추가.
- T8: (선택) 릴리스 체크리스트에 OpenAPI 검증과 JS 스모크 테스트 포함.
- T9: Swagger UI 예제는 최소화하고 자격 증명은 숨긴다.
