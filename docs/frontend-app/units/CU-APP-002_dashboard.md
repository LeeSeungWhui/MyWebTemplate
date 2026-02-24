---
id: CU-APP-002
name: Dashboard (Cards/List/Stats)
module: app
status: planned
priority: P1
links: [CU-APP-001, CU-APP-003, CU-APP-004, CU-APP-005, CU-APP-007, CU-APP-008, CU-BE-001, CU-BE-007]
---

### Purpose
- 로그인 직후 진입하는 모바일 대시보드 화면을 제공한다.
- Web `/dashboard`와 데이터 계약을 맞추되, 모바일 가독성에 맞게 카드/요약/최근목록 중심으로 축약한다.

### Scope
- 포함
  - Summary Cards 3개(전체 건수/진행중/합계 금액)
  - Recent List 1페이지(최근 업무 5~10건)
  - Status 분포(도넛 또는 바 형태 경량 시각화)
  - 필터/새로고침/오류/로딩 UX
- 제외
  - 복잡 리포트 빌더/고급 분석 화면
  - 생성/수정/삭제 편집(Phase 2 `tasks` 화면으로 분리)

### Interface
- UI
  - 화면: AppStack 루트 `dashboard`
  - 섹션: KPI 카드, 상태 분포, 최근 항목 리스트
- API
  - `GET /api/v1/dashboard/stats` (상태별 집계)
  - `GET /api/v1/dashboard?q=&status=&page=&size=&sort=` (최근 업무 목록)
  - 공통 응답 스키마: `{status,message,result,count?,code?,requestId}`

### Data & Rules
- 주요 데이터 모델(JSON 예시)
{
  "stats": {
    "totalCount": 10,
    "inProgressCount": 2,
    "totalAmount": 8650000,
    "statusDistribution": [
      { "status": "ready", "count": 2 },
      { "status": "running", "count": 1 },
      { "status": "done", "count": 2 }
    ]
  },
  "recent": [
    {
      "id": 101,
      "title": "랜딩 페이지 개편",
      "status": "ready",
      "amount": 1200000,
      "createdAt": "2026-02-20",
      "tags": ["frontend", "ux"]
    }
  ]
}
- 비즈니스 규칙
  - SWR 키: `['dash','stats']`, `['dash','list', params]`
  - 무효화: 로그인/로그아웃, 설정 변경, 포그라운드 복귀(008) 시 실행
  - 401은 로그인 전환(004), 5xx/네트워크는 공통 오류 UX(007)
  - 상태 코드는 `ready/pending/running/done/failed` 기준으로 저장하고 표시만 한글 라벨 매핑

### NFR & A11y
- 초기 렌더 < 500ms, 스크롤 60fps 목표
- 로딩은 스켈레톤/인디케이터 일관 제공
- 스크린리더용 카드 제목/값 라벨 제공

### Acceptance Criteria
- AC-1: 로그인 후 `dashboard` 진입 시 스켈레톤 후 실데이터가 렌더링된다.
- AC-2: `/api/v1/dashboard/stats` 결과가 카드/상태 분포에 반영된다.
- AC-3: `/api/v1/dashboard` 목록 결과가 최근 항목 리스트로 표시된다.
- AC-4: 새로고침 시 중복 요청 없이 최신 데이터로 갱신된다.
- AC-5: 401이면 로그인 화면으로 전환되고, 5xx/네트워크 오류는 재시도 UI가 표시된다.

### Tasks
- T1: 대시보드 레이아웃(카드/분포/최근목록) 구현
- T2: `/api/v1/dashboard/stats` + `/api/v1/dashboard` 연동
- T3: SWR 키/무효화/중복요청 방지 규약 구현
- T4: 오류/빈 상태/로딩 UI 구현(CU-APP-007 연계)
- T5: 접근성 라벨/포커스 순서 점검
