---
id: CU-WEB-003
name: UI Component Pack (EasyObj/EasyList Binding)
module: web
status: in-progress
priority: P1
links: [CU-WEB-001, CU-WEB-002, CU-WEB-004, CU-WEB-005, CU-WEB-006]
---

### Purpose
- ?�수 UI 컴포?�트 ?�을 ?�공?�고, EasyObj / EasyList 기반???�태 바인??규약???�의?�다.
- SSR/CSR ?�환, ?�러/로딩 ?�시까�? ?��? UX�?보장?�다.

### Scope
- ?�함
  - ?�력: Input, Password, Textarea, Select, Combobox, Checkbox, RadioGroup, Switch, Date/Time(간단), Number
  - ?�드�? Toast, Alert, Tooltip, Modal/Drawer, Loading, Skeleton, Empty
  - ?�시/?�이?�웃: Card, Stat, Badge/Tag, List/Table(경량), Pagination(경량), Tabs
  - 바인???�댑?? EasyObj/EasyList ??컴포?�트 ?�로?�티 규약
  - ?�태 ?�리?? `loading/empty/error/disabled/readonly/required`
  - ?�마/?�큰: Tailwind v4 ?�자???�큰(기본)
- ?�외
  - 고급 그리??컬럼 리사?�즈/그룹??, 리치 ?�디??차기)

### Interface
- 공통 ?�로?�티 규약(?�수 중심)
  - `dataObj?`: EasyObj ?�는 EasyList
  - `dataKey?`: `foo.bar` ?�태???�드 ??EasyObj); EasyList??selection/sort/page ??규약 ?�용
  - `value` / `defaultValue` / `onChange(nextValue, ctx)`
  - `status`: `idle|loading|error|success`
  - `disabled, readOnly, required, invalid, hint, errorMessage, aria-*`
- 바운??vs 컨트롤드 모드
  - 바운?? `dataObj + dataKey` ?�공 ??`dataObj.get(dataKey)`/`dataObj.set(dataKey, v)`�?갱신(+`onChange` ??
  - 컨트롤드: `value + onChange`만으�??�작(모델 미사??
- EasyList 경량 리스??규약
  - ?�력: `items, columns(minimal), emptyMessage, isLoading, errorCode, requestId`
  - ?�어: EasyList 모델 ?�용 ??`selection, sort, page, pageSize` 바인??
  - ?�벤??컨텍?�트 `ctx`(최소): `{ dataKey?, modelType:'obj'|'list'|null, dirty:boolean, valid:boolean|null, source:'user'|'program' }`

### Data & Rules
- 검�??�류 반영: 길이/?�식/?�수 ??로컬 검�??�패 ??`invalid=true + errorMessage`, ?�버 검�?결과(`VALID_422_*`) 매핑 가??
- ?�러 규격: `{ status:false, code, message, requestId }` ?�신 ??UI ?�러 ?�태 반영
- ?�증/권한: `AUTH_*` ?�러??가??규칙�??�동(CU-WEB-004)
- 기본 UX: Alert/Toast + ?�태 ?�리???�공
- ?�태 ?�선?�위: `disabled > loading > error > success > idle`
- ?�근?? ?�이�??�름 ?�결(for/id, `aria-describedby`), ?�커???�랩(Modal), ?�이브리??규칙
- ?�능: SSR?�서 초기 ?�이??최소???�켈?�톤 ?�선), CSR ?�속 ?�칭 권장

### NFR & A11y
- ?�능: ?�심 컴포?�트 ?�더 비용 < 2ms(로컬), 초기 LCP < 2.5s 목표 기여
- ?�정?? 바운??컨트롤드 ?�용 ??경고 로그 �?컨트롤드 모드�??�백
- ?�근?? WCAG 2.2 AA 주요 ??�� 만족(?�이�? 콘트?�스?? ?�보???�비)

### Acceptance Criteria
- AC-1: `dataObj+dataKey` ?�공 ???�시/변경이 EasyObj??반영?�고 `onChange`가 ?�출?�다.
- AC-2: 컨트롤드 모드?�서???�일 UX�??�작(모델 ?�존 ?�음).
- AC-3: ?�러/로딩/빈상?��? 컴포?�트 뷰·ARIA ?�턴?�로 ?��??�게 ?�기?�다.
- AC-4: Dashboard(002)?�서 카드/리스???�터�?컴포?�트만으�?조립 가?�하�?SSR/CSR ?�환?�도 깜빡??최소.
- AC-5: Storybook?�서 모든 컴포?�트가 Controls/A11y 체크 ?�과, ?�크/?�이??모드 ?�작.
- AC-6: 로그???�이지(001)?�서 Form 컴포?�트 교체만으�??�작(추�? 로직 불필??.

### Tasks
- T1 카탈로그 ?�리(컴포?�트 목록/Props ?? ?�태 ?�리?? loading/error/empty)
- T2 바인???�댑?? `dataObj+dataKey`/컨트롤드 겸용 규약 구현, ?�벤??`ctx` ?�펙 문서??
- T3 ?�력 컴포?�트: Input/Password/Select/Checkbox/RadioGroup/Switch/Date/Number/Textarea
- T4 ?�시/?�드�? Card/Stat/Badge/Tag/List(경량)/Pagination(경량)/Tabs/Skeleton/Empty/Alert/Toast/Modal
- T5 ?�근?? ?�이�??�름 ?�결, ?�커???�랩, ?�이브리??규칙 ?�의
- T6 ?�러/?�태 매핑: `AUTH_*`, `VALID_422_*`, `HD_*` ??Toast/Alert ?�턴 ?�의
- T7 ?�토리북: Controls/A11y, ?�크모드, ?�플 ?�이??갱신
- T8 ?�스?? 바운??컨트롤드 ?�등?? ?�러/로딩 ?�시, EasyList ?�렬/?�택 ?�작

### Notes
- 기술: JavaScript Only, Next 15(App Router), 기본 nodejs ?��???쿠키/?�션 ?�근)
- ?�계: 001(로그????교체), 002(?�?�보??조립), 004/008(가??리다?�렉??, 005(API ?�라 규약)
- ?��??? Tailwind v4 ?�큰 ?�용, 컴포?�트 ?��??��? ?�큰 참조(?�드코딩 지??

### Progress
- Implemented initial missing components: Switch, Textarea, Card, Badge/Tag
- Added binding helpers with ctx: rontend-web/app/lib/binding.js
- Updated Input/Checkbox/Select to support dotted dataKey, add ctx via event.detail and onValueChange(value, ctx) for migration
- A11y: Added ria-invalid to inputs/selects/textarea, ole="switch"/aria-checked to Switch, Icon defaults to decorative unless riaLabel provided
- Docs: Added examples/docs for new components and wired into components page
