---
id: CU-APP-001
name: Auth & Login Screen
module: app
status: draft
priority: P1
links: [CU-APP-004, CU-APP-005, CU-APP-007, CU-APP-008, CU-BE-001]
---

### Purpose
- 모바일에서 Bearer 토큰 기반 로그인 화면을 제공하고, 성공 시 보호 스택으로 진입하며 만료/실패 시 일관된 에러 UX를 보장한다.

### Scope
- 포함
  - 로그인 UI(검증/에러/로딩 상태)
  - 백엔드 CU-BE-001 인증 API(`/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/me`) 연동(앱 계정)
  - 토큰 저장(SecureStore, 필수) + 세션 캐시(AsyncStorage, 선택)
  - 401 처리(토큰 파기 후 로그인으로 이동), 에러 코드 규약 연동(code/requestId)
  - 포그라운드 복귀 시 세션 재검증 및 SWR 무효화
- 제외
  - 소셜 로그인, OTP/2FA(차기)
  - 쿠키/CSRF 기반 인증(미사용)

### Interface
- UI: ID/Password, Remember Me(선택), Sign-in 버튼, 오류/로딩 상태, 성공 시 Protected Stack 루트로 이동
- API
  - `POST /api/v1/auth/login`
    - req: `{ username: string, password: string, rememberMe?: boolean }`
    - res: 200 `{ status:true, result:{ access_token, refresh_token, token_type, expires_in, refresh_expires_in, remember }, requestId }`
    - 401/422: `{ status:false, code, message, requestId }` (`AUTH_401_INVALID`, `AUTH_422_INVALID_INPUT` 등, `WWW-Authenticate: Bearer`)
  - `POST /api/v1/auth/refresh`
    - req: 저장된 리프레시 토큰(구현 시 헤더/쿠키/바디 중 택1) 기반 요청
    - res: 200 로그인과 동일한 토큰 페이로드, 401 시 `{ status:false, code:"AUTH_401_INVALID", message, requestId }`
  - `GET /api/v1/auth/me`
    - req: `Authorization: Bearer <access_token>`
    - res: 200 `{ status:true, result:{ username }, requestId }`, 401 시 `{ status:false, code:"AUTH_401_INVALID", ... }`

### Data & Rules
- 주요 데이터모델(JSON)
{
  "auth": {
    "accessToken": "string",
    "refreshToken": "string",
    "tokenType": "bearer",
    "expiresIn": 3600,
    "refreshExpiresIn": 604800,
    "remember": false
  }
}
- 비즈니스 규칙
  - 토큰은 SecureStore에만 저장, AsyncStorage 저장 금지
  - `AUTH_401_INVALID`/`AUTH_429_RATE_LIMIT` 등 에러 코드는 공통 매핑(CU-APP-007) 사용, 429 시 `Retry-After` 헤더를 UX에 반영
  - 로그인/로그아웃/포그라운드 전환 시 ['auth','session'] 키 무효화

### NFR & A11y
- 성능 목표: 로그인 응답 P95 < 400ms, UI 반응 < 100ms, 콘솔 에러 0
- 접근성: 폼 레이블/에러 연결, 키보드 포커스 관리, 버튼 44×44
- i18n: 에러 문구 코드 기반 번역, 하드코딩 금지

### Acceptance Criteria
- AC-1: 유효한 자격증명으로 로그인 시 Access/Refresh 토큰이 SecureStore에 저장되고 보호 화면으로 이동한다.
- AC-2: 잘못된 자격증명은 401과 함께 `code`·`requestId`가 노출되며, 사용자 친화적 오류 문구를 보여준다(`AUTH_401_INVALID` 매핑).
- AC-3: 로그인 실패가 레이트리밋 한도를 초과하면 429 + `AUTH_429_RATE_LIMIT` + `Retry-After`를 수신하고, UX에 재시도 대기 시간이 표시된다.
- AC-4: 포그라운드 복귀 시 `/api/v1/auth/me`로 세션 재검증이 수행되고, 만료면 토큰 파기 후 로그인 화면으로 전환된다.
- AC-5: 5xx/네트워크 오류는 공통 에러 UX가 노출되고 재시도 가능하다.
- AC-6: 중복 제출 방지를 위해 로딩/비활성 상태가 규약대로 동작한다.

### Tasks
- T1: 입력/유효성 규칙, 오류 메시지 매핑, 로딩 상태 처리
- T2: `/api/v1/auth/login`·`/api/v1/auth/refresh`·`/api/v1/auth/me` 연동, 응답 파싱, 실패 코드 처리
- T3: SecureStore 토큰 저장/만료관리(UTC 기준, Access/Refresh 회전 포함)
- T4: 성공 시 Protected Stack 전환, 401 전역 핸들링 연동(CU-APP-004)
- T5: 로그인/로그아웃/포그라운드 시 ['auth','session'] 무효화
- T6: 요청 로깅 코드/message/requestId 포함(CU-APP-007)
- T7: 성공/실패/만료/포그라운드 기본 시나리오 시뮬레이션
- T8: 오류 코드 사전/UX 상태 다이어그램 문서화
