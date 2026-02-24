---
id: CU-WEB-016
name: Signup Page (Public, Login-linked)
module: web
status: implemented
priority: P1
links: [CU-WEB-001, CU-WEB-004, CU-WEB-005, CU-WEB-008, CU-WEB-010, CU-WEB-011, CU-BE-009]
---

### Purpose
- 공개 페이지 `/signup`을 제공해 템플릿의 기본 인증 진입 흐름(로그인/회원가입/비밀번호 찾기)을 완성한다.
- 회원가입 진입은 공개 GNB가 아니라 `/login` 하단 링크(`계정이 없으신가요? 회원가입`)로 통일한다.
- 공개 퍼널 메뉴에서는 비노출하고, 템플릿 인증 흐름의 보조 경로로 유지한다.

### Scope
- 포함
  - 공개 라우트: `GET /signup`
  - 로그인 페이지 하단 링크: `/login` → `/signup`
  - 폼 필드: 이름/이메일/비밀번호/비밀번호 확인/약관 동의
  - 프론트 유효성: 필수값, 이메일 형식, 비밀번호 최소 길이, 비밀번호 확인 일치, 약관 동의 체크
  - 회원가입 API 연동: `POST /api/v1/auth/signup`
  - 성공 후 로그인 페이지 이동 + 성공 안내 UX
- 제외(차기)
  - 이메일 인증/휴대폰 인증
  - 소셜 로그인 연동
  - CAPTCHA/봇 방어 고도화

### Interface
- 라우팅(UI)
  - `GET /signup` (템플릿 경로)
  - `/login` 내 링크 텍스트: `계정이 없으신가요? 회원가입`
- API(연동 계약)
  - `POST /api/v1/auth/signup`
    - req: `{ name, email, password }`
    - res(성공): `201` + `{ status:true, result:{ userId, userNm } }`

### Data & Rules
- 폼 모델(예시): `{ name: string, email: string, password: string, passwordConfirm: string, agreeTerms: boolean }`
- 유효성 규칙
  - `name`: 공백 제외 2자 이상
  - `email`: 기본 이메일 형식
  - `password`: 8자 이상
  - `passwordConfirm`: `password`와 동일
  - `agreeTerms`: `true` 필수
- 실패 메시지는 필드 단위 인라인으로 노출하고, 서버 오류는 Toast/Alert로 보강한다.
- 서버가 `409 AUTH_409_USER_EXISTS`를 반환하면 이메일 필드에 인라인 에러 `이미 사용 중인 이메일입니다.`를 표시한다.
- 성공 시 `/login`으로 이동하며, “회원가입이 완료되었습니다. 로그인해 주세요.” 안내를 표시한다.

### NFR & A11y
- 키보드만으로 입력/체크/제출/링크 이동이 가능해야 한다.
- 에러 메시지는 `aria-describedby`로 입력 필드와 연결한다.
- 제출 중 중복 클릭 방지(`loading/disabled`)를 적용한다.

### Acceptance Criteria
- AC-1: `/login` 화면 하단에 `계정이 없으신가요? 회원가입` 링크가 렌더링되고 클릭 시 `/signup`으로 이동한다.
- AC-2: 비인증 사용자가 `/signup` 직접 접근 시 리다이렉트 없이 페이지가 렌더링된다.
- AC-3: 필수값 누락/이메일 형식 오류/비밀번호 불일치/약관 미동의 상태에서는 제출이 차단되고 항목별 에러가 표시된다.
- AC-4: 유효한 입력으로 제출하면 `POST /api/v1/auth/signup` 요청이 1회 호출된다.
- AC-5: 가입 성공 시 `/login`으로 이동하고 성공 안내 문구가 노출된다.

### Tasks
- T1: `frontend-web/app/signup/` 페이지 추가(`initData.jsx`, `page.jsx`, `view.jsx` 권장).
- T2: `/login` 화면 하단에 회원가입 링크 추가.
- T3: 공개 경로 Allowlist(`publicRoutes.js`)에 `/signup` 반영.
- T4: Vitest로 링크 이동/유효성/성공·실패 UX 검증.
