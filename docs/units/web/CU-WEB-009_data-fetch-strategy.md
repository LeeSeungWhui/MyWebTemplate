---
id: CU-WEB-009
name: Data Fetch Strategy (Page MODE: SSR|CSR)
module: web
status: in-progress
priority: P1
links: [CU-WEB-001, CU-WEB-002, CU-WEB-004, CU-WEB-005, CU-WEB-006, CU-WEB-008, CU-BE-001]
---

### Purpose
- 전역(ENV) 모드 스위치 없이, 각 페이지의 `page.jsx` 내 상수 `MODE = 'SSR' | 'CSR'`로 데이터 패치 방식을 결정한다.
- 초기 데이터의 엔드포인트 정의는 각 페이지의 `initData.jsx`에 둔다. 런타임 유틸은 공통 규약만 보장한다.

### Principles
- Per-page 초기 로딩 계약: 각 페이지 디렉토리의 `initData.jsx`에 초기 로드용 엔드포인트를 정의한다(예: `export const SESSION_PATH = '/api/v1/auth/session'`).
- 실행 위치:
  - SSR: `page.jsx`(Server Component)에서 `apiJSON`으로 초기 데이터 주입(SEO 반영).
  - CSR: `'use client'` 컴포넌트에서 `apiJSON`으로 단발 패치. 실시간/자동 재검증이 필요할 때만 `useApiStream`(SWR 래퍼) 사용.
- 기본 전략: 보호 페이지는 SSR(nodejs, no-store) 기본. 무거운 위젯/상호작용 위주 섹션은 CSR로 분리한다.

### Responsibilities
- initData.jsx(페이지 초기 로딩 계약)
  - 초기 로드에 필요한 엔드포인트 상수 정의(예: `SESSION_PATH`).
- app/lib/runtime/api.js(공통 유틸)
  - `apiJSON`/`apiRequest`로 SSR/CSR 통일. 서버는 헤더 포워딩과 CSRF 자동 주입, 클라는 `/api/bff` 경유.
- page.jsx(서버 컴포넌트)
  - SSR일 때 `apiJSON(SESSION_PATH)`로 초기 데이터 전달(SEO 반영) + `SharedHydrator` 하이드레이션.
- view.jsx(클라이언트 컴포넌트)
  - CSR 모드일 때 `apiJSON(SESSION_PATH)`로 데이터 패치. 실시간/캐시가 필요한 경우에만 `useApiStream` 사용.

### Interaction
- SSR/CSR 경로에서 동일한 응답 스키마와 에러 규약을 사용하며, `initData.jsx`가 의존 엔드포인트를 명시한다.

### Acceptance Criteria
- 각 페이지의 `page.jsx`에서 `MODE`만 바꿔도 SSR/CSR 동작이 전환된다. SSR 경로는 SEO(HTML/메타)가 반영된다.
- 공통 규약에 따라 SSR/CSR 모두 401/403 처리 일관(401→/login, 403→CSRF 발급 UX 연동)하게 동작한다.
- 보호 페이지는 기본 SSR(nodejs, no-store)이며, 무거운 위젯은 CSR로 분리되어 깜빡임이 최소화된다.
- 각 페이지의 `initData.jsx`가 초기 데이터 엔드포인트를 명시한다(예: `SESSION_PATH`).

### Implementation Notes
- 예시(`app/login`): `initData.jsx`에 `SESSION_PATH` 정의, `page.jsx`에서 `MODE='SSR'`일 때 `ssrJSON(SESSION_PATH)`로 초기 데이터 전달 + `SharedHydrator` 하이드레이션. `view.jsx`는 CSR 시 `useSWR`로 `csrJSON` 호출.
- 전역 ENV 기반 모드 스위치는 사용하지 않는다(NOT USED). ISR은 본 유닛 범위에서 제외한다.

### Tasks
- 페이지 보일러플레이트 정리: `MODE` 분기 + SSR/CSR 패턴 가이드 샘플 추가.
- 각 페이지 `initData.jsx`에 초기 엔드포인트 상수 정리 및 주석화.
- 401/403 공통 처리 규약을 런타임 유틸/클라이언트 래퍼(CU-WEB-005)와 합의.
- 문서·예제에서 ENV 기반 모드 스위치(NEXT_RUNTIME_MODE) 언급 제거.
