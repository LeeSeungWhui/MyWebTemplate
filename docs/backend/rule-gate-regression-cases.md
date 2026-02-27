# Backend Rule Gate Regression Cases

백엔드 룰게이트(`myweb-rule-gate`) 튜닝 후, 검출/비검출 기대값이 다시 깨지지 않도록
고정 회귀 케이스를 문서화한다.

## 1) 검출되어야 하는 케이스 (Must Catch)

| Case ID | Rule | 패턴 | 기대 결과 |
| --- | --- | --- | --- |
| RG-BE-002-001 | BE-A-002 | 서비스 레이어 멀티라인 SQL f-string 보간 | ERROR 검출 |
| RG-BE-002-002 | BE-A-002 | 서비스 레이어 SQL 문자열 `.format(...)` 치환 | ERROR 검출 |
| RG-BE-011-001 | BE-A-011 | Auth 라우터에서 `JSONResponse` 반환 시 `Cache-Control: no-store` 누락 | WARN 검출 |
| RG-BE-008-001 | BE-A-008 | 함수 docstring `갱신일` 형식이 `YYYY-MM-DD`가 아님 (`2026-02-XX`) | WARN 검출 |
| RG-BE-008-002 | BE-A-008 | `__init__` 메서드 docstring 누락 | WARN 검출 |
| RG-BE-012-001 | BE-A-012 | 백엔드 인라인 주석이 영문 문장으로만 작성됨 | WARN 검출 |
| RG-BE-013-001 | BE-A-013 | SQL 오브젝트명이 `T_`/`V_` prefix 규칙을 따르지 않음 | WARN 검출 |
| RG-BE-014-001 | BE-A-014 | `SQL_LOG_LITERAL_VALUES` 노출 경로에서 민감값 마스킹 가드 누락 | WARN 검출 |
| RG-BE-014-002 | BE-A-014 | SQL 로그 리터럴 노출 경로에서 list/dict 중첩 문자열 민감값 마스킹 누락 | WARN 검출 |
| RG-BE-015-001 | BE-A-015 | 선행 실행문 이후 모듈 레벨 `import` 재등장 | WARN 검출 |
| RG-BE-018-001 | BE-A-018 | docstring이 `설명` 재진술형 + 구체 정보 없음 | WARN 검출 |

## 2) 검출되면 안 되는 케이스 (Must Ignore)

| Case ID | Rule | 패턴 | 기대 결과 |
| --- | --- | --- | --- |
| RG-BE-002-N001 | BE-A-002 | 일반 로그 문자열 `.format(...)` | 미검출 |
| RG-BE-002-N002 | BE-A-002 | 일반 텍스트 f-string | 미검출 |
| RG-BE-015-N001 | BE-A-015 | `TYPE_CHECKING` 블록/try-import fallback 패턴 | 미검출 |

## 3) 자동 검증 스크립트

아래 스크립트는 임시 fixture git repo를 생성해 위 케이스를 자동으로 검증한다.

```bash
source ./env.sh
bash scripts/cli/check-myweb-rule-gate-backend-regression.sh .
```

성공 기준:
- Must Catch 11건이 모두 검출된다.
- Must Ignore 3건이 검출되지 않는다.
