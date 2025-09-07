---
id: CU-WEB-001
name: Auth & Login Page
module: web
status: draft
priority: P1
links: [CU-BE-001, CU-WEB-004, CU-WEB-005, CU-WEB-008]
---

### Purpose
- Web(쿠키 세션) 로그인 화면/흐름을 구현하고 백엔드 `/api/v1/auth/*` 및 표준 응답 스키마와 연동한다.
- 로그인 성공 시 204 + Set-Cookie 처리 및 보호 경로 무깜빡임 진입을 보장한다.

### Scope
- 포함
  - 로그인 폼(아이디/비밀번호/기억하기), 기본 유효성/에러 UX, 비밀번호 표시 토글
  - API 연동: `POST /api/v1/auth/login`(204), `GET /api/v1/auth/session`, `POST /api/v1/auth/logout`
  - 쿠키 플로우: `credentials:'include'` 고정, 비멱등 요청 시 `X-CSRF-Token` 주입(로그아웃 등)
  - 리다이렉트: `next=/protected` 지원(유효 경로만 허용)
  - A11y: 레이블/에러 ARIA 연결, 오류/토스트 관리
- 제외
  - 소셜 로그인/비밀번호 초기화/2FA(차기)
  - Bearer 토큰 저장(금지)

### Interface
- 라우팅(UI)
  - `GET /login`(공개): 로그인 UI. 인증이면 `/`로 302(미들웨어 처리, links: CU-WEB-008)
  - (보조) 로그아웃 버튼 → `POST /api/v1/auth/logout` 호출 후 `/login` 이동
- API(백엔드 연동 규약 요약)
  - `POST /api/v1/auth/login` → 204 No Content + `Set-Cookie: sid=...`
  - `GET  /api/v1/auth/session` → `{ status, result:{ authenticated, userId?, name? }, requestId }`
  - `POST /api/v1/auth/logout` → 204 (쿠키 플로우는 `X-CSRF-Token` 필요)
- 데이터 경계
  - 서버 가드: 서버 컴포넌트/미들웨어에서 세션 판정 → 미인증 보호경로 접근 시 `/login`으로 302
  - 클라 데이터: SWR로 `/api/v1/auth/session` 캐시(로그인/로그아웃 시 무효화)

### Data & Rules
- 폼 모델: `{ username: string, password: string, rememberMe?: boolean }`
- 유효성: `username` 최소 3자, `password` 최소 8자, 입력 에러 표시
- 보안/정책
  - 로그인 API는 CSRF 제외(쿠키 설정 목적), 그 외 비멱등은 `X-CSRF-Token` 필수
  - 에러 메시지 모호화(계정/비번 구분 금지), 레이트리밋 문구 별도
  - 오픈 리다이렉트 방어: `next`는 유효 경로만 허용(무효는 `/` 백)
  - 쿠키 세션 사용, 토큰/민감정보 로컬스토리지 저장 금지

### NFR & A11y
- 성능: TTI < 2.5s, 로그인 API P95 < 400ms(백엔드 기준)
- 안정성: 실패 UX(토스트 에러), 입력값 보존
- 접근성: 레이블/에러 `aria-describedby`, 오류 요약/포커스 이동, 콘트라스트 4.5:1+

### Acceptance Criteria
- AC-1: 유효 자격 증명 시 `POST /api/v1/auth/login` 204 수신, 쿠키 설정. `next`가 있으면 해당 경로로, 없으면 `/` 이동.
- AC-2: 잘못된 자격 증명 시 401 + `{status:false, code:'AUTH_401_INVALID', requestId}` 파싱, 사용자 에러 노출(문구 모호화).
- AC-3: 인증 상태는 `/api/v1/auth/session`에서 `authenticated=true`로 보호 페이지 렌더, 미인증은 `/login`으로 서버 리다이렉트(깜빡임 없음).
- AC-4: 로그아웃 시 `POST /api/v1/auth/logout` 204 후 쿠키 제거, `/login` 이동(쿠키 플로우는 `X-CSRF-Token` 필수).
- AC-5: A11y — 스크린리더에 레이블/에러가 읽히고, 포커스가 올바르며, Enter 제출 가능.
- AC-6: 보안 — `next`는 유효한 URL 경로만 허용, 무효는 `/` 백.

### Tasks
- T1: `/login` 페이지 마크업(입력 2 + 체크박스 1 + 제출) 및 상태(loading/disabled) 구현
- T2: API 래퍼(JS-only) 연결: `credentials:'include'`, 204 처리 및 에러 파싱
- T3: 서버 가드(CU-WEB-008): 인증 시 `/login` 접근 302 `/`, 미인증 보호경로 접근 302 `/login`
- T4: `next` 파라미터 처리(유효경로 검증 + 기본 리다이렉트 `/`)
- T5: 에러 코드 맵핑 및 사용자 메시지 표준(예: `AUTH_401_INVALID`, `AUTH_429_RATE_LIMIT`)
- T6: CSRF 토큰 발급/주입(로그아웃 등 비멱등 요청 시, 로그인 요청은 예외)
- T7: SWR 캐시 무효화 규칙: 로그인/로그아웃 시 세션 갱신
- T8: Storybook: 에러/로딩/비밀번호표시/다크모드 스토리
- T9: 테스트(Playwright/Vitest): 폼 유효성/204 처리/401 메시지/`next` 검증/가드 리다이렉트/로그인 흐름

### Notes
- ENV: `NEXT_PUBLIC_API_BASE`, `NEXT_RUNTIME_MODE`, `NEXT_REVALIDATE_SECONDS`
- 기본 runtime은 nodejs(쿠키 접근), 경로에 따라 edge 선택 가능
- UI 바인딩(EasyObj): value/onChange 규약 준수, 폼모델과 EasyObj 연결(SWR와 충돌 없게 분리)
