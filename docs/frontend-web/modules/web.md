# Web (Next.js)

## 목적
- 보호 경로와 공개 경로를 모두 커버하는 Next.js(App Router) 템플릿 제공
- 고객 공개 동선을 `/sample/*` 중심으로 구성하되, 컴포넌트 문서는 `/component` 단일 경로로 유지
- 페이지 파일 설정(`dynamic`/`runtime`/`revalidate`) 또는 `'use client'` 게이팅으로 SSR/CSR 모드가 명확·일관 되게 동작

## 기술 스택
- Node 24.11.0
- Next.js 15+ (App Router)
- React 19
- Tailwind CSS v4
- 상태/데이터: Zustand (+선택적 SWR)
- 테스트/문서: Docs 페이지, Vitest
- 언어: JavaScript Only (TypeScript 금지; 단, 빌드/테스트 설정은 예외)
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
- CU-WEB-010 Forgot Password (Template Auth Route)
- CU-WEB-011 Public Sample Funnel (Landing → Sample Hub)
- CU-WEB-012 Landing & Public GNB
- CU-WEB-013 Public Sample Pages (Dashboard / CRUD / Form / Admin)
- CU-WEB-014 Dashboard Expansion (Tasks CRUD + Settings)
- CU-WEB-015 Sample Portfolio Page Refresh (Visual + Trust)
- CU-WEB-016 Signup Page (Template Auth Route, Login-linked)

## Unit 진행 현황
- CU-WEB-001: implemented — `/login` SSR/CSR + Access/Refresh 쿠키 플로우 + 하단 보조 링크(`/forgot-password`,`/signup`) + 비밀번호 표시 토글 반영
- CU-WEB-002: implemented — `/dashboard` SSR 초기 데이터 + 에러/requestId 표시 + 업무 상태 바로가기 + 헤더 breadcrumb(경로/쿼리) 연동 반영
- CU-WEB-003: planned — 핵심 바인딩 컴포넌트(Input/Textarea/EasyTable/Select/EasyChart/EasyEditor/PdfViewer) 문서 경로를 `/component` 기준으로 정렬
- CU-WEB-004: implemented — 보호 경로 가드(미들웨어 단일화), `/api/session/bootstrap` 자동 복구, 401→/login(reason) 규약 반영
- CU-WEB-005: implemented — `apiJSON/apiRequest` 단일 진실 + OpenAPI(operationId) 유틸(`openapiClient.js`) 구성 완료
- CU-WEB-006: implemented — 페이지별 `PAGE_MODE` + `dynamic/runtime/revalidate/fetchCache` 규약 적용(보호 경로 기본 SSR/nodejs/no-store)
- CU-WEB-007: completed — `frontend-web` Vite → Next 마이그레이션 반영 완료
- CU-WEB-008: implemented — `middleware.js` 리다이렉트 규칙 + `nx/auth_reason` 쿠키 정리, 프리페치 bypass 포함
- CU-WEB-009: implemented — `initData` 기반 MODE 분기(SSR/CSR) + `dataStrategy` 유틸 + 단위 테스트(`dashboardDataStrategy`)로 데이터 패치 계약 고정
- CU-WEB-010: implemented — `/forgot-password` 템플릿 인증 보조 경로(공개 GNB 비노출)
- CU-WEB-011: implemented — 공개 퍼널을 `/(랜딩) → /sample/* + /component` 구조로 고정하고 템플릿 인증 경로 비노출 정책 반영
- CU-WEB-012: implemented — 공개 GNB(샘플 드롭다운/모바일 메뉴) + 랜딩 섹션 + 단일 CTA(`샘플 보기`) 구성 반영
- CU-WEB-013: implemented — 공개 샘플 5종(`/sample`, `/sample/dashboard`, `/sample/crud`, `/sample/form`, `/sample/admin`) 구현 및 샘플 세션 상태 공유 적용
- CU-WEB-014: implemented — `/dashboard/tasks`, `/dashboard/settings` UI + API 계약 + 에러/로딩/빈 상태 + 쿼리(`q/status/sort/page`) 동기화
- CU-WEB-015: implemented — 공개 포트폴리오는 `/sample/portfolio` 기준으로 운영하고, 레거시 `/portfolio`는 비노출 호환 경로로 유지
- CU-WEB-016: implemented — `/signup` 템플릿 인증 보조 경로 + `/login` 하단 회원가입 링크 + 기본 유효성/API 연동

## 프런트 설정: config.ini
- 파일 위치: `frontend-web/config.ini` (우선순위: `config.ini` > `config_prod.ini` > `config_qa.ini` > `config_dev.ini`)
- 로더: `app/common/config/frontendConfig.server.js` (서버에서 읽어 SharedStore로 주입)
- 주입: `app/layout.jsx` → `loadFrontendConfig()` → `<SharedHydrator config={config} />` → `useSharedStore().config`

예시 (config.ini):
```
[APP]
backendHost = http://localhost:2000
frontendHost = http://localhost:3000
runtime = DEV
# (optional) 개발 서버 포트: run.sh가 우선 사용
port = 3000

# (optional) 대체/레거시 키(우선순위는 getBackendHost 참고)
[API]
base = http://localhost:2000
```

주의
- 공개/보호 경로는 config.ini로 관리하지 않는다. 공개 경로 Allowlist는 `frontend-web/app/common/config/publicRoutes.js`에서만 관리하며, 그 외는 기본 보호(Default protect).
- API Base는 config에서만 로드된다. 서버는 `app/common/config/getBackendHost.server.js`, 클라는 `getBackendHost.client.js`가 `[API].base` → `[APP].backendHost` → `[APP].api_base_url` → `[APP].serverHost` 순으로 읽어 사용한다. 미설정 시 기본값은 `http://localhost:2000`.
- `frontend-web/run.sh start`(prod)는 포트를 `config.ini` 우선순위(`[WEB].port` → `[APP].port` → `[APP].frontendHost` 포트 → 기본 `4000`)로 계산한다.
- `frontend-web/run.sh start`(prod)는 시작 전 동일 포트 리스너를 종료하고, `.next/BUILD_ID`가 없거나 소스가 변경되면 `pnpm build`를 자동 실행한다.
- `frontend-web/run.sh start-dev`(dev) 기본 포트는 `3000`이며 `FRONTEND_DEV_PORT`로 오버라이드할 수 있다.
- 서버만 파일 접근 가능. 클라이언트에서는 `SharedStore.config`를 통해 접근

## 결정(고정)
- 전역 모드 환경변수(`NEXT_RUNTIME_MODE`)는 쓰지 않음. 페이지의 `MODE`가 단일 진실
- 보호 페이지 기본 옵션: `revalidate=0`, `dynamic='force-dynamic'`, `runtime='nodejs'`, `fetchCache='only-no-store'`
- 미들웨어 단일 가드(Default Protect): 모든 페이지에 적용하되 Next 내부/정적/파비콘/파일 확장자는 제외
  - config.matcher: `/((?!api|_next/static|_next/image|favicon.ico|.*\.).*)`
  - 공개 경로 Allowlist: `frontend-web/app/common/config/publicRoutes.js`에서만 관리
- 인증/토큰(C+): BFF(`app/api/bff`)가 HttpOnly Access/Refresh 쿠키를 받아 Authorization 헤더로 백엔드에 전달. 401이면 `/api/v1/auth/refresh`를 1회 호출 후 재시도(singleflight). 그래도 401이면 응답을 그대로 반환하고, 클라이언트 `apiRequest`가 `/login?next=...`로 이동한다.
- BFF 프록시: `frontend-web/app/api/bff/[...path]/route.js`가 Backend API를 호출하고 `Set-Cookie`를 프론트 도메인으로 재작성
- 통신 계층: `app/lib/runtime/api.js`의 `apiJSON`/`apiRequest`를 단일 진실로 사용(SSR/CSR 공통)
  - CSR에서 스트리밍/자동 재검증이 필요하면 `app/lib/hooks/useSwr.jsx`(SWR 래퍼) 선택적 사용
- CORS/헤더: `credentials:'include'`, 헤더 `Authorization` 기본. CSRF 헤더는 사용하지 않음(세션 미사용).
- JS Only 강제: 린트/프리셋 규칙으로 .ts/.tsx 금지

## 완료 기준(DoD)
- 인증 흐름 로컬 검증(로그인→보호 페이지)
- 보호 경로 미인증 접근 시 미들웨어에서 `/login`으로 즉시 리다이렉트하고 httpOnly `nx`에 복귀 경로 저장
- OpenAPI/Fetch 공통 헬퍼에서 401 수신 시 `/login?next=현재경로`로 이동(미들웨어가 `nx`로 정리)
- SSR/CSR 모드가 페이지 `MODE`를 존중하고 SSR 페이지는 SEO 메타 정상 출력
- 공통 규칙(`docs/common-rules.md`) DoD 충족

## API 통신 계약(고정)
- 접근: `app/lib/runtime/api.js` — `apiJSON`(기본) / `apiRequest`(Response 제어 필요 시)
- BFF: 기본적으로 클라이언트와 서버 모두 상대 경로 호출은 `/api/bff/*` 경유(쿠키/도메인 재작성). 절대 URL을 넘기면 서버에서 백엔드 직통 + 헤더 포워딩 가능.
- 쿠키/보안: `credentials: include` (현재 템플릿은 CSRF 토큰 헤더를 사용하지 않음)
- 에러 규약: 401 수신 시 로그인 리다이렉트 처리(미들웨어가 `nx`로 복귀 정리), 403은 권한/정책 오류로 처리

## 데이터 전략(초안)
- 목표: 페이지별 SSR/CSR 선택과 예측 가능한 성능 확보
- 계약 & 배선:
  - 페이지 계약: `initData.jsx`에서 페이지 상태·가드 기술
  - 런타임 헬퍼: `app/lib/runtime/ssr.jsx`(쿠키/헤더, no-store), `app/lib/runtime/csr.jsx`(클라 클라이언트, SWR 친화)
