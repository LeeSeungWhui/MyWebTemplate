---
id: CU-APP-003
name: UI Component Pack (EasyObj/EasyList 바인딩)
module: app
status: in-progress
priority: P1
links: [CU-APP-001, CU-APP-002, CU-APP-004, CU-APP-005, CU-APP-007]
---

### Purpose
- 공통 입력/피드백/네비게이션 컴포넌트를 Dataset(EasyObj/EasyList) 규약으로 일관되게 제공하고, 화면 제작 시 데이터 바인딩만으로 빠르게 조립 가능하게 한다.

### Scope
- 포함(초기 세트)
  - 입력: Button, IconButton, Input(Text/Password), TextArea, Select, RadioGroup, Checkbox, Switch, Slider
  - 피드백: Toast, Alert, Banner, Modal, Loading(Spinner/Skeleton), InlineError
  - 네비/레이아웃: AppBar, TabBar, BottomBar, Card, ListItem, Grid, Divider, SectionHeader
  - 유틸: SafeAreaContainer, KeyboardAvoider, EmptyState, PullToRefresh
- 제외(차기)
  - 고급 차트/리치 에디터, 드래그 보드, 복합 애니메이션 위젯

### Interface
- UI: 공통 Prop(value/defaultValue/onChange/disabled/loading/error/hint), 라벨/접근성(label/ariaLabel/required/helpText), 배치(size/fullWidth/align), 상태(variant/tone)
- API: N/A(컴포넌트 레벨)

### Data & Rules
- 주요 데이터모델(JSON)
{
  "theme": {
    "palette": ["primary","neutral","success","warn","error"],
    "space": [0,4,8,12,16,20,24,28,32],
    "radius": [0,4,8,12,16]
  }
}
- 비즈니스 규칙
  - EasyObj: model 경로로 get/set, onChange(next) 이벤트 제공
  - EasyList: items 배열, keyOf, selectedKeys, onSelectionChange, bind 지원
  - 검증/에러: 코드/문구 모두 지원(코드↔문구 매핑은 CU-APP-007)
  - Skeleton/EmptyState 변형 제공(대시/리스트 공통)

### NFR & A11y
- 성능 목표: 상호작용 지연 < 100ms, 스크롤 60fps, 스켈레톤 즉시
- 접근성: 터치 타겟 44×44, ARIA(role/state), 대비 기준 준수
- 품질: 콘솔 에러/경고 0, 문구 하드코딩 금지(i18n)

### Acceptance Criteria
- AC-1: 모든 입력 컴포넌트가 EasyObj 바인딩과 검증/에러 표시를 지원한다.
- AC-2: 리스트형 컴포넌트가 EasyList 선택/정렬/빈상태/스켈레톤을 지원한다.
- AC-3: 전역 에러/모달 규약과 코드 사전(CU-APP-007)을 따른다.
- AC-4: 라이트/다크 모드에서 레이아웃이 깨지지 않는다.
- AC-5: Storybook에서 Variant/State/Size 조합이 탐색 가능하고 최신이다.
- AC-6: E2E에서 로그인/리스트/에러 토스트 흐름이 통과한다.

### Tasks
- T1: 토큰/테마 정의(팔레트/간격/타이포/라운드/그림자)
- T2: 입력 컴포넌트 1차군(Button, Input, Select, Checkbox, RadioGroup, Switch)
- T3: 피드백 컴포넌트(Toast, Alert, Modal, Loading, Skeleton, EmptyState)
- T4: 레이아웃/네비(AppBar, Tab/BottomBar, Card, ListItem, Divider)
- T5: 데이터 바인딩 헬퍼(EasyObj/EasyList) 및 에러/검증 처리
- T6: 접근성/모션 가이드(포커스/라벨/애니메이션 최소화)
- T7: Storybook 카탈로그(상태/사이즈 매트릭스)
- T8: 성능 점검(Interaction <100ms, 60fps), 콘솔 클린업
- T9: 바인딩 규약/에러 코드/사용 가이드 문서화

