---
id: CU-WEB-006
name: SSR/CSR Runtime Switch
module: web
status: planned
priority: P1
links: [CU-WEB-001, CU-WEB-002, CU-WEB-004, CU-WEB-005, CU-WEB-008, CU-BE-001]
---

### Purpose
- 페이지 단위로 SSR / ISR / CSR을 전환할 수 있는 런타임 규약을 제공한다.
- 인증(쿠키), 캐시, 에러 처리까지 ENV 기반 기본 전략을 바꾸되, 페이지 로컬 설정이 최우선으로 동작한다.

### Scope
- 포함
  - 글로벌 전략(ENV): `NEXT_RUNTIME_MODE=ssr|isr|csr`, `NEXT_REVALIDATE_SECONDS`
  - 페이지 설정 항목: `revalidate`, `dynamic`, `runtime`, `fetchCache`(우선순위 명시)
  - 데이터 경계 규칙: SSR/ISR=서버 패칭, CSR=클라 패칭(SWR)
  - 보호 경로 기본 전략: SSR(nodejs) 우선(쿠키/가드)
  - 캐시/헤더 규칙: 세션/민감 데이터 `no-store`, 공용 ETag/304 전달
- 제외
  - 페이지 개별 최적화 코드(동적 import, 대형 차트 라이브러리 등은 예시 수준)

### Interface
- ENV: `NEXT_PUBLIC_API_BASE`
- 페이지 설정(개념 정의)
  - `revalidate`: 0(SSR) 또는 N(ISR)
  - `dynamic`: `force-dynamic` | `auto`
  - `runtime`: `nodejs` | `edge` (쿠키/세션 접근 필요 시 nodejs 권장)
  - `fetchCache`: `default-cache` | `force-no-store` | `only-no-store`
- 우선순위
  - 페이지 설정(해당 페이지 선언)
  - 경로 정책(보호 경로는 기본 SSR/nodejs)
  - ENV 기본 전략(전역 모드)
  - 프레임워크 기본값

### Data & Rules
- 모드별 데이터 경계
  - SSR: 서버 컴포넌트에서 패칭 후 클라로 props 전달. 보호 경로/대시보드 기본값
  - ISR: 변동 적은 데이터에 지정. `revalidate=NEXT_REVALIDATE_SECONDS` 권장. 세션 종속 데이터 금지
  - CSR: 무거운 위젯·상호작용 위주. 클라에서 SWR로 패칭/캐시
- 보호 경로 규칙(필수)
  - 기본 SSR + `runtime='nodejs'`. 미들웨어/서버 가드와 합의 필요(CU-WEB-004, CU-WEB-008)
  - `/api/v1/auth/session`은 `Cache-Control: no-store`(CSR에선 SWR 캐시 비활성)
- 캐시/헤더
  - 세션/개인 데이터는 `no-store`, ETag 비사용
  - 공용 데이터는 ETag 사용, SSR은 304를 그대로 전달, CSR은 SWR 키에 버전/ETag 반영 가능
- 에러/리다이렉트
  - 401 수신 시 모드와 무관하게 `/login`으로 전환(SSR=서버 리다이렉트, CSR=클라 처리)
  - 403(CSRF) 시 CSRF 발급 UX(links: CU-BE-001, CU-WEB-005)

### Defaults
- 기본: 보호 페이지 SSR(nodejs)
- 세션 요청: `fetchCache='only-no-store'`

### NFR
- 모드 전환 시 ENV 변경만으로 페이지가 정상 동작(가드/캐시/리다이렉트 일관)
- 성능 목표: SSR 최초진입 LCP < 2.5s(로컬), ISR 리빌드 중 UX 저하 최소

### Acceptance Criteria
- AC-1: `NEXT_RUNTIME_MODE=ssr`에서 보호 페이지가 SSR(nodejs)로 렌더되고, 미들웨어/서버 가드로 깜빡임 없이 동작한다.
- AC-2: `NEXT_RUNTIME_MODE=isr` + `NEXT_REVALIDATE_SECONDS=N`에서 공용 위젯은 ISR로 갱신되고, 세션 종속 위젯은 CSR로 분리된다.
- AC-3: `NEXT_RUNTIME_MODE=csr`에서도 가드/리다이렉트 정책이 동일하게 적용되고, 세션 API는 `no-store`다.
- AC-4: 페이지 로컬 설정(`revalidate/dynamic/runtime/fetchCache`)이 ENV보다 우선하여 기대 모드로 동작한다.
- AC-5: 401/403 처리 흐름이 모드와 무관하게 동일(401→/login, 403→CSRF 발급 UX).
- AC-6: Lighthouse 점검에서 모드 전환에 따른 핵심 지표 변화가 문서화된다(LCP/CLS/INP).

### Tasks
- T1 헬퍼: `lib/runtime.js` — 전역 전략 파싱, ENV→페이지 기본값 매핑, 우선순위 로직
- T2 라벨링: 라우트/페이지 모드 레벨 부여(보호/공개, SSR/ISR/CSR)
- T3 예제 페이지: `/dashboard(SSR)`, 공용 리스트(ISR), 무거운 위젯(CSR) 3종 구성
- T4 캐시 규약 문서: 세션/개인 `no-store`, 공용 ETag/304 전달 규칙
- T5 에러/리다이렉트 공통 핸들러: SSR/CSR 동일 동작(CU-WEB-005와 합의)
- T6 테스트: ENV 모드 전환, 로컬 페이지 설정, SSR 강제, ISR revalidate, 401/403 처리
- T7 문서: 모드 선택 가이드(SSR/ISR/CSR 언제 쓸지), 체크리스트(세션+ISR 금지 등)

### Notes
- 기술: JavaScript Only, Next 15(App Router), 기본 nodejs.
- ENV: `NEXT_PUBLIC_API_BASE`, `NEXT_RUNTIME_MODE`, `NEXT_REVALIDATE_SECONDS`.
- 연계: 001(로그인), 002(대시보드), 004(가드), 005(API 클라), 008(미들웨어).
- 금지: 세션 종속 데이터의 ISR, 보호 페이지에서 `credentials` 생략, 엣지에서 Node 의존 모듈 사용.
