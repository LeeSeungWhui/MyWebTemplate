---
id: CU-WEB-003
name: UI Component Pack (EasyObj/EasyList Binding)
module: web
status: in-progress
priority: P1
links: [CU-WEB-001, CU-WEB-002, CU-WEB-004, CU-WEB-005, CU-WEB-006]
---

### Purpose
- EasyObj와 EasyList 반응형 모델을 기본 데이터 바인딩으로 사용하는 재사용 UI 컴포넌트 팩을 제공한다.
- 로딩/빈상태/에러 프리셋을 포함해 SSR/CSR 어디서나 일관된 UX를 보장한다.

### Scope
- 포함
  - 입력 계열: Input, Password, Textarea, Select, Combobox, Checkbox, RadioGroup, Switch, Date/Time(경량), Number
  - 피드백: Toast, Alert, Tooltip, Modal/Slider, Loading, Skeleton, Empty
  - 표시/레이아웃: Card, Stat, Badge/Tag, List/Table(경량), Dropdown, Pagination(경량), Tabs
  - EasyObj/EasyList 인지 컴포넌트가 공유하는 바인딩 계약
  - 상태 프리셋: `loading`, `empty`, `error`, `disabled`, `readonly`, `required`
  - 디자인 토큰 정렬: Tailwind v4 토큰 기반
- 제외
  - 고급 그리드(컬럼 리사이즈/그룹), 리치 텍스트 에디터, 헤비 데이터 그리드

### Interface
- 공통 props(바인딩 + 접근성 중점)
  - `dataObj?`: EasyObj 또는 EasyList 프록시 기반 모델
  - `dataKey?`: EasyObj용 도트 경로 문자열(`foo.bar`), EasyList용 selection/sort/page 키
  - `value` / `defaultValue` / `onChange(nextValue, ctx)` 및 `onValueChange(nextValue, ctx)`
  - `status`: `idle | loading | error | success`
  - `disabled`, `readOnly`, `required`, `invalid`, `hint`, `errorMessage`, `aria-*`
- 바운드 vs 제어 모드
  - 바운드 모드: `dataObj + dataKey`가 렌더링을 주도. EasyObj 프록시는 직접 대입, 삭제, 중첩 변경을 감지하고 `fireValueHandlers`를 통해 `ctx`를 전달해야 한다.
  - 제어 모드: `value + onChange` 조합이 모델에 손대지 않고 동일한 UX를 제공
  - 직접 대입(`obj.foo = v`, `obj['foo.bar'] = v`, `delete obj.foo`)은 헬퍼 호출과 동일한 파이프라인으로 알림을 발행해야 하며, 레거시 `dataObj.get/set`은 선택 사항으로 유지
- EasyList 경량 리스트 계약
  - Props: `items`, `columns`(필수 최소), `emptyMessage`, `isLoading`, `errorCode`, `requestId`
  - 모델 바인딩: EasyList 프록시로 `selection`, `sort`, `page`, `pageSize`
  - 컨텍스트 페이로드 최소 값: `{ dataKey?, modelType: 'obj' | 'list' | null, dirty: boolean, valid: boolean | null, source: 'user' | 'program' }`

### Data & Rules
- 유효성: 길이/패턴/숫자 규칙은 `invalid=true`, `errorMessage`로 매핑. 서버 오류(`VALID_422_*`)도 동일 스키마 사용
- 오류 포맷: `{ status: false, code, message, requestId }`를 UI 오류 상태에 공급
- 인증 연계: `AUTH_*` 오류 규칙(CU-WEB-004)과 통합
- UX 기본값: 상태 프리셋별 Toast/Alert 일관성
- 상태 우선순위: `disabled > loading > error > success > idle`
- 접근성: `for/id` 연결, `aria-describedby`, 복합 위젯 로빙 포커스, 모달 포커스 트랩 강제
- 성능: SSR 초기 상태는 스켈레톤 위주, CSR 하이드레이션 시 레이아웃 시프트 방지

### NFR & A11y
- 렌더 비용: 주요 컴포넌트 로컬 렌더 < 2ms, 전체 LCP < 2.5s 기여
- 텔레메트리: 바운드/제어 모드 혼합 시 경고 로그, 폴백 경로 정교화
- WCAG 2.2 AA 준수(명명, 대비, 키보드 지원)

### Acceptance Criteria
- AC-1: `dataObj + dataKey`로 바운딩된 컴포넌트가 직접 대입, 도트 키, 삭제 변경까지 반영하고 `onChange`/`onValueChange`에 동일한 `ctx`가 전달된다.
- AC-2: 제어 모드가 모델과 분리된 상태에서도 바운드 모드와 동일한 UX를 제공한다.
- AC-3: 로딩/에러/빈상태 프리셋이 일관된 비주얼과 ARIA를 노출한다.
- AC-4: 대시보드(CU-WEB-002)가 최소한의 글루 코드로 컴포넌트 팩을 조립해 SSR/CSR 환경에서 카드/리스트를 렌더링한다.
- AC-5: Storybook이 컨트롤/A11y 체크, 라이트/다크 테마, 바인딩 시나리오를 제공한다.
- AC-6: 로그인 페이지(CU-WEB-001)가 추가 로직 없이 새 폼 컴포넌트를 교체 사용한다.
- AC-7: `frontend-web/app/component/docs/components/*`의 컴포넌트 문서가 합의된 템플릿을 따른다.

### Tasks
- T1 카탈로그 정리: props, 상태 프리셋, 로딩/에러/빈상태 패턴 문서화
- T2 바인딩 리팩터: 프록시 기반 바운드/제어 이중 모드 구현, `ctx` 계약 문서화, 레거시 헬퍼는 선택 유지
- T3 입력 계열: Input/Password/Select/Checkbox/RadioGroup/Switch/Date/Number/Textarea 완성도 맞추기
- T4 표시·피드백: Card/Stat/Badge/Tag/List(경량)/Pagination(경량)/Tabs/Skeleton/Empty/Alert/Toast/Modal
- T5 접근성 가드레일: 레이블 연결, 모달 포커스 관리, 로빙 포커스 리스트
- T6 오류/상태 매핑: `AUTH_*`, `VALID_422_*`, `HD_*`를 Toast/Alert 패턴과 정합
- T7 Storybook: 컨트롤, A11y, 다크 모드, 모델 변이 데모 추가
- T8 테스트: 바운드 vs 제어 동등성, 로딩/에러 프리셋, EasyList selection/sort Vitest 커버리지
- T9 문서: `frontend-web/app/component/docs/components/*`에 컴포넌트 페이지 업데이트

### Notes
- 스택: JavaScript Only, Next 15(App Router), Node 22.19.0, Tailwind v4
- 교차 링크: CU-WEB-001(로그인 교체), CU-WEB-002(대시보드 조립), CU-WEB-004/008(가드), CU-WEB-005(API 계약)
- 디자인 토큰: Tailwind v4 토큰 사용, 문서화된 예외 외 하드코딩 금지

### Progress
- Switch, Textarea, Card, Badge/Tag 기본 컴포넌트 구현
- `frontend-web/app/lib/binding.js`에 `ctx` 페이로드를 가진 초기 바인딩 헬퍼 추가
- Input/Checkbox/Select가 도트 키, 이벤트 detail 전파를 지원하도록 업데이트
- 문서 일부 갱신, Storybook/테스트는 진행 중
