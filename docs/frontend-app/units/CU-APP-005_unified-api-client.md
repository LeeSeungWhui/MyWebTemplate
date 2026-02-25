---
id: CU-APP-005
name: API Client (OpenAPI JS 연동)
module: app
status: planned
priority: P1
links: [CU-APP-001, CU-APP-002, CU-APP-003, CU-APP-004, CU-APP-007, CU-APP-008, CU-BE-001, CU-BE-005, CU-BE-007, CU-BE-008]
---

### Purpose
- 모바일 앱의 API 호출을 단일 클라이언트 계층으로 통일한다.
- OpenAPI 스키마 기반 호출, Bearer 토큰 주입, 응답 정규화, 오류 코드 매핑을 한 곳에서 처리한다.

### Scope
- 포함
  - OpenAPI 스키마(`/openapi.json`) 기반 클라이언트 구성(openapi-client-axios)
  - Bearer 토큰 주입(SecureStore) + 401 공통 처리(CU-APP-004)
  - 표준 응답 정규화 `{status, message, result, count?, code?, requestId}`
  - Retry/Abort 정책(GET만 지수 백오프 최대 2회, 변이 요청 자동 재시도 금지)
  - 환경 변수 기반 baseURL(`EXPO_PUBLIC_API_BASE`)
- 제외
  - TypeScript 도입
  - 쿠키/CSRF 기반 인증

### Interface
- 공통 호출 방식
  - `apiJSON(operationIdOrPath, payload?, options?)`
  - `apiRequest(...)` (Response 제어가 필요한 경우)
- 대상 API
  - Auth(App): `/api/v1/auth/app/login`, `/api/v1/auth/app/refresh`, `/api/v1/auth/me`, `/api/v1/auth/app/logout`
  - Dashboard: `/api/v1/dashboard`, `/api/v1/dashboard/stats`
  - Profile: `/api/v1/profile/me`

### Data & Rules
- 주요 데이터모델(JSON)
{
  "response": {
    "status": true,
    "message": "success",
    "result": {},
    "count": 0,
    "requestId": "string",
    "code": "string?"
  }
}
- 비즈니스 규칙
  - 성공: `{status:true, result, count?, requestId}`
  - 실패: `{status:false, code, message, requestId, httpStatus}`
  - 204는 `{status:true, result:null}`로 정규화한다.
  - 401은 refreshToken 존재 시 `app/refresh` 1회 시도 후 재요청하고, 실패 시 전역 가드로 위임한다.
  - 로깅은 requestId 중심으로 추적하고 민감정보는 마스킹한다.

### NFR & A11y
- 클라이언트 오버헤드 평균 < 5ms
- 중복 요청 0, 콘솔 warning/error 0
- 오류 메시지는 코드 기반 번역을 우선한다

### Acceptance Criteria
- AC-1: Auth/Dashboard/Profile API가 공통 클라이언트로 호출된다.
- AC-2: 401 수신 시 토큰 파기와 가드 전환이 자동으로 동작한다.
- AC-3: 5xx/네트워크 오류가 규약화된 실패 객체로 반환된다.
- AC-4: GET 재시도가 최대 2회로 제한되고 Retry-After를 준수한다.
- AC-5: requestId 포함 구조적 로그가 남고 민감정보가 마스킹된다.

### Tasks
- T1: OpenAPI 클라이언트 초기화/operationId 매핑 구현
- T2: 인증 헤더 주입 인터셉터 구현
- T3: 성공/실패/204 정규화 유틸 구현
- T4: Retry/Abort 정책 구현(GET 전용)
- T5: SWR(선택) 연동용 fetcher/무효화 규약 정리
- T6: Auth/Dashboard/Profile 호출 스모크 테스트
