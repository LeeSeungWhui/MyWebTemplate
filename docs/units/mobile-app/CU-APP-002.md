---
id: CU-APP-002
name: Dashboard (Cards/List/Stats Dummy)
module: app
status: draft
priority: P1
links: [CU-APP-001, CU-APP-003, CU-APP-004, CU-APP-005, CU-APP-007, CU-APP-008, CU-BE-001, CU-BE-002]
---

### Purpose
- 로그인 직후 진입하는 기본 정보 대시보드를 제공한다. 초기에는 EasyObj/EasyList + SWR 패턴으로 카드·리스트·미니 통계 위젯을 구성하고, 이후 실제 위젯으로 교체하기 쉽도록 한다.

### Scope
- 포함
  - Summary Cards 3~4개(지표/증감/배지)
  - Recent List 1페이지(무한 스크롤 또는 더보기)
  - Mini Stats(간단 지표, 경량 라이브러리로 대체 가능한 위젯)
  - Header Data 동기화(선택): 회사/사업부 등 기본 선택 상태 반영(CU-BE-002)
  - 프리페치/풀투리프레시, 오류/재시도 UX(007)
- 제외
  - 복잡한 차트/리포트 빌더, 수집/편집 기능(차기)

### Interface
- UI: Protected Stack 루트. 헤더 필터, 카드/리스트/미니 통계 섹션. 스켈레톤 로딩/에러 상태.
- API: GET /api/v1/dash/cards, GET /api/v1/dash/recent, GET /api/v1/header/current (스키마는 공통 규약 준수)

### Data & Rules
- 주요 데이터모델(JSON)
{
  "header": { "companyId": "string", "deptId": "string" },
  "cards": [ { "title": "string", "value": 0, "delta": 0 } ],
  "recent": [ { "id": "string", "title": "string", "createdAt": "ISO8601" } ]
}
- 비즈니스 규칙
  - SWR 키: ['dash','cards', headerFilter], ['dash','recent', headerFilter, page], ['header','current']
  - 무효화: 로그인/로그아웃, 헤더 변경 시 cards/recent 무효화. 포그라운드 복귀 시 재검증(CU-APP-008)
  - 응답 규약: {status:true, result, count?, requestId} | 실패 {status:false, code, message, requestId}
  - 401은 로그아웃 처리(004), 5xx/네트워크는 공통 오류 UX(007)

### NFR & A11y
- 성능 목표: 네비게이션→첫 페인트 < 500ms, 스크롤 60fps
- 접근성: 스켈레톤 즉시 응답, 포커스 이동/라이브 리전 사용
- i18n: 텍스트/숫자 서식 지역화, 하드코딩 금지

### Acceptance Criteria
- AC-1: 로그인 직후 대시보드가 스켈레톤 후 데이터로 전환된다(깜빡임 최소).
- AC-2: 헤더 변경 시 카드/리스트/미니 통계가 일괄 갱신된다.
- AC-3: 프리페치/리프레시가 정상 동작하고, 복귀/온라인 전환 시 최신값으로 갱신된다.
- AC-4: Recent List가 무한 스크롤(또는 더보기)로 중복 요청 없이 이어서 로드된다.
- AC-5: 401은 로그인으로 전환되고, 5xx/네트워크 오류는 재시도 버튼과 함께 노출된다.
- AC-6: 응답 스키마가 규약을 따르고 실패 시 code·requestId가 표기된다.

### Tasks
- T1: 레이아웃 골격(헤더/카드/리스트/미니 통계) + 스켈레톤
- T2: 위젯 1차(KPI 카드, 미니 통계, 리스트 아이템 규격)
- T3: SWR 연동(무효화/복귀·온라인 재검증, 중복요청 방지)
- T4: API 연동(OpenAPI JS, 204/오류 반영)
- T5: 상태/오류 UX(스켈레톤/빈 상태/에러/재시도)
- T6: 성능/접근성 점검(TTI, 스크롤 FPS, ARIA)
- T7: 헤더 변경/리프레시/401/5xx/추가 로드 시나리오 시뮬레이션
- T8: 위젯 교체 가이드/계약 문서화

