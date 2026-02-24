---
id: CU-APP-001
name: Auth & Login Page
module: app
status: planned
priority: P1
links: [CU-APP-004, CU-APP-005, CU-APP-007, CU-APP-008, CU-BE-001]
---

### Purpose
- 모바일에서 Bearer 토큰 기반 로그인 화면을 제공하고, 성공 시 보호 스택으로 진입한다.
- 401/422/429/5xx를 코드 기반 UX로 통일해 로그인 실패 경험을 안정적으로 관리한다.

### Scope
- 포함
  - 로그인 UI(입력 검증/오류/로딩 상태)
  - 백엔드 인증 API 연동(`/api/v1/auth/login`, `/api/v1/auth/me`, `/api/v1/auth/logout`)
  - Access 토큰 저장(Expo SecureStore) + 세션 캐시(메모리/AsyncStorage)
  - 401 처리(토큰 파기 후 로그인 스택 전환), 코드/requestId 노출 정책
  - 포그라운드 복귀 시 세션 재검증(CU-APP-008 연동)
- 제외
  - 소셜 로그인, OTP/2FA
  - 앱 기본 범위에서 쿠키 기반 refresh 의존 구현(확장 항목으로 분리)

### Interface
- UI
  - 필드: `username`, `password`, `rememberMe`(선택)
  - 버튼: `로그인`
  - 상태: 로딩/오류/재시도
- API
  - `POST /api/v1/auth/login`
    - req: `{ username: string, password: string, rememberMe?: boolean }`
    - res 200: `{ status:true, result:{ accessToken, tokenType, expiresIn, refreshExpiresIn }, requestId }`
    - res 401/422/429: `{ status:false, code, message, requestId }`
  - `GET /api/v1/auth/me`
    - req: `Authorization: Bearer <accessToken>`
    - res 200: `{ status:true, result:{ username }, requestId }`
    - res 401: `{ status:false, code:"AUTH_401_INVALID", ... }`
  - `POST /api/v1/auth/logout`
    - res 204

### Data & Rules
- 주요 데이터모델(JSON)
{
  "auth": {
    "accessToken": "string",
    "tokenType": "bearer",
    "expiresIn": 3600,
    "refreshExpiresIn": 604800,
    "remember": false
  }
}
- 비즈니스 규칙
  - Access 토큰은 SecureStore에 저장하고 요청 시 `Authorization` 헤더로 주입한다.
  - 앱 기본 템플릿은 refresh 쿠키 비의존 전략으로, Access 만료 시 `/api/v1/auth/me` 401 기준 재로그인을 기본 정책으로 둔다.
  - `AUTH_401_INVALID`, `AUTH_422_INVALID_INPUT`, `AUTH_429_RATE_LIMIT`는 CU-APP-007 코드 사전으로 매핑한다.
  - 로그인/로그아웃/포그라운드 전환 시 `['auth','session']` 키를 무효화한다.

### NFR & A11y
- 성능 목표: 로그인 응답 P95 < 400ms, UI 반응 < 100ms
- 접근성: 레이블/에러 연결, 버튼 터치영역 44x44 이상
- i18n: 코드 기반 문구 매핑, 서버 원문 직노출 금지

### Acceptance Criteria
- AC-1: 유효한 자격증명 로그인 시 Access 토큰이 SecureStore에 저장되고 AppStack으로 이동한다.
- AC-2: 잘못된 자격증명(401)은 `code/requestId`를 포함한 오류 상태로 표시된다.
- AC-3: 429 수신 시 재시도 대기 UI가 표시되고 즉시 재시도가 제한된다.
- AC-4: 포그라운드 복귀 시 `/api/v1/auth/me` 재검증이 수행되며 만료면 로그인으로 전환된다.
- AC-5: 로그아웃 시 토큰/세션 캐시가 제거되고 AuthStack으로 전환된다.

### Tasks
- T1: 로그인 폼/검증/에러 상태 구현
- T2: `/api/v1/auth/login` + `/api/v1/auth/me` + `/api/v1/auth/logout` 연동
- T3: SecureStore 저장/파기 유틸 구현
- T4: 401 전역 처리와 네비게이션 가드(CU-APP-004) 연동
- T5: 코드 사전 기반 오류 문구 매핑(CU-APP-007)
- T6: 로그인 성공/실패/만료/로그아웃 시나리오 스모크 작성
