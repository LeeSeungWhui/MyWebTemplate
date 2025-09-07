---
id: CU-WEB-009
name: Data Fetch Strategy (SSR/CSR 전환)
module: web
status: planned
priority: P1
links: [CU-WEB-001, CU-WEB-002, CU-WEB-004, CU-WEB-005, CU-WEB-006, CU-WEB-008, CU-BE-001]
---

### Purpose
- 환경변수로 런타임 모드를 바꾸지 않고, “데이터를 어디서 호출하느냐”로 SSR/CSR을 전환한다.
- 템플릿 사용자는 페이지에서 MODE만 결정하고, UI는 클라이언트 컴포넌트에서 구현한다. 네트워킹 규칙은 공통 유틸이 책임진다.

### Principles
- 단일 계약: 페이지/컴포넌트는 공통 데이터 계약만 호출한다(엔드포인트·데이터 모델 중심). 구현은 런타임 유틸로 위임한다.
- 위치로 결정: SSR은 page.jsx(서버)에서, CSR은 'use client' 컴포넌트에서 동일 계약을 호출한다.
- 기본값: 보호 페이지는 SSR(nodejs, no-store), 무거운 위젯은 CSR로 분리하는 하이브리드.

### Responsibilities
- data/fetch.js(공통 계약)
  - 엔드포인트와 데이터 스키마만 표기한다(예: getSession, getProfile 등).
  - 내부적으로 SSR/CSR 런타임 유틸을 호출한다.
- lib/runtime/ssr.js(서버 유틸)
  - 쿠키·언어 헤더 자동 전달, 캐시 no-store 적용, 서버에서의 fetch 규칙 일원화.
- lib/runtime/csr.js(클라이언트 유틸)
  - credentials: 'include' 고정, 비멱등 요청에 CSRF 자동 주입, 에러 규약(401/403 등) 일관 처리.
- page.jsx(서버 컴포넌트)
  - MODE를 ‘SSR’ 또는 ‘CSR’로 결정한다(페이지 단위 전환).
  - MODE=SSR일 때만 공통 계약을 서버에서 호출해 초기 데이터를 전달(SEO 반영).
- Client.jsx(클라이언트 컴포넌트)
  - MODE=CSR일 때만 공통 계약을 호출해 데이터를 가져온다(재검증·상호작용 우선).

### Interaction with OpenAPI Client
- openapi-client-axios는 공통 계약(data/fetch.js) 내부에서 활용 가능하다.
- 외부로는 동일한 응답 규약과 오류 처리만 노출되어, SSR/CSR 경로의 호출자가 동일한 계약을 사용한다.

### Acceptance Criteria
- 페이지별 MODE 전환만으로 SSR→CSR가 동작하고, SSR 경로에서 SEO(HTML/메타)가 반영된다.
- 공통 계약을 통해 SSR/CSR 모두 응답 규약과 에러 처리(401→/login, 403→CSRF 안내)가 일관되게 동작한다.
- 보호 페이지는 기본 SSR(nodejs, no-store)이며, 무거운 위젯은 CSR로 분리해 깜빡임 없이 렌더링된다.

### Tasks
- 공통 계약 파일(data/fetch.js) 정의(최소: 세션/프로필/리스트 등).
- 런타임 유틸(lib/runtime/ssr.js, lib/runtime/csr.js) 정의(쿠키/언어/credentials/CSRF/no-store 일원화).
- 페이지에 MODE 도입 및 가드·대시보드에 SSR/CSR 혼합 적용.
- 문서·스토리북·테스트에 전환 전략 반영(SEO/깜빡임/에러플로우).

### Notes
- JavaScript Only, Next(App Router). 기본 nodejs(runtime) 권장.
- Base URL: NEXT_PUBLIC_API_BASE. 런타임 모드를 ENV로 토글하지 않는다.

