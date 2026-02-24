---
id: CU-APP-003
name: UI Component Pack (EasyObj/EasyList 바인딩)
module: app
status: in-progress
priority: P1
links: [CU-APP-001, CU-APP-002, CU-APP-004, CU-APP-005, CU-APP-007]
---

### Purpose
- 앱 화면을 빠르게 조립할 수 있도록 공통 입력/피드백/레이아웃 컴포넌트를 표준화한다.
- Web 컴포넌트 규약과 최대한 동일한 바인딩 모델(EasyObj/EasyList)을 유지한다.

### Scope
- 포함
  - 입력: Button, Input, Select, Checkbox, RadioButton, Switch, DateInput, TimeInput, NumberInput
  - 유틸: Dropdown, Tooltip, Loading, Icon
  - 바인딩: EasyObj/EasyList 연동(필드 접근/변경/검증)
  - 컴포넌트 문서 페이지(`component`) 유지
- 제외
  - 고급 차트/리치 에디터/PDF 뷰어
  - 앱 전용 복합 컴포넌트(BottomSheet, SwipeRow) 고도화

### Interface
- UI 공통 props
  - `value/defaultValue/onChange`
  - `disabled/loading/error/hint`
  - `required/invalid`
- API
  - N/A(컴포넌트 레벨)

### Data & Rules
- 주요 데이터모델(JSON)
{
  "theme": {
    "palette": ["primary", "neutral", "success", "warn", "error"],
    "space": [0, 4, 8, 12, 16, 20, 24],
    "radius": [0, 4, 8, 12, 16]
  }
}
- 비즈니스 규칙
  - EasyObj는 모델 경로 기준 get/set을 지원해야 한다.
  - EasyList는 선택 상태(selected)/아이템 갱신 규약을 유지한다.
  - 코드 기반 오류(`AUTH_*`, `VALID_*`, `API_*`)를 컴포넌트 메시지 상태와 연결한다.
  - 문구 하드코딩은 최소화하고 번역 가능 문자열 키를 우선 사용한다.

### 현재 구현 상태 (AS-IS)
- 구현됨
  - 기본 입력/선택 계열 컴포넌트
  - Dataset(EasyObj/EasyList)와 기본 바인딩
  - 컴포넌트 Docs/Examples 라우트
- 미구현
  - 전역 토스트/모달 일관 컨테이너
  - 모바일 특화 복합 컴포넌트(BottomSheet, PullToRefresh)
  - 접근성/상태 매트릭스 문서(variant x state) 정리

### NFR & A11y
- 상호작용 지연 < 100ms 목표
- 터치 타겟 44x44 이상, 라벨/힌트 연결 보장
- 콘솔 warning/error 0 유지

### Acceptance Criteria
- AC-1: 입력 컴포넌트가 EasyObj 바인딩과 오류 표시를 지원한다.
- AC-2: 리스트성 컴포넌트가 EasyList 선택/빈 상태를 지원한다.
- AC-3: `component` 화면에서 주요 컴포넌트 예제가 깨지지 않고 동작한다.
- AC-4: 로그인/대시보드 화면 구현 시 별도 임시 컴포넌트 없이 재사용 가능하다.

### Tasks
- T1: 토큰/테마 변수 정리(색상/간격/타이포)
- T2: 토스트/알림/모달 공통 컨테이너 정리
- T3: EasyObj/EasyList 바인딩 가이드 문서화
- T4: 접근성 체크리스트 적용(포커스/라벨/대비)
- T5: 미구현 컴포넌트 우선순위(필수/선택) 확정
