# Web (Next.js)

## 목적
- 보호 경로와 공개 경로를 모두 커버하는 Next.js(App Router) 템플릿 제공
- 페이지 파일 설정(`dynamic`/`runtime`/`revalidate`) 또는 `'use client'` 게이팅으로 SSR/CSR 모드가 명확·일관 되게 동작

## 기술 스택
- Node 22.19.0
- Next.js 15+ (App Router)
- React 19
- Tailwind CSS v4
- 상태/데이터: Zustand (+선택적 SWR)
- 테스트/문서: Docs 페이지, Vitest (Playwright 예정)
- 언어: JavaScript Only (TypeScript 금지)
- 설정: `frontend-web/config.ini` + 환경별 오버레이(`config_dev.ini`, `config_prod.ini`)
- BFF: `/api/bff/*` 라우트에서 Backend API를 프록시하며 쿠키를 재작성

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
- CU-WEB-001: in-progress — 로그인 페이지 SSR/CSR 분리, UX/A11y 보완 필요
- CU-WEB-002: planned — 대시보드 위젯 목업 구성
- CU-WEB-003: in-progress — 핵심 컴포넌트 존재, 바인딩 리팩터 필요
- CU-WEB-004: in-progress — 미들웨어/서버 가드 부분 구현, 파라미터·401 처리 보완 필요
- CU-WEB-005: in-progress — CSRF 미구현, OpenAPI 클라이언트 공통구성 미완
- CU-WEB-006: in-progress — 페이지 MODE 규약 초안 작성, ENV 배선 진행
- CU-WEB-007: completed — `frontend-web` Vite → Next 마이그레이션 반영 완료
- CU-WEB-008: in-progress — `middleware.js` 쿠키 리다이렉트 규칙 존재, 예외 경로 커버리지 보완 필요
- CU-WEB-009: in-progress — `initData` + 런타임 fetch 헬퍼 초안, AC 충족 보강 필요

## 프런트 설정: config.ini
- 파일 위치: `frontend-web/config.ini` (우선순위: `config.ini` > `config_prod.ini` > `config_qa.ini` > `config_dev.ini`)
- 로더: `app/common/config/frontendConfig.server.js` (서버에서 읽어 SharedStore로 주입)
- 주입: `app/layout.jsx` → `loadFrontendConfig()` → `<SharedHydrator config={config} />` → `useSharedStore().config`

예시 (config.ini):
```
[WEB]
mode_default = CSR

 [API]
 base = http://localhost:2000
csrf_header = X-CSRF-Token
credentials = include

[UI]
lang = ko
theme = light
```

주의
- 공개/보호 경로는 config.ini로 관리하지 않는다. 공개 경로 Allowlist는 `frontend-web/app/common/config/publicRoutes.js`에서만 관리하며, 그 외는 기본 보호(Default protect).
- API Base는 config에서만 로드된다. 서버는 `app/common/config/getBackendHost.server.js`, 클라는 `getBackendHost.client.js`가 `[API].base`(또는 `[APP].backendHost` 등 대체 키)를 읽어 사용한다. 미설정 시 기본값은 `http://localhost:2000`.
- 서버만 파일 접근 가능. 클라이언트에서는 `SharedStore.config`를 통해 접근

## 결정(고정)
- 전역 모드 환경변수(`NEXT_RUNTIME_MODE`)는 쓰지 않음. 페이지의 `MODE`가 단일 진실
- 보호 페이지 기본 옵션: `revalidate=0`, `dynamic='force-dynamic'`, `runtime='nodejs'`, `fetchCache='only-no-store'`
- 미들웨어 단일 가드(Default Protect): 모든 페이지에 적용하되 Next 내부/정적/파비콘/파일 확장자는 제외
  - config.matcher: `/((?!api|_next/static|_next/image|favicon.ico|.*\.).*)`
  - 공개 경로 Allowlist: `frontend-web/app/common/config/publicRoutes.js`에서만 관리
- BFF 프록시: `frontend-web/app/api/bff/[...path]/route.js`가 Backend API를 호출하고 `Set-Cookie`를 프론트 도메인으로 재작성
- 통신 계층: `app/lib/runtime/api.js`의 `apiJSON`/`apiRequest`를 단일 진실로 사용(SSR/CSR 공통)
  - CSR에서 스트리밍/자동 재검증이 필요하면 `app/lib/hooks/useSwr.jsx`(SWR 래퍼) 선택적 사용
- CORS/헤더: `credentials:'include'`, 헤더 `X-CSRF-Token`, `Content-Type`, `Authorization`
- JS Only 강제: 린트/프리셋 규칙으로 .ts/.tsx 금지

## 완료 기준(DoD) 샘플
- 인증 흐름 로컬 검증(로그인→보호 페이지)
- 보호 경로 미인증 접근 시 미들웨어에서 `/login`으로 즉시 리다이렉트하고 httpOnly `nx`에 복귀 경로 저장
- OpenAPI/Fetch 공통 헬퍼에서 401 수신 시 `/login?next=현재경로`로 이동(미들웨어가 `nx`로 정리)
- CSRF 토큰 미스매치 요청은 403 + UX 가이드 노출
- SSR/CSR 모드가 페이지 `MODE`를 존중하고 SSR 페이지는 SEO 메타 정상 출력
- 공통 규칙(`docs/common-rules.md`) DoD 충족

## API 통신 계약(고정)
- 접근: `app/lib/runtime/api.js` — `apiJSON`(기본) / `apiRequest`(Response 제어 필요 시)
- BFF: 기본적으로 클라이언트와 서버 모두 상대 경로 호출은 `/api/bff/*` 경유(쿠키/도메인 재작성). 절대 URL을 넘기면 서버에서 백엔드 직통 + 헤더 포워딩 가능.
- 쿠키/보안: `credentials: include`, 비멱등은 CSRF 자동 주입
- 에러 규약: 401 수신 시 로그인 리다이렉트 처리(미들웨어가 `nx`로 복귀 정리), 403은 CSRF UX 유도

## 데이터 전략(초안)
- 목표: 페이지별 SSR/CSR 선택과 예측 가능한 성능 확보
- 계약 & 배선:
  - 페이지 계약: `initData.jsx`에서 페이지 상태·가드 기술
  - 런타임 헬퍼: `app/lib/runtime/ssr.jsx`(쿠키/헤더, no-store), `app/lib/runtime/csr.jsx`(클라 클라이언트, SWR 친화)
