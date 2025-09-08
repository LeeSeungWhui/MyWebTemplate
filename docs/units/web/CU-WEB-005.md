---
id: CU-WEB-005
name: API Client (OpenAPI JS 연동)
module: web
status: in-progress
priority: P1
links: [CU-BE-001, CU-BE-005, CU-WEB-001, CU-WEB-004, CU-WEB-006]
---

### Purpose
- OpenAPI 스키마 기반으로 JS용 API 클라이언트를 구성하고, 쿠키 세션 모드에 맞는 오류/보안/캐시 규약을 지킨다.
- SSR/ISR/CSR 어디서 호출하든 응답 스키마/리다이렉트/에러 처리 정책이 일관되게 동작한다.

### Scope
- 포함
  - 라이브러리: openapi-client-axios (JS only)
  - 요청 헬퍼: baseURL, credentials:'include', 공통 헤더, Abort 처리
  - 응답 스키마: {status,message,result,count?,code?,requestId} 강제
  - 오류 정책: 401/403/422/5xx 처리 규칙(리다이렉트/토스트)
  - CSRF: 비멱등 메서드에 X-CSRF-Token 자동 주입(쿠키 모드, 미존재 시 발급 UX)
  - SWR 규약: 키 체계/무효화(로그인·로그아웃·프로필 변경)
- 제외
  - TypeScript/백그라운드 리프레시 고도화(차기)

### Interface
- Export
  - API 클라이언트 모듈(생성기 + 요청 헬퍼)
  - SWR 훅(예시): useSession(), useProfile(), useList(queryKey)
- ENV: `NEXT_PUBLIC_API_BASE`
  - NEXT_RUNTIME_MODE (ssr|isr|csr)
  - NEXT_REVALIDATE_SECONDS (ISR 기본값)
- 요청 규약
  - 모든 요청은 credentials:'include' 고정(쿠키 세션)
  - 세션 조회(/api/v1/auth/session)는 Cache-Control: no-store
  - 로그인(/api/v1/auth/login) 204(No Content) 처리(바디 없음)
- 응답/오류 규약
  - 성공: 응답 스키마 준수 + 요청ID 로깅
  - 실패:
    - 401 → /login 리다이렉트 + code/requestId 표시
    - 403(CSRF) → CSRF 발급 UX 유도
    - 422 → 필드 맵핑(VALID_422_*)
    - 5xx → 공통 오류 토스트 + 콘솔 requestId

### Data & Rules
- CSRF: 발급 라우트 `/api/v1/auth/csrf` (CU-BE-001), 메모리 우선. 비멱등 요청 자동 주입.
- SWR 키: ['auth','session'], ['profile'], ['list', endpoint, params]
- 로깅/관측성: 모든 실패 응답에 requestId 기록(콘솔/로거)
- 보안: 로컬스토리지 민감정보 금지, 쿠키 인증만 사용
- 오픈 리다이렉트 방지: next 쿼리의 경로 화이트리스트(CU-WEB-004)

### NFR
- 추가 오버헤드(P95): 요청 < 5ms(헬퍼/스키마 적용, 로컬)
- 네트워크 실패 백오프: 최대 2회, 멱등 GET 한정
- 번들 최적화: 클라이언트 측에서 불필요한 OpenAPI 메타 로드 금지

### Acceptance Criteria
- AC-1: NEXT_PUBLIC_API_BASE 설정 후 모든 요청에서 credentials:'include'가 적용된다.
- AC-2: 로그인 204가 정상 처리되고, 이후 세션 응답에서 authenticated=true가 반환된다.
- AC-3: 실패 응답이 스키마화되고 401/403/422가 올바르게 매핑된다.
- AC-4: useSession/useProfile이 로그인/로그아웃/변경에 맞춰 SWR 무효화가 반영된다.
- AC-5: SSR/CSR 경로 모두에서 에러/리다이렉트 정책이 일관 동작한다.
- AC-6: CI에서 OpenAPI 스키마 로드/샘플 호출 스모크가 통과한다.

### Tasks
- T1 결정/근거: openapi-client-axios 선택 및 쿠키/헤더/번들 최적화 기록
- T2 요청 헬퍼: baseURL/credentials/Abort/기본 헤더/204 처리 규칙 정의
- T3 응답/오류 맵핑: 스키마화 + AUTH_*/VALID_422_* 코드 처리
- T4 CSRF 주입: 비멱등 요청 X-CSRF-Token 자동 첨부 + 실패 시 발급 리트라이
- T5 SWR 규약: useSession/useProfile/useList 규약 + 무효화 구현
- T6 SSR 연동: 서버 컴포넌트/세션에서 공통 헬퍼 사용 규칙 문서화(쿠키 전달)
- T7 시나리오: 204 로그인, 401→login, 403 발급, 422 맵핑, SWR 무효화, Abort 동작
- T8 문서: ENV/요청 규약/리다이렉트/오류 코드 및 최소 로깅

### Defaults
- 라이브러리: openapi-client-axios (예정)
- CI 스모크: openapi-client-axios로 /healthz 또는 /api/v1/auth/session 호출 확인

### Notes
- 기술: JavaScript Only, Next 15(App Router), 기본 nodejs(쿠키/세션), 경로별 edge 가능
- 백엔드 연계: CU-BE-001(인증), CU-BE-005(문서)와 1:1 맞춤; /api/v1 고정, 응답 스키마 일치
- 호출 규약: SWR 영역과 credentials:'include' 강제, 비멱등 CSRF 필수

### Implementation Notes
- `app/lib/runtime/ssr.jsx`와 `csr.jsx`에 기본 fetch 래퍼와 `postWithCsrf`가 구현되어 있다.
- OpenAPI 클라이언트(openapi-client-axios) 연동과 오류 맵핑은 아직 미구성 상태다.
