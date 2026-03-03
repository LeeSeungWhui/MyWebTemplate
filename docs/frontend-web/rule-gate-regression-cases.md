# Frontend-Web Rule Gate Regression Cases

프론트웹 룰게이트(`myweb-rule-gate`) 튜닝 후, 검출/비검출 기대값이 다시 깨지지 않도록
고정 회귀 케이스를 문서화한다.

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
| RG-FE-029-001 | FE-A-029 | `useMemo(() => resolveX({ ... }), [deps])` 단순 래핑 | WARN 검출 |
| RG-FE-030-001 | FE-A-030 | 실행문 뒤에 정적 `import` 재선언 | ERROR 검출 |
| RG-FE-032-001 | FE-A-032 | JS/JSX 파서 기준 구문 오류(예: 식 중간 주석 오염) | ERROR 검출 |
| RG-FE-031-001 | FE-A-031 | 영문 인라인 주석만 작성 (`// english comment ...`) | WARN 검출 |
| RG-FE-043-001 | FE-A-043 | JSDoc이 `@description` 한 줄로 끝나고 구체 정보 없음 | WARN 검출 |
| RG-FE-044-001 | FE-A-044 | `w-[10rem]`, `calc(100vw-2rem)` 등 rem 단위 사용 | WARN 검출 |
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

## 3) 자동 검증 스크립트

아래 스크립트는 임시 fixture git repo를 생성해 위 케이스를 자동으로 검증한다.

```bash
source ./env.sh
bash scripts/cli/check-myweb-rule-gate-regression.sh .
```

성공 기준:
- Must Catch 19건이 모두 검출된다.
- Must Ignore 11건이 검출되지 않는다.
