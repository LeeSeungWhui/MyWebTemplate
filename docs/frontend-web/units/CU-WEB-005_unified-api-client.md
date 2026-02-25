---
id: CU-WEB-005
name: Unified API Client (apiJSON/apiRequest)
module: web
status: in-progress
priority: P1
links: [CU-BE-001, CU-BE-005, CU-WEB-001, CU-WEB-004, CU-WEB-006]
---

### Purpose
- SSR/CSR 공통 통신 계층(`apiJSON`/`apiRequest`)으로 쿠키/401/프록시 규약을 일원화한다.
- Web 클라이언트는 인증 토큰 문자열을 직접 소비하지 않고, 세션 동기화는 `/api/v1/auth/me`로 고정한다.

### Scope
- 포함
  - Runtime 유틸: `app/lib/runtime/api.js` — `apiRequest`(Response) / `apiJSON`(JSON)
  - OpenAPI(operationId) 유틸: `app/lib/runtime/openapiClient.js`
  - BFF 프록시: `/api/bff/*` 경유(쿠키/도메인 재작성)
  - 응답 스키마: `{status,message,result,count?,code?,requestId}` 강제
  - 오류 정책: 401(리프레시 1회→재시도→실패 시 로그인 리다이렉트)
  - 선택: `useSwr`(SWR 래퍼)
- 제외
  - TypeScript/백그라운드 리프레시 고도화
  - App 전용 토큰 계약(`/api/v1/auth/app/*`) 소비

### Interface
- Export
  - Runtime: `apiRequest`, `apiJSON`, `apiGet/post/put/patch/delete`
  - OpenAPI: `openapiRequest`, `openapiJSON`
  - Hook(optional): `useSwr(key, path, options)`

- 요청 규약
  - 모든 요청은 `credentials:'include'` 고정(Web 쿠키)
  - 세션 조회는 `/api/v1/auth/me` 기준으로 동기화
  - 로그인(`/api/v1/auth/login`) 2xx 응답은 쿠키 발급 성공 여부만 사용
  - 로그인/리프레시 응답 본문의 `accessToken`/`refreshToken` 소비 금지
  - 401 수신 시 `/login?next=현재경로&reason=...` 이동(루프 방지: `/login`에서는 미동작)
    - 미들웨어가 `reason`을 httpOnly `auth_reason` 쿠키로 변환하고 URL을 `/login`으로 정리

- 응답/오류 규약
  - 성공: 표준 응답 스키마 + requestId 로깅
  - 실패:
    - 401 → refresh 1회 후 실패 시 로그인 리다이렉트
    - 4xx/5xx → `ApiError` throw(`{statusCode, code, requestId, path, body}`)

### Data & Rules
- SWR 키: `'session'` 또는 `['auth','me']`
- 보안: 로컬스토리지/메모리 장기 토큰 저장 금지(Web)
- 오픈 리다이렉트 방지: `next` 내부 경로만 허용
- App 전용 토큰 계약은 `/api/v1/auth/app/*`에서 별도 운영(웹 코드에서 호출 금지)

### NFR
- 추가 오버헤드(P95): 요청 < 5ms(헬퍼 레벨)
- 네트워크 실패 백오프: 최대 2회, 멱등 GET 한정
- 번들 최적화: 클라이언트에서 불필요한 OpenAPI 메타 로드 금지

### Acceptance Criteria
- AC-1: 모든 요청에서 `credentials:'include'`가 적용된다.
- AC-2: 로그인 2xx 후 `/api/v1/auth/me` 재조회로 세션 상태가 확정된다.
- AC-3: 로그인/리프레시 응답 본문 토큰을 웹 클라이언트가 읽지 않는다.
- AC-4: 401 수신 시 refresh 1회 후 실패하면 `/login?next=...&reason=...`로 리다이렉트된다.
- AC-5: SSR/CSR 경로 모두에서 에러/리다이렉트 정책이 일관 동작한다.

### Tasks
- T1: `apiRequest/apiJSON` 직렬화/헤더/에러 정규화 유지
- T2: 로그인/리프레시 성공 후 `/api/v1/auth/me` 동기화 규약 적용
- T3: 로그인/리프레시 응답 본문 토큰 필드 의존 제거
- T4: BFF 프록시(Set-Cookie 재작성, /api/bff 경로 매칭) 규약 검증
- T5: 401 리다이렉트 + `reason` 쿠키 정리 플로우(CU-WEB-008) 검증
- T6: 테스트: 200 로그인, 401→refresh→login, 422/429 에러 맵핑

### Notes
- JavaScript Only, Next App Router 기준.
- App 전용 토큰 계약은 Web 유닛 범위 밖이며 `docs/frontend-app/units/CU-APP-001_auth-login-page.md`에서 관리한다.
