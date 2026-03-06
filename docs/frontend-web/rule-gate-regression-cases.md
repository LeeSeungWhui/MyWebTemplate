# Frontend-Web Rule Gate Regression Cases

프론트웹 룰게이트(`myweb-rule-gate`) 튜닝 후, 검출/비검출 기대값이 다시 깨지지 않도록
고정 회귀 케이스를 문서화한다.

## 0) 회귀 케이스 운영 강제 규칙

- 룰게이트 신규 규칙 추가/기존 규칙 강화 시 회귀 케이스를 반드시 함께 추가한다.
- 한 규칙당 최소 2종 세트를 유지한다.
  - Must Catch 1건 이상
  - Must Ignore 1건 이상
- AST 기반 규칙은 단순 정상/오류 케이스 외에 우회 패턴(의미 동일 + 형태 변경) 케이스를 우선 추가한다.
- 케이스 추가 후 `scripts/cli/check-myweb-rule-gate-regression.sh` 실행 결과가 통과해야 변경을 완료로 본다.

## 1) 검출되어야 하는 케이스 (Must Catch)

| Case ID | Rule | 패턴 | 기대 결과 |
| --- | --- | --- | --- |
| RG-FE-028-001 | FE-A-028 | `title = "Dashboard"` 기본 문구 하드코딩 | WARN 검출 |
| RG-FE-028-002 | FE-A-028 | JSX 텍스트 `Loading...` | WARN 검출 |
| RG-FE-028-003 | FE-A-028 | `errorText || 'Error'` fallback 하드코딩 | WARN 검출 |
| RG-FE-033-001 | FE-A-033 | `EasyObj(useMemo(() => ({ ... }), []))` | WARN 검출 |
| RG-FE-034-001 | FE-A-034 | `EasyList/useEasyList(useMemo(() => [...], []))` | WARN 검출 |
| RG-FE-035-001 | FE-A-035 | `EasyObj` 다중 구조분해 + `state[key]` 어댑터 대입 | WARN 검출 |
| RG-FE-036-001 | FE-A-036 | `const list = EasyList([...])` (제너릭 네이밍) | WARN 검출 |
| RG-FE-037-001 | FE-A-037 | `const state = EasyObj({ ... })` (목적 불명 네이밍) | WARN 검출 |
| RG-FE-038-001 | FE-A-038 | `apiJSON` 응답을 `ui.*`에 직접 대입 (`ui.rows = responseResult`) | WARN 검출 |
| RG-FE-064-001 | FE-A-064 | `EasyObj` 모델이 있는 뷰에서 `<Input value=... onChange=... />` 수동 제어 | WARN 검출 |
| RG-FE-065-001 | FE-A-065 | `view.jsx`의 raw `<input type="file">` 사용 시 예외 사유 주석 누락 | WARN 검출 |
| RG-FE-066-001 | FE-A-066 | `view.jsx` 섹션 주석(`/* 1. 상수 ... */`~`/* 10. 렌더링 ... */`) 누락 | WARN 검출 |
| RG-FE-066-002 | FE-A-066 | `view.jsx` 섹션 주석이 `/* n. ... === */` 형식을 따르지 않음 | WARN 검출 |
| RG-FE-066-003 | FE-A-066 | 빈 섹션에서 `// 없음` 표기 누락 | WARN 검출 |
| RG-FE-066-004 | FE-A-066 | 빈 섹션에 `// 없음`을 두고 같은 섹션 블록에 실행 코드를 함께 배치 | WARN 검출 |
| RG-FE-066-005 | FE-A-066 | `10. 렌더링` 섹션에서 `const/let/function` 선언이 `return`보다 먼저 나옴 | WARN 검출 |
| RG-FE-066-006 | FE-A-066 | 빈 섹션에 `// 내부 컴포넌트 선언 없음` 같은 변형 `없음` 표기를 두고 실행 코드를 함께 배치 | WARN 검출 |
| RG-FE-066-007 | FE-A-066 | `9. 내부 컴포넌트` 섹션에 PascalCase 내부 컴포넌트 선언이 아닌 코드(예: `const invalidPlacement = true`) 배치 | WARN 검출 |
| RG-FE-066-008 | FE-A-066 | `7. 함수`/`8. useEffect` 섹션을 `// 없음`으로 표기하고 실제 함수/useEffect를 다른 위치에 배치 | WARN 검출 |
| RG-FE-008-002 | FE-A-008 | 멀티라인 중첩 삼항 (`const x = a ? b ? c : d : e`) | WARN 검출 |
| RG-FE-067-001 | FE-A-067 | `page.jsx`의 `metadata.title/description` 문자열 하드코딩 | WARN 검출 |
| RG-FE-067-002 | FE-A-067 | `layout.jsx`의 `metadata.title/description` 문자열 하드코딩 | WARN 검출 |
| RG-FE-068-001 | FE-A-068 | `const` 화살표 헬퍼를 선언 전 직접 호출 (`const x = fn(); const fn = () => ...`) | ERROR 검출 |
| RG-FE-029-001 | FE-A-029 | `useMemo(() => resolveX({ ... }), [deps])` 단순 래핑 | WARN 검출 |
| RG-FE-030-001 | FE-A-030 | 실행문 뒤에 정적 `import` 재선언 | ERROR 검출 |
| RG-FE-032-001 | FE-A-032 | JS/JSX 파서 기준 구문 오류(예: 식 중간 주석 오염) | ERROR 검출 |
| RG-FE-031-001 | FE-A-031 | 영문 인라인 주석만 작성 (`// english comment ...`) | WARN 검출 |
| RG-FE-043-001 | FE-A-043 | JSDoc이 `@description` 한 줄로 끝나고 구체 정보 없음 | WARN 검출 |
| RG-FE-044-001 | FE-A-044 | `w-[10rem]`, `calc(100vw-2rem)` 등 rem 단위 사용 | WARN 검출 |
| RG-FE-069-001 | FE-A-069 | JSX 태그에 `style={...}` 또는 `style={{...}}` 사용 | ERROR 검출 |
| RG-FE-070-001 | FE-A-070 | `view.jsx`에서 `Array.isArray(response?.result...)` 등 백엔드 응답 타입 재검증 | ERROR 검출 |
| RG-FE-071-001 | FE-A-071 | `const loadingSyncObj = EasyObj(...)` 별도 SyncObj 선언 | ERROR 검출 |
| RG-FE-072-001 | FE-A-072 | `obj.list = obj.list || []` fallback 재초기화 | ERROR 검출 |
| RG-FE-072-002 | FE-A-072 | `const listSyncObj = payload.result` 중간복사 변수 | ERROR 검출 |
| RG-FE-073-001 | FE-A-073 | `apiJSON` 응답을 사용하면서 `<apiName>Obj/List.copy(payload.result)` 직동기화 누락 | ERROR 검출 |
| RG-FE-074-001 | FE-A-074 | `const normalizeText = (value) => value.trim();` 같은 군더더기 1줄 wrapper | ERROR 검출 |
| RG-FE-074-002 | FE-A-074 | `const mapLabel = (value, suffix) => formatLabel(value, suffix);` 형태의 다중 파라미터 전달 wrapper | ERROR 검출 |
| RG-FE-074-003 | FE-A-074 | `const normalize = value => String(value).trim();` 형태의 no-paren 파라미터 wrapper | ERROR 검출 |
| RG-FE-074-004 | FE-A-074 | `const normalize = (value) => { return String(value).trim(); };` 형태의 블록형 return wrapper | ERROR 검출 |
| RG-FE-074-005 | FE-A-074 | `view.jsx`가 아닌 런타임 파일(`lib/runtime/*.js`)의 군더더기 1줄 wrapper | ERROR 검출 |
| RG-FE-075-001 | FE-A-075 | `<div {...{ style: {...} }} />` 형태의 style 우회 spread | ERROR 검출 |
| RG-FE-075-002 | FE-A-075 | `const props = { style: {...} }; <div {...props} />` 형태의 style 객체 spread 우회 | ERROR 검출 |
| RG-FE-075-003 | FE-A-075 | `const isArrayGuard = Array.isArray; if (isArrayGuard(result.items))` 형태의 조건식 위장 | ERROR 검출 |
| RG-FE-024-002 | FE-A-024 | `const byStatus = statList;` 형태의 식별자 얕은 별칭 | WARN 검출 |
| RG-FE-076-001 | FE-A-076 | `view.jsx`에서 `./viewHelper` 같은 로컬 helper/util import | ERROR 검출 |
| RG-FE-077-001 | FE-A-077 | `response?.result?.items` 등 result 제너릭 키(`items/list/data/obj`) 접근 | ERROR 검출 |
| RG-FE-078-001 | FE-A-078 | 독립 주석(`//`, `/*`) 시작 줄의 윗줄 빈 줄 1줄 누락 | WARN 검출 |
| RG-FE-079-001 | FE-A-079 | `apiJSON(path, { timeout/retry/sizeMax/listSizeMax })` 직접 전달 | WARN 검출 |
| RG-FE-047-001 | FE-A-047 | `usePageData({ ..., auto: false })`를 반환값 미사용으로 단독 호출 | WARN 검출 |
| RG-FE-062-001 | FE-A-062 | BFF `refreshOnce`에 Origin/Referer 보강(set) 로직 누락 | WARN 검출 |

## 2) 검출되면 안 되는 케이스 (Must Ignore)

| Case ID | Rule | 패턴 | 기대 결과 |
| --- | --- | --- | --- |
| RG-FE-028-N001 | FE-A-028 | Tailwind 클래스 토큰 (`text-gray-600`) | 미검출 |
| RG-FE-028-N002 | FE-A-028 | 접근성 보조 클래스 fallback (`'sr-only'`) | 미검출 |
| RG-FE-028-N003 | FE-A-028 | 짧은 접근성 단어 `aria-label="increment"` | 미검출 |
| RG-FE-028-N004 | FE-A-028 | 짧은 접근성 단어 `aria-label="collapse"` | 미검출 |
| RG-FE-030-N001 | FE-A-030 | 지시어→import 블록→실행문 순서 준수 | 미검출 |
| RG-FE-031-N001 | FE-A-031 | 한글 인라인 주석 (`// 한글 주석`) | 미검출 |
| RG-FE-031-N002 | FE-A-031 | 정규식 리터럴 내부 `//` 패턴 (`/^https?:\\/\\//i`, `/\\//g`) | 미검출 |
| RG-FE-038-N001 | FE-A-038 | `apiJSON` 응답을 `<apiName>Obj.copy(...)`/`<apiName>List.copy(...)`로만 반영 | 미검출 |
| RG-FE-064-N001 | FE-A-064 | `<Input dataObj={formObj} dataKey=\"email\" />` 기본 바인딩 사용 | 미검출 |
| RG-FE-064-N002 | FE-A-064 | `rule-gate: allow-controlled-binding` 예외 마커와 수동 제어 사용 | 미검출 |
| RG-FE-065-N001 | FE-A-065 | raw `<input type=\"file\">` 인접 주석에 예외 사유 명시 | 미검출 |
| RG-FE-066-N001 | FE-A-066 | `view.jsx` 10개 섹션 주석을 순서대로 모두 유지 | 미검출 |
| RG-FE-066-N002 | FE-A-066 | 빈 섹션에 `// 없음`을 명시한 정상 블록 | 미검출 |
| RG-FE-066-N003 | FE-A-066 | `10. 렌더링` 섹션에서 선언문 없이 즉시 `return` 렌더링 | 미검출 |
| RG-FE-008-N001 | FE-A-008 | 멀티라인 단일 삼항 (`const x = a ? b : c`) | 미검출 |
| RG-FE-068-N001 | FE-A-068 | `onClick={() => helper()}`처럼 선언 전 참조하되 즉시 호출이 아닌 콜백 참조 | 미검출 |
| RG-FE-069-N001 | FE-A-069 | 변수명이 `style`이어도 JSX `style=` 속성을 사용하지 않으면 미검출 | 미검출 |
| RG-FE-070-N001 | FE-A-070 | `view.jsx`에서 `response?.result?.items || []` fallback만 사용 | 미검출 |
| RG-FE-071-N001 | FE-A-071 | `ui = EasyObj({ isLoading: false })` 형태로 UI 플래그를 단일 ui에 포함 | 미검출 |
| RG-FE-072-N001 | FE-A-072 | fallback 재초기화 없이 `obj.copy(...)`만 수행 | 미검출 |
| RG-FE-072-N002 | FE-A-072 | `SyncObj` 이름의 중간 변수 없이 직접 `copy(payload.result)` 처리 | 미검출 |
| RG-FE-073-N001 | FE-A-073 | `apiJSON` 직후 `<apiName>Obj.copy(payload.result || {})` 수행 | 미검출 |
| RG-FE-074-N001 | FE-A-074 | 인접 주석에 `rule-gate: allow-trivial-wrapper` 사유를 명시한 예외 wrapper | 미검출 |
| RG-FE-074-N002 | FE-A-074 | `view.jsx`가 아닌 런타임 파일에서 `allow-trivial-wrapper` 예외 주석이 있는 wrapper | 미검출 |
| RG-FE-067-N001 | FE-A-067 | `layout.jsx metadata.title/description`이 i18n 참조(`LANG_KO.*`)인 경우 | 미검출 |
| RG-FE-075-N001 | FE-A-075 | style 키가 없는 spread 객체(`{ title: ... }`) 전달 | 미검출 |
| RG-FE-076-N001 | FE-A-076 | `view.jsx`에서 `./SectionCard` 같은 일반 로컬 컴포넌트 import | 미검출 |
| RG-FE-077-N001 | FE-A-077 | `response?.result?.taskList`처럼 `<name>List` 계약 키 접근 | 미검출 |
| RG-FE-078-N001 | FE-A-078 | 독립 주석 시작 줄의 윗줄 빈 줄을 정확히 1줄 유지 | 미검출 |
| RG-FE-079-N001 | FE-A-079 | `apiJSON(path, { method, body })`처럼 일반 호출 옵션만 전달 | 미검출 |

## 3) 자동 검증 스크립트

아래 스크립트는 임시 fixture git repo를 생성해 위 케이스를 자동으로 검증한다.

```bash
source ./env.sh
bash scripts/cli/check-myweb-rule-gate-regression.sh .
```

성공 기준:
- Must Catch 50건이 모두 검출된다.
- Must Ignore 30건이 검출되지 않는다.
