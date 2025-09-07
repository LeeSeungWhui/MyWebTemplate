---
id: CU-APP-002
name: Dashboard (Cards/List/Stats Dummy)
module: app
status: draft
priority: P1
links: [CU-APP-001, CU-APP-003, CU-APP-004, CU-APP-005, CU-APP-007, CU-APP-008, CU-BE-001, CU-BE-002]
---

### Purpose
- 로그인 직후 진입하는 기본 정보 요약 화면을 제공한다. 초기에는 EasyObj/EasyList + SWR 패턴으로 카드·리스트·미니 통계 위젯을 구성하고, 이후 실제 위젯으로 교체하기 쉽도록 한다.

### Scope
- 포함
  - Summary Cards 3~4개(증감/배지)
  - Recent List 1페이지(무한 스크롤 또는 페이지네이션)
  - Mini Stats(간단 지표, 경량 라이브러리로 시각화)
  - 필터/리프레시/오류/로딩 UX(007)
- 제외
  - 복잡 차트/리포트 빌더, 수정/편집 기능(차기)

### Interface
- UI: Protected Stack 루트. 헤더(세션 표시), 카드/리스트/미니 통계 섹션. 스켈레톤 로딩/에러 상태.
- API: GET /api/v1/dash/cards, GET /api/v1/dash/recent (스키마는 공통 규약 준수)

### Data & Rules
- 주요 데이터 모델(JSON)
{
  "cards": [ { "title": "string", "value": 0, "delta": 0 } ],
  "recent": [ { "id": "string", "title": "string", "createdAt": "ISO8601" } ]
}
- 비즈니스 규칙
  - SWR 키: ['dash','cards'], ['dash','recent', page]
  - 무효화: 로그인/로그아웃, 프로필 변경 시 cards/recent 무효화, 백그라운드 복구(008)
  - 응답 규약: {status:true, result, count?, requestId} | 실패 {status:false, code, message, requestId}
  - 401은 로그인 처리(004), 5xx/네트워크 공통 오류 UX(007)

### NFR & A11y
- 내비게이션→초기 렌더 < 500ms, 스크롤 60fps
- 스켈레톤 즉시 응답, 접근성/리전 커버리지 포함
- i18n: 사용자 언어 형식 지원, 하드코딩 금지

### Acceptance Criteria
- AC-1: 로그인 직후 대시보드를 스켈레톤→데이터로 전환(깜빡임 최소)
- AC-2: 필터 변경 시 카드/리스트/미니 통계가 일괄 갱신된다.
- AC-3: 리프레시/무한 스크롤이 정상 동작하고, 네트워크 복구 시 최신값으로 갱신된다.
- AC-4: Recent List는 중복 요청 없이 로드된다.
- AC-5: 401은 로그인으로 전환하고, 5xx/네트워크 오류는 재시도 버튼과 함께 표시된다.
- AC-6: 응답 스키마 규약을 따르고 실패 시 code·requestId가 기입된다.

### Tasks
- T1: 레이아웃 골격(헤더/카드/리스트/미니 통계) + 스켈레톤
- T2: 위젯 규격(KPI 카드, 미니 통계, 리스트 데이터 규격)
- T3: SWR 연동(무효화/복구·중복요청 방지)
- T4: API 연동(OpenAPI JS, 204/오류 반영)
- T5: 상태/오류 UX(스켈레톤/빈상태/에러/토스트)
- T6: 성능/접근성 체크(TTI, 스크롤 FPS, ARIA)
- T7: 필터·리프레시/401/5xx/추가 로드 시나리오 문서화

