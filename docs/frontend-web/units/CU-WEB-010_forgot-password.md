---
id: CU-WEB-010
name: Forgot Password (Request Reset)
module: web
status: implemented
priority: P1
links: [CU-WEB-001, CU-WEB-004, CU-WEB-008, CU-WEB-005]
---

### Purpose
- 로그인 화면에서 “비밀번호 찾기”로 진입 가능한 **공개 페이지**(`/forgot-password`)를 제공한다.
- 템플릿에서 비밀번호 재설정 플로우의 UI/접근성/에러 UX 기준선을 문서화한다.
- 공개 퍼널 네비에서는 비노출하고, 템플릿 인증 경로의 보조 진입점으로 유지한다.

### Scope
- 포함
  - 공개 라우트: `GET /forgot-password`
  - 이메일 입력 + 기본 유효성(빈값/형식)
  - 제출 버튼(로딩/disabled) + 결과 UX(성공/실패 토스트 또는 안내 문구)
  - 로그인으로 돌아가기 링크
- 제외(차기)
  - 실제 이메일 발송/토큰 검증/새 비밀번호 설정 화면
  - CAPTCHA/고급 레이트리밋(운영 정책으로 별도 유닛 승격 가능)

### Interface
- 라우팅(UI)
  - `GET /forgot-password` (템플릿 경로; `frontend-web/app/common/config/publicRoutes.js` Allowlist에 포함)
- API(차기 계약 제안)
  - `POST /api/v1/auth/password-reset/request`
    - req: `{ email: string }`
    - res: 200 `{status:true}` (항상 성공 UX, 계정 존재 여부 노출 금지)

### Data & Rules
- 폼 모델(예시): `{ email: string }`
- 유효성: 이메일 형식 검사(기본 정규식), 빈값 금지
- 보안/정책
  - 응답은 계정 존재 여부를 절대 구분하지 않는다(“메일을 보냈다” 고정 문구)
  - 레이트리밋/감사로그는 백엔드 정책으로 처리(차기)
- i18n 규칙
  - 사용자 노출 문구(제목/입력 라벨/버튼/성공·실패 안내)는 하드코딩하지 않고 `lang.ko.js` 키로 렌더링한다.

### NFR & A11y
- 접근성
  - label/aria-describedby 연결(에러 문구)
  - Enter 제출 가능, 오류 시 포커스 이동
- UX
  - 성공/실패 안내는 토스트/인라인 중 하나로 단일화

### Acceptance Criteria
- AC-1: 비인증 상태에서 `/forgot-password`에 직접 접근해도 리다이렉트 없이 페이지가 렌더링된다(공개 라우트).
- AC-2: 이메일이 비어있거나 형식이 아니면 제출이 막히고, 에러가 화면에 표시된다.
- AC-3: 제출 성공/실패 모두 “계정 존재 여부를 구분하지 않는” 문구로 안내된다.
- AC-4: 키보드만으로 입력/제출/이동이 가능하고, 스크린리더가 레이블/에러를 읽을 수 있다.
- AC-5: `/forgot-password`의 사용자 노출 문구는 `lang.ko.js` 기반으로 렌더링되고 하드코딩 문자열이 없다.

### Tasks
- T1: `frontend-web/app/forgot-password/` 페이지 생성(권장: `initData.jsx`/`page.jsx`/`view.jsx`)
- T2: 공개 라우트 Allowlist에 `/forgot-password` 추가(`publicRoutes.js`)
- T3: (차기) 백엔드 API 계약 확정 및 연동(요청 엔드포인트/레이트리밋/감사로그)
- T4: 테스트(Vitest): 공개 라우팅, 폼 유효성, 제출 UX(성공/실패) 커버
- T5: 페이지 텍스트 키(타이틀/라벨/버튼/안내/에러)를 `lang.ko.js`로 분리하고 렌더링 적용

### Notes
- `/login`의 “비밀번호 찾기” 링크는 이 유닛이 구현되면 동작해야 한다.
