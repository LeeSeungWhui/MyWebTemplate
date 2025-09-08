---
id: CU-WEB-006
name: Page-level SSR/CSR Mode Convention
module: web
status: in-progress
priority: P1
links: [CU-WEB-001, CU-WEB-002, CU-WEB-004, CU-WEB-005, CU-WEB-008, CU-BE-001]
---

### Purpose
- 전역 ENV 스위치 없이 페이지 내부 상수 `MODE = 'SSR' | 'CSR'`만으로 렌더링·데이터 패치 모드를 결정하는 규약을 정의한다.
- 인증(쿠키), 캐시, 에러 처리에서 SSR/CSR 간 일관된 경험을 제공한다.

### Scope
- 포함
  - 페이지 상수: `MODE = 'SSR' | 'CSR'`
  - 페이지 설정: `revalidate`, `dynamic`, `runtime`, `fetchCache`(선언 시 페이지가 ENV보다 우선)
  - 경계 규칙: SSR=서버 패치, CSR=클라 패치(SWR)
  - 보호 경로 기본 전략: SSR(nodejs)
  - 캐시/헤더 규칙: 세션/민감 데이터 `no-store`
- 제외
  - ENV 기반 모드 스위치(NEXT_RUNTIME_MODE) — 사용하지 않음
  - ISR — MVP 범위에서 제외

### Interface
- ENV: `NEXT_PUBLIC_API_BASE`
- 페이지 설정(필요 시 선언)
  - `revalidate`: 0(SSR)
  - `dynamic`: `force-dynamic` | `auto`
  - `runtime`: `nodejs` | `edge` (쿠키 접근 필요 시 nodejs 권장)
  - `fetchCache`: `only-no-store` 권장(세션 종속 데이터)
- 우선순위
  - 페이지 설정(해당 파일 선언)
  - 경로 정책(보호 기본 SSR/nodejs)

### Data & Rules
- SSR: 서버 컴포넌트에서 패치 후 HTML에 반영(SEO). 보호/개인 데이터 기본.
- CSR: 무거운 위젯·상호작용 위주. 클라이언트에서 SWR로 패치/캐시.
- 보호 경로 규칙(필수)
  - 기본 SSR + `runtime='nodejs'`. 미들웨어/서버 가드 필요(CU-WEB-004, CU-WEB-008)
  - `/api/v1/auth/session`은 `Cache-Control: no-store`
- 에러/리다이렉트
  - 401: 모드 무관 `/login` 전환(SSR=서버 리다이렉트, CSR=클라 처리)
  - 403(CSRF): CSRF 발급 UX 연동(CU-BE-001, CU-WEB-005)

### Defaults
- 보호 페이지: SSR(nodejs)
- 세션 요청: `fetchCache='only-no-store'`

### Acceptance Criteria
- AC-1: `MODE` 변경만으로 SSR↔CSR 전환이 동작한다(빌드/ENV 의존 없음).
- AC-2: 보호 페이지는 SSR(nodejs)에서 깜빡임 없이 동작한다.
- AC-3: 401/403 핸들링이 SSR/CSR에서 일관(401→/login, 403→CSRF UX).
- AC-4: 페이지 로컬 설정(`revalidate/dynamic/runtime/fetchCache`)이 존재하면 이를 우선 적용한다.

### Tasks
- T1 가이드: `MODE` 보일러플레이트 스니펫 배포
- T2 적용: 로그인/보호 레이아웃/대시보드에 패턴 확산
- T3 문서: ENV 스위치/ISR 언급 제거, 캐시 규칙 보강

### Notes
- 기술: JavaScript Only, Next 15(App Router), 기본 nodejs.
- 연계: 001(로그인), 004(가드), 005(API 클라), 008(미들웨어).

