---
id: CU-APP-005
name: API Client (OpenAPI JS 연동)
module: app
status: draft
priority: P1
links: [CU-APP-001, CU-APP-002, CU-APP-003, CU-APP-004, CU-APP-007, CU-APP-008, CU-BE-001, CU-BE-005]
---

### Purpose
- OpenAPI 스키마 기반으로 모바일에서 사용하는 JS API 클라이언트를 제공한다. Bearer 토큰 주입, 표준 응답 스키마, SWR 연동, 전역 오류/가드 규약을 통합한다.

### Scope
- 포함
  - OpenAPI 스키마(/openapi.json) 기반 클라이언트 구성(openapi-client-axios 또는 동등 기능 라이브러리, 웹 CU-WEB-005 규약과 호환)
  - Bearer 토큰 주입(SecureStore) 및 만료/401 처리(전역 가드 연동, CU-APP-004)
  - 표준 응답 정규화 `{status, message, result, count?, code?, requestId}`(백엔드/웹 공통 스키마) → 클라이언트 내부 표현으로 매핑
  - SWR 어댑터: 재검증/무효화 규약, 204/304/캐시 처리
  - Retry/Abort: GET 한정 지수 백오프(최대 2회), AbortController 중복 취소
  - 환경/플랫폼 차이: EXPO_PUBLIC_API_BASE, Android 10.0.2.2 / iOS localhost
- 제외
  - TypeScript 도입(선택), 쿠키/CSRF 인증(미사용)

### Interface
- UI: N/A
- API: 모든 호출은 Client Core를 경유. 보호 자원 401은 전역 가드(CU-APP-004)로 위임. 비동기 POST/PUT/PATCH/DELETE는 자동 재시도 금지.

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
  - 성공 `{status:true, result:<result>, count?, requestId}`, 실패 `{status:false, code, message, requestId, httpStatus}`
  - 204는 `{status:true, result:null}`, 304는 캐시 유지 + 최신 requestId 반영
  - SWR 키 예시: ['auth','session'], ['header','current'], ['list', path, params]
  - 로그인/로그아웃/헤더 변경 시 관련 키 무효화, 복귀 시 재검증(CU-APP-008)
  - GET 실패만 지수 백오프 최대 2회, Retry-After 준수. 네트워크 코드 NET_* 매핑(CU-APP-007)
  - page, size, sort, order 명칭 통일, 목록 응답은 count 포함 권장

### NFR & A11y
- 성능 목표: 클라이언트 래핑 오버헤드 < 5ms(평균), 중복 요청 0
- 품질: 콘솔 에러 0, 민감정보 마스킹 로깅
- i18n: 서버 메시지 직노출 금지, 코드→문구 매핑 사용

### Acceptance Criteria
- AC-1: `/api/v1/auth/login`·`/api/v1/auth/refresh`·`/api/v1/auth/me` 호출이 클라이언트를 통해 성공/실패 모두 표준 응답으로 반환된다(CU-APP-001, CU-BE-001).
- AC-2: 보호 API 401 수신 시 토큰 파기→가드 전환(로그인)으로 이어진다(CU-APP-004).
- AC-3: 5xx/네트워크 오류가 규약에 맞는 실패 응답이 되고 code·requestId가 표기된다(CU-APP-007).
- AC-4: 204/304 처리와 SWR 캐시/무효화가 문서 규약대로 동작한다.
- AC-5: GET 자동 재시도가 과도하지 않고 비동기 요청에 적용되지 않는다.
- AC-6: 요청/응답 로깅이 기록되며 민감정보는 마스킹된다.

### Tasks
- T1: 라이브러리 결정(openapi-client-axios 기본)과 근거 기록
- T2: Client Core(스키마 로드/캐시, baseURL/헤더/인터셉터) 구현
- T3: Auth Hook(Bearer 주입, 401 핸들링) 구현(CU-APP-004)
- T4: Normalizer(성공/실패/204/304/코드 매핑) 구현(CU-APP-007)
- T5: SWR Adapter(재검증/무효화/복귀 연동) 구현(CU-APP-008)
- T6: Retry/Abort(GET만 백오프, 중복 취소) 구현
- T7: 로깅(requestId 추적, 마스킹 규칙) 구현
- T8: 성공/401/5xx/네트워크/204/304/재시도 시나리오 테스트
- T9: 사용 규약/에러 사전/환경 변수 문서화
