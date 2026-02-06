---
id: CU-APP-008
name: Connectivity & Foreground Revalidation
module: app
status: draft
priority: P1
links: [CU-APP-001, CU-APP-002, CU-APP-003, CU-APP-004, CU-APP-005, CU-APP-006, CU-APP-007, CU-BE-004]
---

### Purpose
- 앱이 포그라운드로 복귀하거나 네트워크 상태가 바뀔 때, 중요한 키 집합을 재검증(revalidate)해 UI 데이터를 최신 상태로 유지한다. 과도한 요청은 방지하고, 시간/동시성 예산을 지키며 동작한다.

### Scope
- 포함
  - 트리거: onAppForeground, onOnline, onPageFocus, onConfigChanged
  - 키 그룹: 세션/헤더/대시보드/주요 목록·상세
  - 동시성과 시간 예산: 동시 3요청, 시간 1500ms 예산, 초과시 잔여 건은 건너뛰기
  - GET 백오프(최대 2회, `Retry-After` 헤더 준수), 실패 상태 전파, 일시 정지(paused)
  - 오프라인 배너/미니 인디케이터, 깜빡임 최소화 교체 전략
  - OTA/런타임 컨피그 변경 시 무효화/재검증 연동(006)
- 제외
  - 백그라운드 주기적 동기화(차기)

### Interface
- UI: 오프라인 배너, 미니 로딩 인디케이터(스켈레톤 금지), 리스트는 자리 유지 교체
- API: 트리거별 재검증 훅이 SWR 키 집합을 순회 호출. 401은 즉시 가드 전환(004/005/007)

### Data & Rules
- 주요 데이터모델(JSON)
{
  "revalidate": {
    "trigger": "appForeground|online|focus|config",
    "keys": [ ["dash","cards"], ["dash","recent"], ["header","current"], ["auth","session"] ],
    "budgetMs": 1500,
    "maxParallel": 3
  }
}
- 비즈니스 규칙
  - 요청 중복 방지(키별 1회), 트리거 당 최대 3건, 예산 1500ms 초과분은 스킵
  - GET 실패는 백오프 최대 2회, Retry-After 준수. 변이 요청 자동 재시도 금지(007)
  - UI 교체는 미니 인디케이터만 사용(스켈레톤 금지), 리스트는 스크롤 위치 보존
  - 접근 제한 모듈/화면은 수동 새로고침만 허용
  - 연속 실패 N회(기본 2)면 paused로 전환하고 사용자 개입 시 해제
  - 로깅: ts, trigger, keys_count, duration_ms, success_count, fail_count, paused_count, requestId?
  - 보안: 401 즉시 AuthStack 전환, 캐시 로그 PII 최소화

### NFR & A11y
- 성능 목표: 복귀 발화→재검증 착수 < 500ms, 전체 완료 < 1500ms
- UX: 배너 표시 < 100ms, 깜빡임 0, 스크롤 점프 0, 콘솔 에러 0
- i18n: 배너/에러 문구 번역 리소스화

### Acceptance Criteria
- AC-1: 복귀 재검증이 정의된 키 그룹에 대해 중복 없이 실행되고, 시간/동시성 예산이 지켜진다.
- AC-2: 오프라인 배너가 즉시 표시되고, 복귀 시 자동 해제/재검증으로 최신 데이터가 반영된다.
- AC-3: 401 시 토큰 파기→AuthStack 전환이 트리거 즉시 수행된다(004/005/007).
- AC-4: 접근 제한 모듈/화면은 자동 재검증되지 않고 수동 새로고침으로만 갱신된다.
- AC-5: 예산 초과 시 잔여 요청은 스킵되며 UI는 안정적으로 유지된다.
- AC-6: 연속 실패 시 paused 상태로 전환되고, 수동 시도 시 복구된다.

### Tasks
- T1: 트리거 브리지(NetInfo/앱 라이프사이클/onFocus)
- T2: 키 매퍼(화면/모듈별 키 목록, 접근 제한 분리)
- T3: 스케줄러(동시성=3, 예산=1500ms, 백오프=2회)
- T4: UI 정책(스켈레톤 금지/미니 인디케이터/자리 보존, 빈·에러·오프라인 UX)
- T5: 실패 관리(연속 실패 N→paused, 재시도 버튼/알림)
- T6: 로깅/메트릭 수집 및 대시보드 연결
- T7: 통합 테스트(복귀/온라인/401/예산 초과/paused→복구)
- T8: 문서화(키 그룹/트리거별 동작/제한/가이드)
