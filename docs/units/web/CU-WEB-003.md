---
id: CU-WEB-003
name: UI Component Pack (EasyObj/EasyList Binding)
module: web
status: in-progress
priority: P1
links: [CU-WEB-001, CU-WEB-002, CU-WEB-004, CU-WEB-005, CU-WEB-006]
---

### Purpose
- EasyObj와 EasyList 반응형 모델을 기본 데이터 바인딩으로 사용하는 재사용 UI 컴포넌트 묶음을 제공한다.
- 로딩/빈 상태/에러 상태를 통일된 패턴으로 제공하고, SSR/CSR 환경에서도 일관된 UX를 보장한다.

### Scope
- 포함
  - 입력 계열: Input, Password, Textarea, Select, Combobox, Checkbox, RadioGroup, Switch, Date/Time(경량), Number
  - 피드백: Toast, Alert, Tooltip, Modal/Slider, Loading, Skeleton, Empty
  - 표시/레이아웃: Card, Stat, Badge/Tag, List/Table(경량), Dropdown, Pagination(경량), Tabs
  - EasyObj/EasyList 인지 컴포넌트가 공유하는 바인딩 계약
  - 상태 프리셋: `loading`, `empty`, `error`, `disabled`, `readonly`, `required`
  - 디자인 토큰 정렬: Tailwind v4 토큰 기반
- 제외
  - 고급 그리드(컬럼 리사이즈/그룹핑), 리치 텍스트 에디터 고기능 그리드

### Interface
- 공통 props(바인딩 + 접근성 중심)
  - `dataObj?`: EasyObj 또는 EasyList 프록시 기반 모델
  - `dataKey?`: EasyObj의 필드 경로 문자열(`foo.bar`), EasyList는 selection/sort/page 등 키로 사용
  - `value` / `defaultValue` / `onChange(nextValue, ctx)` / `onValueChange(nextValue, ctx)`
  - `status`: `idle | loading | error | success`
  - `disabled`, `readOnly`, `required`, `invalid`, `hint`, `errorMessage`, `aria-*`
- 바운드 vs 컨트롤드 모드
  - 바운드 모드: `dataObj + dataKey`가 렌더링을 주도. EasyObj 프록시의 직접 대입/삭제/중첩 변경을 감지하고 `fireValueHandlers`를 통해 `ctx`를 전달해야 한다.
  - 컨트롤드 모드: `value + onChange` 조합으로 모델과 분리된 상태에서 바운드와 동일한 UX를 제공한다.
  - 직접 대입(`obj.foo = v`, `obj['foo.bar'] = v`, `delete obj.foo`)은 프록시가 동일 파이프라인으로 처리되며, 레거시 `dataObj.get/set`는 선택적 헬퍼로 유지한다.
- EasyList 경량 리스트 계약
  - Props: `items`, `columns`(최소), `emptyMessage`, `isLoading`, `errorCode`, `requestId`
  - 모델 바인딩: EasyList 프록시로 `selection`, `sort`, `page`, `pageSize`
  - 컨텍스트 최소 페이로드: `{ dataKey?, modelType: 'obj' | 'list' | null, dirty: boolean, valid: boolean | null, source: 'user' | 'program' }`

### Data & Rules
- 유효성: 길이/패턴/숫자 규칙을 `invalid=true`, `errorMessage`로 매핑. 서버 검증 오류(`VALID_422_*`)는 동일 키로 적용
- 오류 포맷: `{ status: false, code, message, requestId }`를 UI 오류 상태에 공급
- 인증 연계: `AUTH_*` 오류 규칙(CU-WEB-004)과 합치
- UX 기본: 상태 프리셋별 Toast/Alert 노출
- 상태 우선순위: `disabled > loading > error > success > idle`
- 접근성: `for/id` 연결, `aria-describedby`, 복합 위젯 로빙 포커스, 모달 포커스 트랩
- 성능: SSR 초기 상태는 스켈레톤 우선, CSR 하이드레이션은 레이아웃 쉬프트 방지

### NFR & A11y
- 렌더 비용: 주요 컴포넌트 로컬 렌더 < 2ms, 전체 LCP < 2.5s 기여
- 텔레메트리: 바운드/컨트롤드 모드 혼용 시 경고 로그, 폴백 경로 유지
- WCAG 2.2 AA 준수(명명, 대비, 키보드 탐색)

### Acceptance Criteria
- AC-1: `dataObj + dataKey`로 바운드된 컴포넌트가 직접 대입/삭제/중첩 변경까지 반영하고 `onChange`/`onValueChange`에 동일 `ctx`를 전달한다.
- AC-2: 컨트롤드 모드가 모델과 분리된 상태에서도 바운드 모드와 동일한 UX를 제공한다.
- AC-3: 로딩/에러/빈 상태 프리셋이 일관된 비주얼과 ARIA 속성으로 출력된다.
- AC-4: 대시보드(CU-WEB-002)가 최소한의 글루 코드와 컴포넌트 조립만으로 SSR/CSR 환경에서 카드/리스트를 렌더링한다.
- AC-5: Storybook에서 컨트롤·A11y 체크, 다크 모드, 바인딩 시나리오가 제공된다.

### 컴포넌트 스펙: 리치 에디터(EasyEditor)
- 목적: 문서/공지/가이드 등 리치 텍스트 입력을 EasyObj와 일관된 규약으로 제공한다.
- Props
  - `dataObj?`, `dataKey?`: 바운드 모드. 직렬화 기본은 `json`. dotted key 지원, `ctx` 이벤트 전달.
  - `value?`, `onChange?`, `onValueChange?`: 컨트롤드 모드. 직렬화는 `serialization = 'json' | 'html' | 'text'`.
  - `placeholder?`, `readOnly?`, `status?`, `invalid?`, `label?`, `helperText?`, `aria-*`
  - `toolbar?=true`: 툴바 표시. 기본 버튼: 굵게/기울임/밑줄, 폰트 크기, 색상, 좌·우·중앙·양끝 정렬, 링크, 이미지/파일 첨부, Editor/HTML 모드 토글.
  - `extensions?`: tiptap 확장 배열(메모이즈된 참조만 허용).
  - 업로드: `onUploadImage?`, `onUploadFile?` (파일 → URL 또는 {url,name} 반환), `imageUploadUrl?`, `fileUploadUrl?`(힌트)
- 동작 규칙
  - SSR: tiptap `immediatelyRender=false`로 하이드레이션 불일치 방지.
  - 무한 루프 방지: 내부 서명(fingerprint) 비교 후 실제 변경시에만 EasyObj/이벤트 갱신.
  - HTML 모드: textarea로 편집, 저장 시 에디터 내용과 동기화.
- A11y
  - `role="textbox"`, `aria-multiline`, `aria-invalid`, 라벨/설명 연결(`for/id`, `aria-describedby`).
- AC (추가)
  - AC-E1: Editor/HTML 모드 전환 시 내용 손실 없이 왕복 변환된다.
  - AC-E2: 이미지/파일 첨부 시 업로드 훅이 없으면 Alert로 가이드를 노출한다(템플릿 기본 동작).
  - AC-E3: Storybook에서 바운드/컨트롤드/HTML 모드 시나리오와 A11y 체크를 통과한다.

### 컴포넌트 스펙: PDF 뷰어(PdfViewer)
- 목적: 로컬 파일 또는 원격 URL의 PDF를 페이지 탐색/확대/검색 가능한 뷰어로 표시한다.
- 권장 구현
  - 라이브러리: `@react-pdf-viewer/core` 기반(플러그인으로 썸네일/검색/줌/페이지 이동 제공). 대안: `react-pdf`.
  - Next 환경: CSR 전용(`dynamic(..., { ssr:false })`), pdf.js worker 경로 설정 지원.
- Props
  - `src`: string(원격 URL) | File | Blob | ArrayBuffer (로컬 입력 허용)
  - `initialPage?=1`, `withToolbar?=true`, `zoom?`, `onLoad?`, `onError?`, `headers?`, `workerSrc?`
  - A11y: 키보드 페이지 이동, `role=document`, 현재 페이지 정보 ARIA 노출
- 동작 규칙
  - 로컬 파일: `<input type="file">`로 선택 → Blob URL 렌더
  - 원격 URL: CORS 허용 필요. 인증이 필요한 경우 fetch → blob 변환 후 렌더
  - 에러/권한 실패 시 Alert/Empty 상태로 대체
- AC (추가)
  - AC-P1: URL/로컬 파일 모두 정상 렌더 및 페이지 이동/줌/검색 동작
  - AC-P2: CSR 페이지에서 하이드레이션 에러 없이 동작
  - AC-P3: 403/404/네트워크 에러 시 사용자에게 Alert/Empty로 안내

### Tasks (추가)
- T10 EasyEditor Storybook/문서/테스트(바운드/컨트롤드/HTML/업로드 알림)
- T11 PdfViewer 컴포넌트 1차 구현(플러그인 최소 구성, CSR 전용), 예제/Storybook/간단 테스트
- T12 문서 보강: A11y/SSR 주의 사항 및 업로드/워커 경로 설정 가이드
