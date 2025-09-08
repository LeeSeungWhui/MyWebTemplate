# Web (Next.js)

## 목적
- Next.js(App Router) 기반으로 UI 템플릿과 보호/공개 흐름을 제공한다.
- 전역 모드 스위치 없이, 페이지 내부 상수 `MODE = 'SSR' | 'CSR'`로 데이터 패치 방식을 통일한다.

## 기술 스택
- Node: v22.19.0
- Next.js: 15+ (App Router)
- React: 19
- Tailwind CSS: v4
- 상태/데이터: SWR
- 문서/테스트: Storybook 8+, Playwright/Vitest(선택)
- 언어: JavaScript Only (TypeScript 금지)

## 포함 Unit
- CU-WEB-001 Auth & Login Page
- CU-WEB-002 Dashboard (Cards/List/Stats Dummy)
- CU-WEB-003 UI Component Pack (EasyObj/EasyList 바인딩)
- CU-WEB-004 Routing & Guard (Protected Routes)
- CU-WEB-005 API Client (OpenAPI JS 연동)
- CU-WEB-006 Page-level SSR/CSR Mode Convention
- CU-WEB-007 Migration (Vite→Next)
- CU-WEB-008 Middleware Guard & Redirect
- CU-WEB-009 Data Fetch Strategy (Page MODE)

## 진행 현황(Units)
- CU-WEB-001: in-progress — 로그인 페이지에서 SSR/CSR 분기 패턴 가동, UX·A11y 보완 필요
- CU-WEB-002: planned — 카드/리스트 위젯 구성 예정
- CU-WEB-003: in-progress — 핵심 입력/리드온리 컴포넌트 보유, 바인딩 규약 정리 필요
- CU-WEB-004: in-progress — 미들웨어·서버 레벨 리다이렉트 구현, 파라미터/401 핸들링 보완 필요
- CU-WEB-005: in-progress — CSRF 주입 존재, OpenAPI 클라이언트 래핑 미적용
- CU-WEB-006: in-progress — 페이지 레벨 MODE 규약 확정(ENV 스위치 제거)
- CU-WEB-007: in-progress — 컴포넌트/페이지 구조 전환 계획 수립
- CU-WEB-008: in-progress — `middleware.js` 쿠키 기반 리다이렉트, 경로/next 검증 보완 필요
- CU-WEB-009: in-progress — `initData` + runtime fetch 유틸 정착, AC 보강 필요

## TODO
- 페이지 레벨 MODE 패턴 통일: `page.jsx` 내 `MODE = 'SSR' | 'CSR'` 보일러플레이트 가이드 배포
- 보호 페이지 SSR 기본 유지, 무거운 위젯 CSR 분리(깜빡임 최소화)
- API 클라이언트: openapi-client-axios 래퍼 도입(401/403/422 공통 처리), fetch 유틸 규약과 합치
  - Web 쿠키 인증: `credentials: 'include'`, 로그인 204(No Content) 처리, 비멱등 요청 X-CSRF-Token 주입
- 스토리북: 컴포넌트 카탈로그/시나리오 축적, Next/Tailwind preset 정리
- 테스트(Playwright/Vitest): 인증/리다이렉트/로그인 204/세션 복원 시나리오

## 결정사항(고정)
- 글로벌 모드 스위치(NEXT_RUNTIME_MODE) 폐기. 페이지 내부 상수 `MODE`로만 분기
- 보호 페이지 기본 설정: `revalidate=0`, `dynamic='force-dynamic'`, `runtime='nodejs'`, `fetchCache='only-no-store'`
- 미들웨어 경로 정책: 공개(/login, /_next/*, /public/*, /healthz), 보호(/, /dashboard/*), API는 bypass(/api/**)
- CORS/클라이언트: `credentials:'include'`, 허용 헤더에 `X-CSRF-Token`, `Content-Type`, `Authorization`
- JS Only 강제: ESLint/프로젝트 정책으로 .ts/.tsx 금지, .js/.jsx 사용

## Acceptance Criteria (Template Complete)
- 로컬에서 로그인→메인 보호 흐름 확인 가능
- 보호 경로 미인증 접근 시 즉시 /login 리다이렉트, 인증 상태에서 /login 접근 시 루트로 이동
- API 요청/응답 스키마는 OpenAPI 기반으로 수렴 가능(openapi-client-axios 적용 대상)
- 비멱등 요청(POST/PUT/PATCH/DELETE)은 CSRF 미존재 시 403 처리 및 UX 노출
- 페이지는 SSR/CSR 중 `MODE`에 맞춰 동작하며, SSR은 SEO(HTML/메타) 반영
- 공통 규칙(`docs/common-rules.md`) DoD 충족

## API 클라이언트 규약 (요약)
- Base URL: `NEXT_PUBLIC_API_BASE`
- 쿠키 인증: `credentials:'include'`
- 에러 처리: `{status:false, code, requestId}` 규격 + UX 배너(007 규약)
- 라이브러리: openapi-client-axios (JS Only)

## Links
- Parent: docs/index.md
- Children: docs/units/web/

## 페이지 데이터 패치 전략(요약)
- 목적: 전역 ENV 없이 페이지 내부에서 모드(SSR/CSR)를 결정해 단순성과 예측가능성을 확보
- 계약 분리: 페이지/컴포넌트는 공통 데이터 계약을 따르고, 실제 호출은 런타임 유틸이 담당
  - Per-page 계약: `initData.jsx`(엔드포인트 상수 기술)
  - 런타임 유틸: `app/lib/runtime/Ssr.jsx`(서버, 쿠키/언어 전달·no-store), `app/lib/runtime/Csr.jsx`(클라, SWR 친화)

