---
id: CU-WEB-001
name: Auth & Login Page (Access/Refresh 쿠키 토큰)
module: web
status: in-progress
priority: P1
links: [CU-BE-001, CU-WEB-004, CU-WEB-005, CU-WEB-008]
---

### Purpose
- Access/Refresh 쿠키 기반 토큰 로그인 화면/흐름을 구현하고 백엔드 `/api/v1/auth/*` 및 표준 응답 스키마와 연동한다.
- 로그인 성공 시 Access/Refresh 쿠키 설정, 보호 경로 무깜빡임 진입, rememberMe에 따라 재시작 후 자동 로그인 여부를 제어한다.

### Scope
- 포함
  - 로그인 폼(아이디/비밀번호/rememberMe), 기본 유효성/에러 UX, 비밀번호 표시 토글
  - API 연동: `POST /api/v1/auth/login` → Access/Refresh 쿠키 + `{access_token,...}`, `POST /api/v1/auth/refresh` → Access/Refresh 회전, `POST /api/v1/auth/logout`
  - 토큰 플로우: `credentials:'include'` 고정, Authorization 헤더는 BFF가 Access 쿠키에서 주입
- 리다이렉트: `next=/protected` 지원(유효 경로만 허용, 없으면 `/dashboard`로 이동)
  - A11y: 레이블/에러 ARIA 연결, 오류/토스트 관리
- 제외
  - 소셜 로그인/비밀번호 초기화/2FA(차기)

### Interface
- 라우팅(UI)
  - `GET /login`(공개): 로그인 UI. 인증이면 `/`로 302(미들웨어 처리, links: CU-WEB-008)
  - (보조) 로그아웃 버튼 → `POST /api/v1/auth/logout` 호출 후 `/login` 이동
- API(백엔드 연동 규약 요약)
  - `POST /api/v1/auth/login` → 200 JSON + Access/Refresh HttpOnly 쿠키
  - `POST /api/v1/auth/refresh` → 200 JSON + Access/Refresh 회전
  - `POST /api/v1/auth/logout` → 204 (Refresh 쿠키 만료)
- 데이터 경계
  - 서버 가드: SSR/미들웨어에서 Access 쿠키→Authorization 헤더로 백엔드 호출. 401 시 `/auth/refresh` 1회 시도 후 실패면 `/login`.
  - 클라 데이터: SWR로 `/api/v1/auth/me` 또는 `/auth/refresh` 캐시(로그인/로그아웃 시 무효화)

### Data & Rules
- 폼 모델: `{ email: string(=backend username), password: string, rememberMe?: boolean }`
- 유효성: `email` 최소 3자 + 이메일 형식, `password` 최소 8자, 입력 에러 표시
- 보안/정책
  - Access/Refresh 쿠키: HttpOnly, SameSite=Lax, prod Secure. rememberMe=false → Refresh 세션 쿠키, true → 장기 max-age
  - 에러 메시지 모호화(계정/비번 구분 금지), 레이트리밋 문구 별도
- 오픈 리다이렉트 방어: `next`는 유효 경로만 허용(무효는 `/dashboard` 백)
  - 토큰/민감정보 로컬스토리지 금지(쿠키/헤더로만 사용)

### NFR & A11y
- 성능: TTI < 2.5s, 로그인 API P95 < 400ms(백엔드 기준)
- 안정성: 실패 UX(토스트 에러), 입력값 보존
- 접근성: 레이블/에러 `aria-describedby`, 오류 요약/포커스 이동, 콘트라스트 4.5:1+

### Acceptance Criteria
- AC-1: 유효 자격 증명 시 `POST /api/v1/auth/login` 2xx 수신, Access/Refresh 쿠키 설정. `next`가 있으면 해당 경로로, 없으면 `/dashboard` 이동.
- AC-2: 잘못된 자격 증명 시 401 + `{status:false, code:'AUTH_401_INVALID', requestId}` 파싱, 사용자 에러 노출(문구 모호화).
- AC-3: Access 만료 후 401 발생 시 `/api/v1/auth/refresh`로 재발급하여 재시도, 실패 시 `/login` 리다이렉트.
- AC-4: 로그아웃 시 `POST /api/v1/auth/logout` 204 후 Refresh 쿠키 삭제, `/login` 이동.
- AC-5: A11y — 스크린리더에 레이블/에러가 읽히고, 포커스가 올바르며, Enter 제출 가능.
- AC-6: 보안 — `next`는 유효한 URL 경로만 허용, 무효는 `/dashboard` 백.

### Tasks
- T1: `/login` 페이지 마크업(입력 2 + 체크박스 1 + 제출) 및 상태(loading/disabled) 구현
- T2: API 래퍼(JS-only) 연결: `credentials:'include'`, 2xx 처리 및 에러 파싱, Access/Refresh 쿠키 사용
- T3: 서버 가드(CU-WEB-008): 인증 시 `/login` 접근 302 `/`, 미인증 보호경로 접근 302 `/login` (401→refresh 재시도 포함)
- T4: `next` 파라미터 처리(유효경로 검증 + 기본 리다이렉트 `/dashboard`)
- T5: 에러 코드 맵핑 및 사용자 메시지 표준(예: `AUTH_401_INVALID`, `AUTH_429_RATE_LIMIT`)
- T6: Access 만료/401 인터셉트 → refresh→재시도 흐름 구현
- T7: SWR 캐시 무효화 규칙: 로그인/로그아웃/refresh 시 세션 상태 갱신
- T8: Docs 페이지: 에러/로딩/비밀번호표시/다크모드 시나리오 수록
- T9: 테스트(Vitest): 폼 유효성/2xx 처리/401 메시지/`next` 검증/가드 리다이렉트/refresh 흐름

### Notes
- ENV: 별도 전역 ENV 스위치 없음. API Base는 config.ini(`[API].base`)에서 로드(getBackendHost)하며, 프런트는 `/api/bff/*`를 통해 호출된다.
- 기본 runtime은 nodejs(쿠키 접근), 경로에 따라 edge 선택 가능
- UI 바인딩(EasyObj): value/onChange 규약 준수, 폼모델과 EasyObj 연결(SWR와 충돌 없게 분리)

### Implementation Notes
- `frontend-web/app/login/page.jsx`는 SSR에서 `apiJSON(SESSION_PATH)`으로 세션을 확인하고 `SharedHydrator`로 상태를 초기화한다.
- 로그인 요청은 `apiRequest('/api/v1/auth/login', { method:'POST', body })`로 처리한다(200 JSON). 성공 시 세션(`/api/v1/auth/me`)을 재확인한 뒤 `nx` 힌트 또는 `/dashboard`로 이동한다.
