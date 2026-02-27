# Frontend-Web Rule Gate Regression Cases

프론트웹 룰게이트(`myweb-rule-gate`) 튜닝 후, 검출/비검출 기대값이 다시 깨지지 않도록
고정 회귀 케이스를 문서화한다.

## 1) 검출되어야 하는 케이스 (Must Catch)

| Case ID | Rule | 패턴 | 기대 결과 |
| --- | --- | --- | --- |
| RG-FE-028-001 | FE-A-028 | `title = "Dashboard"` 기본 문구 하드코딩 | WARN 검출 |
| RG-FE-028-002 | FE-A-028 | JSX 텍스트 `Loading...` | WARN 검출 |
| RG-FE-028-003 | FE-A-028 | `errorText || 'Error'` fallback 하드코딩 | WARN 검출 |
| RG-FE-029-001 | FE-A-029 | `useMemo(() => resolveX({ ... }), [deps])` 단순 래핑 | WARN 검출 |
| RG-FE-030-001 | FE-A-030 | 실행문 뒤에 정적 `import` 재선언 | ERROR 검출 |
| RG-FE-032-001 | FE-A-032 | JS/JSX 파서 기준 구문 오류(예: 식 중간 주석 오염) | ERROR 검출 |
| RG-FE-031-001 | FE-A-031 | 영문 인라인 주석만 작성 (`// english comment ...`) | WARN 검출 |

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

## 3) 자동 검증 스크립트

아래 스크립트는 임시 fixture git repo를 생성해 위 케이스를 자동으로 검증한다.

```bash
source ./env.sh
bash scripts/cli/check-myweb-rule-gate-regression.sh .
```

성공 기준:
- Must Catch 7건이 모두 검출된다.
- Must Ignore 7건이 검출되지 않는다.
