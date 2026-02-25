---
id: CU-WEB-001
name: Auth & Login Page (Web Cookie Contract)
module: web
status: in-progress
priority: P1
links: [CU-BE-001, CU-WEB-004, CU-WEB-005, CU-WEB-008, CU-WEB-010, CU-WEB-016]
---

### Purpose
- Web 로그인 화면/흐름을 쿠키 중심 계약으로 구현한다.
- 로그인/리프레시 응답 본문에서 토큰 문자열을 제거하고, 세션 상태는 `/api/v1/auth/me` 재조회로 동기화한다.

### Scope
- 포함
  - 로그인 폼(아이디/비밀번호/rememberMe), 기본 유효성/에러 UX, 비밀번호 표시 토글
  - 로그인 하단 보조 링크: `비밀번호 찾기`(`/forgot-password`), `회원가입`(`/signup`)
  - API 연동(웹 계약)
    - `POST /api/v1/auth/login` → Access/Refresh 쿠키 + 토큰 비노출 JSON
    - `POST /api/v1/auth/refresh` → Access/Refresh 회전 + 토큰 비노출 JSON
    - `POST /api/v1/auth/logout` → 204 + 쿠키 정리
  - 세션 동기화: 로그인/리프레시 성공 후 `GET /api/v1/auth/me` 재조회
  - 토큰 플로우: `credentials:'include'` 고정, Authorization 헤더는 BFF가 Access 쿠키에서 주입
  - 리다이렉트: `next=/protected` 지원(유효 경로만 허용, 없으면 `/dashboard`)
  - 공개 퍼널 노출 정책: `/login`은 공개 GNB/푸터에서 직접 노출하지 않는 템플릿 경로로 유지
- 제외
  - 소셜 로그인/2FA
  - App 전용 토큰 계약(`/api/v1/auth/app/*`) 클라이언트 구현

### Interface
- 라우팅(UI)
  - `GET /login`: 로그인 UI. 인증이면 `/dashboard`로 307(미들웨어 처리, links: CU-WEB-008)
  - 로그아웃 버튼 → `POST /api/v1/auth/logout` 후 `/login` 이동

- API(웹 계약)
  - `POST /api/v1/auth/login`
    - req: `{ username, password, rememberMe? }`
    - res: `200 JSON { tokenType:'cookie', expiresIn, refreshExpiresIn }` + Access/Refresh HttpOnly 쿠키
  - `POST /api/v1/auth/refresh`
    - req: Refresh 쿠키
    - res: `200 JSON { tokenType:'cookie', expiresIn, refreshExpiresIn }` + Access/Refresh 회전
  - `POST /api/v1/auth/logout`
    - res: 204 + 쿠키 만료
  - `GET /api/v1/auth/me`
    - req: Bearer(웹에서는 BFF가 쿠키→Bearer 주입)

- 데이터 경계
  - `/api/bff/*`가 쿠키를 받아 Authorization 헤더로 백엔드 호출
  - 401이면 refresh 1회 재시도 후 실패 시 `/login?next=...` 이동

### Data & Rules
- 폼 모델: `{ email: string(=backend username), password: string, rememberMe?: boolean }`
- 유효성: `email` 최소 3자 + 이메일 형식, `password` 최소 8자
- 보안/정책
  - Access/Refresh 쿠키: HttpOnly, SameSite=Lax, prod Secure
  - 로그인/리프레시 응답 본문의 `accessToken`/`refreshToken` 사용 금지
  - 세션 사용자 정보는 반드시 `/api/v1/auth/me`로 확정
  - 에러 메시지 모호화(계정/비번 구분 금지), 레이트리밋 문구 분리
  - 오픈 리다이렉트 방어: `next`는 유효 경로만 허용
- i18n 규칙
  - 사용자 노출 문구(라벨/버튼/에러/도움말)는 하드코딩하지 않고 `lang.ko.js` 키를 통해 렌더링한다.

### NFR & A11y
- 성능: TTI < 2.5s, 로그인 API P95 < 400ms
- 안정성: 실패 UX(토스트), 입력값 보존
- 접근성: 레이블/에러 ARIA 연결, 오류 포커스 이동, Enter 제출

### Acceptance Criteria
- AC-1: 유효 자격 증명 시 `POST /api/v1/auth/login` 2xx + Access/Refresh 쿠키 설정, JSON 본문에 토큰 문자열이 없다.
- AC-2: 로그인 성공 직후 `/api/v1/auth/me` 재조회로 사용자 상태가 동기화된다.
- AC-3: 잘못된 자격 증명 시 401 + `{status:false, code:'AUTH_401_INVALID', requestId}`를 사용자 오류로 노출한다.
- AC-4: Access 만료 시 refresh 1회 재시도 후 실패하면 `/login`으로 리다이렉트된다.
- AC-5: 로그아웃 시 204 후 인증 쿠키가 정리되고 `/login`으로 이동한다.
- AC-6: `next`는 유효한 내부 경로만 허용하고, 무효값은 `/dashboard`로 대체된다.
- AC-7: 로그인 페이지의 사용자 노출 문구는 `lang.ko.js` 기반으로 렌더링되며 하드코딩 문자열이 없다.

### Tasks
- T1: `/login` 페이지 마크업(입력 2 + 체크박스 1 + 제출) 및 loading/disabled 상태 구현
- T2: API 래퍼 연결: `credentials:'include'`, 로그인/리프레시 토큰 비노출 응답 처리
- T3: 로그인/리프레시 성공 직후 `/api/v1/auth/me` 재조회 동기화
- T4: 서버 가드(CU-WEB-008): 인증 시 `/login` 접근 307 `/dashboard`, 미인증 보호경로 접근 307 `/login`
- T5: `next` 파라미터 검증 및 기본 리다이렉트(`/dashboard`) 규약 적용
- T6: 에러 코드 맵핑(`AUTH_401_INVALID`, `AUTH_429_RATE_LIMIT`) 및 UX 문구 정렬
- T7: 테스트(Vitest): 폼 유효성/2xx 처리/401 메시지/`next` 검증/가드 리다이렉트/refresh 흐름
- T8: 로그인 하단 링크(`/forgot-password`, `/signup`) 노출 및 이동 검증
- T9: 로그인 페이지 텍스트 키(`title`, `label`, `error`, `helper`)를 `lang.ko.js`로 분리하고 렌더링 적용

### Notes
- API Base는 config.ini(`[API].base`)에서 로드하며, 프런트는 `/api/bff/*`로 호출한다.
- App 전용 토큰 계약은 `/api/v1/auth/app/*`에서 별도 운영한다(CU-APP-001).
