# Web (Next.js)

## 목적
- Next.js(App Router) 기반으로 UI 컴포넌트 셋과 로그인→메인 정보까지 포함한 템플릿을 제공한다.
- SSR/ISR/CSR 전략을 화면 단위로 유연하게 전환할 수 있는 실행 가이드를 제공한다.

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
- CU-WEB-006 SSR/CSR Runtime Switch
- CU-WEB-007 Migration (Vite→Next)
- CU-WEB-008 Middleware Guard & Redirect

## 진행 현황(Units)
- CU-WEB-001 Auth & Login Page: draft — Vite 로그인 화면 존재, 백엔드 API 연동/검증·오류 UX 보완 필요
- CU-WEB-002 Dashboard: planned — 카드/리스트/통계 위젯 구성 예정
- CU-WEB-003 UI Component Pack: in-progress — 핵심 입력/피드백 컴포넌트 보유, Next 환경 데이터 바인딩 규약 정리 필요
- CU-WEB-004 Routing & Guard: planned — 보호 라우트/리다이렉트 상태 관리 설계 필요
- CU-WEB-005 API Client: planned — OpenAPI 스키마 연계(JS 클라이언트: openapi-client-axios) 미구성
- CU-WEB-006 SSR/CSR Runtime Switch: planned — ENV + 페이지 export 기반 전환 헬퍼 구현 필요
- CU-WEB-007 Migration: in-progress — 컴포넌트/페이지 구조 이전 계획 수립
- CU-WEB-008 Middleware Guard & Redirect: planned — 경로 보호/리디렉션 규칙 정의

## TODO
- Next 템플릿 스캐폴딩: frontend-web 생성(App Router/Tailwind v4)
- Auth 연동: 로그인→백엔드 로그인 API 연결(성공/실패 토스트, 302 리다이렉트)
- 보호 라우트: 서버 설정과 클라이언트 세션 모두 반영(미인증 즉시 /login)
- 대시보드: 카드/리스트/통계 위젯 구성, 반응형 레이아웃
- API 클라이언트: OpenAPI 스키마 기반 JS 클라이언트(openapi-client-axios), fetch 래퍼/에러 규격 통일
  - Web 쿠키 인증: credentials: 'include' 고정, 로그인 204(No Content) 처리, 비멱등 요청 X-CSRF-Token 주입
- SSR/CSR 런타임: lib/runtime.js 헬퍼 + 페이지 revalidate/dynamic/runtime/fetchCache 패턴 도입
- 스토리북: 컴포넌트 카탈로그/캠프 시나리오 추가, Next/Tailwind preset 통합
- 테스트(Playwright/Vitest): 검증·가드·리다이렉트·로그인204·세션 복원 기본 시나리오

## 결정사항(고정)
- API 클라이언트: openapi-client-axios 고정 채택(JS Only)
- 테스트/E2E: Playwright 우선(유닛은 Vitest 선택)
- 런타임 기본: NEXT_RUNTIME_MODE=ssr
- 보호 페이지 기본 설정: revalidate=0, dynamic='force-dynamic', runtime='nodejs', fetchCache='only-no-store'
- 미들웨어 경로 정책: 공개(/login, /_next/*, /public/*, /healthz), 보호(/, /dashboard …), bypass(/api/**)
- CORS 헤더/클라이언트: Access-Control-Allow-Headers: X-CSRF-Token, Content-Type, Authorization
- JS Only 강제: ESLint/프로젝트 정책으로 .ts/.tsx 금지, .js/.jsx만 사용

## Acceptance Criteria (Template Complete)
- 로컬에서 앱 실행 시 로그인→메인 정보 확인 가능
- 보호 라우팅: 미인증 접근 시 즉시 /login 리다이렉트, 인증 상태에서 /login 접근 시 루트 이동
- API 호출이 응답 스키마를 따르고, OpenAPI 기반 JS 클라이언트(openapi-client-axios)로 호출 가능
- 비멱등 요청(POST/PUT/PATCH/DELETE)은 CSRF가 없으면 403 처리, 토스트/배너 안내
- 페이지 전략(SSR/ISR/CSR)이 설정 값에 맞게 동작, ETag/304 처리 반영
- 공통 규칙(common-rules.md) DoD 충족

## API 클라이언트 규약 (요약)
- Base URL: NEXT_PUBLIC_API_BASE
- 쿠키 인증: credentials:'include'
- 오류 처리: {status:false, code, requestId} 정규화 + 토스트/배너(007 규약)
- 클라이언트 라이브러리: openapi-client-axios (JS Only)

## Links
- Parent: docs/index.md
- Children: docs/units/web/

## 데이터 패치 전략(SSR/CSR 전환)
- 목적: 환경변수로 모드(SSR/CSR/ISR)를 바꾸지 않고, “어디서 데이터를 가져오느냐”로 결정해 일관성·단순성을 확보한다.
- 계약 분리: 페이지/컴포넌트는 공통 데이터 계약만 호출한다. 실제 실행은 런타임 유틸이 담당한다.
  - 공통 계약: `data/fetch.js`(엔드포인트·데이터 모델만 기술)
  - 런타임 유틸: `lib/runtime/ssr.js`(서버, 쿠키·언어 헤더 자동 전달·no-store), `lib/runtime/csr.js`(클라, credentials·CSRF 처리 일원화)
- 사용 방식: 페이지에서 MODE를 ‘SSR’ 또는 ‘CSR’로 결정한다.
  - MODE=‘SSR’: page.jsx(서버 컴포넌트)에서 공통 계약을 직접 호출 → HTML에 데이터가 반영되어 SEO에 유리
  - MODE=‘CSR’: page.jsx는 셸만 그리고, 클라이언트 컴포넌트가 동일 계약을 호출 → 상호작용/실시간성에 유리
- 메타만 SSR: 필요 시 generateMetadata에서만 최소 데이터 조회(제목/설명), 본문은 CSR로 타협 가능.
- 기본 원칙: 보호 페이지는 SSR(nodejs, no-store)이 기본. 무거운 위젯/차트는 CSR로 분리해 하이브리드 구성.

## 결정사항(추가)
- ENV로 런타임 모드를 토글하지 않는다. 페이지별로 MODE와 데이터 호출 위치로 SSR/CSR을 전환한다.
- 데이터 호출 규약은 공통(fetch 계약)으로 통일하고, 쿠키·언어·CSRF·캐시 규칙은 런타임 유틸에서 처리한다.

## TODO(보강)
- 공통 데이터 계약 파일(data/fetch.js) 정립(엔드포인트·결과 스키마 중심)
- 런타임 유틸(lib/runtime/ssr.js, lib/runtime/csr.js) 정의(쿠키/언어/credentials/CSRF/no-store 일원화)
- 각 페이지에 MODE 도입(SSR 기본, CSR 선택) 및 QA(SEO, 깜빡임 없는 가드)

## Acceptance(보강)
- 페이지별 MODE 전환만으로 SSR/CSR 동작이 일관되고, SSR의 경우 HTML/메타에 데이터가 반영된다.
- 공통 계약을 통해 SSR/CSR 모두 동일 응답 규격과 에러 처리(flow: 401→/login, 403→CSRF 안내)를 따른다.
