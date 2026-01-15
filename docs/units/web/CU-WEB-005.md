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
- 어디서 호출하든 응답 스키마/리다이렉트/에러 처리 정책이 일관되게 동작한다.
- 401(세션 만료) 글로벌 처리: `/login?next=현재경로`로 이동 → 미들웨어가 `nx` 쿠키로 정리.

### Scope
- 포함
  - Runtime 유틸: `app/lib/runtime/api.js` — `apiRequest`(Response) / `apiJSON`(JSON)
  - BFF 프록시: `/api/bff/*` 경유(쿠키/도메인 재작성)
  - 응답 스키마: {status,message,result,count?,code?,requestId} 강제
  - 오류 정책: 401(리프레시 1회→재시도→실패 시 로그인 리다이렉트), 그 외 상태코드는 호출자가 처리
  - 선택: `useSwr`(SWR 래퍼) — 키 체계/재검증/무효화 규약
- 제외
  - TypeScript/백그라운드 리프레시 고도화(차기)

### Interface
- Export
  - Runtime: `apiRequest`, `apiJSON`, `apiGet/post/put/patch/delete`
  - Hook(optional): `useSwr(key, path, options)`
- ENV: 전역 ENV 스위치 사용 안 함. Backend Host는 config.ini의 `[API].base` → `[APP].backendHost` 우선순위로 로드(getBackendHost)한다.
- 요청 규약
  - 모든 요청은 credentials:'include' 고정(쿠키 세션)
  - 세션 조회(/api/v1/auth/me)는 Cache-Control: no-store
  - 로그인(/api/v1/auth/login) 200 JSON 처리(Access/Refresh 쿠키 + body.result.access_token)
  - 401 수신 시 전역 인터셉터에서 `/login?next=현재경로`로 이동(루프 방지: `/login`에서는 미동작)
  - CSR 호출은 `/api/bff/*` 프록시를 통해 Backend API로 전달되고, `Set-Cookie`는 프론트 도메인으로 재작성된다
- 응답/오류 규약
  - 성공: 응답 스키마 준수 + 요청ID 로깅
  - 실패:
    - 401 → /login 리다이렉트 + code/requestId 표시
    - 4xx/5xx → `apiJSON`은 `ApiError`를 throw하고(호출자가 catch), `{code, requestId}`로 사용자 메시지를 매핑한다
      - `ApiError`: `{ statusCode, code, requestId, path, body }`

### Data & Rules
- SWR 키: 'session' (권장), 또는 ['auth','me'] 같은 배열 키(선택)
- 로깅/관측성: 모든 실패 응답에 requestId 기록(콘솔/로거)
- 보안: 로컬스토리지 민감정보 금지, 쿠키 인증만 사용
- 오픈 리다이렉트 방지: next 쿼리의 경로 화이트리스트(CU-WEB-004)

### NFR
- 추가 오버헤드(P95): 요청 < 5ms(헬퍼/스키마 적용, 로컬)
- 네트워크 실패 백오프: 최대 2회, 멱등 GET 한정
- 번들 최적화: 클라이언트 측에서 불필요한 OpenAPI 메타 로드 금지

### Acceptance Criteria
- AC-1: 모든 요청에서 credentials:'include'가 적용된다.
- AC-2: 로그인 200 JSON이 정상 처리되고, 이후 `/api/v1/auth/me` 응답에서 username이 반환된다.
- AC-3: 401 수신 시 refresh 1회→재시도 후 실패하면 `/login?next=...`로 전역 리다이렉트된다.
- AC-4: (선택) `useSwr` 사용 시 재검증/무효화 규약이 정상 동작한다.
- AC-5: SSR/CSR 경로 모두에서 에러/리다이렉트 정책이 일관 동작한다.
- AC-6: 로컬 스모크에서 `/healthz` 또는 `/api/v1/auth/me` 호출이 통과한다.

### Tasks
- T1 Runtime 유틸 설계: apiRequest/apiJSON 구조/직렬화 규약(EasyObj/EasyList 포함)
- T2 오류 맵핑: AUTH_*/VALID_422_* 코드 처리, 401 리다이렉트 규칙
- T3 BFF 프록시 연계: Set-Cookie 재작성, /api/bff 경로 매칭
- T4 (선택) `useSwr` 규약: 키 체계/무효화/재검증
- T5 SSR 연동: 서버 컴포넌트/세션에서 공통 유틸 사용 규칙 문서화
- T6 시나리오: 200 로그인, 401→login, 422 맵핑, 재검증 흐름
- T7 문서: ENV/요청 규약/리다이렉트/오류 코드 및 최소 로깅

### Defaults
- 로컬 스모크: `/healthz` 또는 `/api/v1/auth/me` 호출 확인

### Notes
- 기술: JavaScript Only, Next 15(App Router), 기본 nodejs(쿠키/세션), 경로별 edge 가능
- 백엔드 연계: CU-BE-001(인증), CU-BE-005(문서)와 1:1 맞춤; /api/v1 고정, 응답 스키마 일치
- 호출 규약: SWR 영역과 credentials:'include' 강제, 401은 전역 리다이렉트(리프레시 1회) 처리

### Implementation Notes
- `app/lib/runtime/api.js`에 SSR/CSR 통합 유틸이 구현되어 있다(`apiRequest`/`apiJSON`).
- 클라이언트에서 `/api/bff` 경유, 서버에서 쿠키/언어 포워딩 + no-store.
