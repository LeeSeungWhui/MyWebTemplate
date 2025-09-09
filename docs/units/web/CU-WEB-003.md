---
id: CU-WEB-003
name: UI Component Pack (EasyObj/EasyList Binding)
module: web
status: in-progress
priority: P1
links: [CU-WEB-001, CU-WEB-002, CU-WEB-004, CU-WEB-005, CU-WEB-006]
---

### Purpose
- 필수 UI 컴포넌트 셋을 제공하고, EasyObj / EasyList 기반의 상태 바인딩 규약을 정의한다.
- SSR/CSR 전환, 에러/로딩 표시까지 일관 UX를 보장한다.

### Scope
- 포함
  - 입력: Input, Password, Textarea, Select, Combobox, Checkbox, RadioGroup, Switch, Date/Time(간단), Number
  - 피드백: Toast, Alert, Tooltip, Modal/Drawer, Loading, Skeleton, Empty
  - 표시/레이아웃: Card, Stat, Badge/Tag, List/Table(경량), Pagination(경량), Tabs
  - 바인딩 어댑터: EasyObj/EasyList ↔ 컴포넌트 프로퍼티 규약
  - 상태 프리셋: `loading/empty/error/disabled/readonly/required`
  - 테마/토큰: Tailwind v4 디자인 토큰(기본)
- 제외
  - 고급 그리드(컬럼 리사이즈/그룹핑), 리치 에디터(차기)

### Interface
- 공통 프로퍼티 규약(필수 중심)
  - `dataObj?`: EasyObj 또는 EasyList
  - `dataKey?`: `foo.bar` 형태의 필드 키(EasyObj); EasyList는 selection/sort/page 등 규약 사용
  - `value` / `defaultValue` / `onChange(nextValue, ctx)`
  - `status`: `idle|loading|error|success`
  - `disabled, readOnly, required, invalid, hint, errorMessage, aria-*`
- 바운드 vs 컨트롤드 모드
  - 바운드: `dataObj + dataKey` 제공 → `dataObj.get(dataKey)`/`dataObj.set(dataKey, v)`로 갱신(+`onChange` 훅)
  - 컨트롤드: `value + onChange`만으로 동작(모델 미사용)
- EasyList 경량 리스트 규약
  - 입력: `items, columns(minimal), emptyMessage, isLoading, errorCode, requestId`
  - 제어: EasyList 모델 사용 시 `selection, sort, page, pageSize` 바인딩
  - 이벤트 컨텍스트 `ctx`(최소): `{ dataKey?, modelType:'obj'|'list'|null, dirty:boolean, valid:boolean|null, source:'user'|'program' }`

### Data & Rules
- 검증/오류 반영: 길이/형식/필수 등 로컬 검증 실패 시 `invalid=true + errorMessage`, 서버 검증 결과(`VALID_422_*`) 매핑 가능
- 에러 규격: `{ status:false, code, message, requestId }` 수신 시 UI 에러 상태 반영
- 인증/권한: `AUTH_*` 에러는 가드 규칙과 연동(CU-WEB-004)
- 기본 UX: Alert/Toast + 상태 프리셋 제공
- 상태 우선순위: `disabled > loading > error > success > idle`
- 접근성: 레이블/이름 연결(for/id, `aria-describedby`), 포커스 트랩(Modal), 라이브리전 규칙
- 성능: SSR에서 초기 데이터 최소화(스켈레톤 우선), CSR 후속 패칭 권장

### NFR & A11y
- 성능: 핵심 컴포넌트 렌더 비용 < 2ms(로컬), 초기 LCP < 2.5s 목표 기여
- 안정성: 바운드/컨트롤드 혼용 시 경고 로그 및 컨트롤드 모드로 폴백
- 접근성: WCAG 2.2 AA 주요 항목 만족(레이블, 콘트라스트, 키보드 내비)

### Acceptance Criteria
- AC-1: `dataObj+dataKey` 제공 시 표시/변경이 EasyObj에 반영되고 `onChange`가 호출된다.
- AC-2: 컨트롤드 모드에서도 동일 UX로 동작(모델 의존 없음).
- AC-3: 에러/로딩/빈상태가 컴포넌트 뷰·ARIA 패턴으로 일관되게 표기된다.
- AC-4: Dashboard(002)에서 카드/리스트/필터를 컴포넌트만으로 조립 가능하며 SSR/CSR 전환에도 깜빡임 최소.
- AC-5: Storybook에서 모든 컴포넌트가 Controls/A11y 체크 통과, 다크/라이트 모드 동작.
- AC-6: 로그인 페이지(001)에서 Form 컴포넌트 교체만으로 동작(추가 로직 불필요).

### Tasks
- T1 카탈로그 정리(컴포넌트 목록/Props 표, 상태 프리셋: loading/error/empty)
- T2 바인딩 어댑터: `dataObj+dataKey`/컨트롤드 겸용 규약 구현, 이벤트 `ctx` 스펙 문서화
- T3 입력 컴포넌트: Input/Password/Select/Checkbox/RadioGroup/Switch/Date/Number/Textarea
- T4 표시/피드백: Card/Stat/Badge/Tag/List(경량)/Pagination(경량)/Tabs/Skeleton/Empty/Alert/Toast/Modal
- T5 접근성: 레이블/이름 연결, 포커스 트랩, 라이브리전 규칙 정의
- T6 에러/상태 매핑: `AUTH_*`, `VALID_422_*`, `HD_*` → Toast/Alert 패턴 정의
- T7 스토리북: Controls/A11y, 다크모드, 샘플 데이터 갱신
- T8 테스트: 바운드/컨트롤드 동등성, 에러/로딩 표시, EasyList 정렬/선택 동작

### Notes
- 기술: JavaScript Only, Next 15(App Router), 기본 nodejs 런타임(쿠키/세션 접근)
- 연계: 001(로그인 폼 교체), 002(대시보드 조립), 004/008(가드/리다이렉트), 005(API 클라 규약)
- 스타일: Tailwind v4 토큰 사용, 컴포넌트 스타일은 토큰 참조(하드코딩 지양)
