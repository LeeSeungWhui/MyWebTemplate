# Web (Next.js)

## 목적
- 보호 경로와 공개 경로를 모두 커버하는 Next.js(App Router) 템플릿을 제공한다.
- 페이지마다 `MODE = 'SSR' | 'CSR'` 상수만으로 SSR/CSR 모드를 선택할 수 있게 한다.

## 기술 스택
- Node 22.19.0
- Next.js 15+ (App Router)
- React 19
- Tailwind CSS v4
- 상태/데이터: SWR, Zustand
- 문서/테스트: Storybook 8+, Playwright/Vitest(예정)
- 언어: JavaScript Only(TypeScript 금지)

## 포함 Unit
- CU-WEB-001 Auth & Login Page
- CU-WEB-002 Dashboard (Cards/List/Stats Dummy)
- CU-WEB-003 UI Component Pack (EasyObj/EasyList 바인딩)
- CU-WEB-004 Routing & Guard (Protected Routes)
- CU-WEB-005 API Client (OpenAPI JS 연동)
- CU-WEB-006 Page-level SSR/CSR Mode Convention
- CU-WEB-007 Migration (Vite → Next)
- CU-WEB-008 Middleware Guard & Redirect
- CU-WEB-009 Data Fetch Strategy (Page MODE)

## Unit 진행 현황
- CU-WEB-001: in-progress — 로그인 페이지 SSR/CSR 분리는 동작, UX/A11y 보완 필요
- CU-WEB-002: planned — 대시보드 위젯 정의 예정
- CU-WEB-003: in-progress — 핵심 컴포넌트 존재, 프록시 바인딩 리팩터/테스트 대기
- CU-WEB-004: in-progress — 미들웨어/서버 가드 부분 구현, 파라미터·401 처리 보완 필요
- CU-WEB-005: in-progress — CSRF 훅 존재, OpenAPI 클라이언트 타입 구성 미완
- CU-WEB-006: in-progress — 페이지별 MODE 규약 초안 작성, ENV 배선 예정
- CU-WEB-007: completed — `frontend-web`에 Vite → Next 마이그레이션 반영 완료
- CU-WEB-008: in-progress — `middleware.js` 쿠키 리다이렉트 규칙 존재, 엣지 경로 커버리지 필요
- CU-WEB-009: in-progress — `initData` + 런타임 fetch 헬퍼 초안, AC 충족 보강 필요

## TODO
- 페이지별 MODE 가이드(`page.jsx` 스니펫, 개발자 플레이북) 마무리
- 보호 페이지 기본값을 `revalidate=0`, `dynamic='force-dynamic'`, `runtime='nodejs'`, `fetchCache='only-no-store'`로 고정
- OpenAPI 기반 클라이언트 헬퍼에 공통 에러 핸들링 추가, `credentials:'include'` + CSRF 헤더 주입 강제
- Next/Tailwind 프리셋으로 Storybook 구성 및 CU-WEB-003 시나리오 수록
- 인증 리다이렉트/204 로그인 흐름/세션 복구 Playwright·Vitest 커버리지 추가
- EasyObj/EasyList 프록시가 JSON 직접 대입, 도트 키, ctx 알림을 지원하도록 리팩터(CU-WEB-003)

## 결정(고정)
- 전역 모드 플래그(`NEXT_RUNTIME_MODE`) 폐기, 페이지별 `MODE`가 단일 진실
- 보호 페이지 기본 설정: `revalidate=0`, `dynamic='force-dynamic'`, `runtime='nodejs'`, `fetchCache='only-no-store'`
- 미들웨어 경로 정책: 공개(/login, /_next/*, /public/*, /healthz), 보호(/, /dashboard/*), API 우회(/api/**)
- CORS/헤더: `credentials:'include'`, 헤더 `X-CSRF-Token`, `Content-Type`, `Authorization`
- JS Only 강제: 린트/프로젝트 규칙으로 .ts/.tsx 거부

## 완료 기준(템플릿)
- 인증 플로우 로컬 검증(로그인 → 보호 페이지)
- 보호 경로 미인증 접근 시 서버/클라에서 즉시 /login 리다이렉트
- OpenAPI에서 API 스키마 생성, 공통 클라이언트가 401/403/422 처리
- CSRF 토큰 없이 변형 요청 시 403 + UX 피드백
- SSR/CSR 모드가 페이지별 `MODE`를 존중하고 SSR 페이지는 SEO 메타데이터 노출
- 공통 규칙(`docs/common-rules.md`) DoD 충족

## API 클라이언트 계약(초안)
- Base URL: `NEXT_PUBLIC_API_BASE`
- 쿠키: `credentials:'include'`
- 에러 스키마: `{ status: false, code, requestId }` + Toast/Alert 연동(CU-WEB-007)
- 라이브러리: openapi-client-axios (JS only)

## 런타임 전략(초안)
- 목표: 페이지별 SSR/CSR 선택 시 예측 가능한 성능 확보
- 계약 레이어링:
  - 페이지 계약: `initData.jsx`에서 데이터 형태·가드를 기술
  - 런타임 헬퍼: `app/lib/runtime/Ssr.jsx`(서버, 쿠키/헤더, `no-store`), `app/lib/runtime/Csr.jsx`(클라이언트, SWR 친화)
