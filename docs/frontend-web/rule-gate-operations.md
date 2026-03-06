# Frontend-Web Rule Gate Operations

프론트웹 코딩룰 게이트 운영 기준.

## 0) 구현 원칙 (혼합형 고정)

- 룰게이트는 `AST + regex/grep` 혼합형을 기본으로 유지한다.
- 특정 기술만 고집하지 않고, 규칙 정확도/유지보수성을 기준으로 구현 방식을 선택한다.
- 코드 우회로 룰을 통과시키지 않는다. 코드와 룰이 충돌하면 게이트 규칙을 수정한다.
- AST 우선 기준에 해당하는 규칙은 regex/grep으로 신규 구현/유지하지 않는다.
- AST 우선 규칙에서 regex/grep fallback은 허용하지 않는다. parser 미가용이면 게이트를 즉시 실패시킨다.

### 0.1) AST 우선 적용 기준

- 아래 조건 중 하나라도 해당하면 AST 검사를 우선한다.
  1. 노드 문맥(함수/호출/JSX props/스코프) 판별이 필요한 규칙
  2. regex 기반 오탐/미탐이 반복되는 규칙
  3. 의미 동일 우회(래핑/표현식 치환/조건식 위장) 방지가 필요한 규칙
- 위 1~3 조건에 해당하면 구현 우선순위는 항상 `AST 구현 -> fallback 검토` 순서로 고정한다.

#### 0.1-a) 현재 AST 우선 이관 룰

- `FE-A-001`, `FE-A-002`, `FE-A-006`, `FE-A-008`, `FE-A-009`
- `FE-A-023`, `FE-A-024`, `FE-A-029`, `FE-A-033`, `FE-A-034`, `FE-A-035`
- `FE-A-045`, `FE-A-051`, `FE-A-058`, `FE-A-064`, `FE-A-070`, `FE-A-074`, `FE-A-075`

### 0.2) regex/grep 적용 기준

- 아래 조건을 만족하면 regex/grep 검사를 우선한다.
  1. 파일 경로/이름/헤더/주석/고정 문자열처럼 형태 검사가 핵심인 규칙
  2. 문맥 해석 없이도 낮은 오탐으로 안정 검출 가능한 규칙

### 0.3) 예외 주석 표준

- 룰 예외는 인접 주석 `rule-gate: allow-<키워드> - <사유>` 포맷으로만 허용한다.
- 예외는 최소 범위(해당 라인/블록)로 제한한다.
- 사유 없는 예외 주석 또는 변형 포맷은 허용하지 않는다.

## 1) 실행 모드 기준 (`--all` vs `--changed`)

- 기본/리뷰 직전: `--all`
  - 목적: 전체 tracked 파일 기준으로 품질 게이트 확인.
  - 특징: 신규 untracked 파일은 검사 대상에서 제외됨.
- 구현 중 빠른 피드백: `--changed`
  - 목적: 현재 작업중인 변경 파일만 빠르게 확인.
  - 특징: untracked 파일까지 포함됨.

권장 순서:
1. 구현 중에는 `--changed`로 반복 점검한다.
2. 커밋 직전에는 `--all`로 최종 점검한다.
3. 신규 파일이 있으면 `git add` 후 `--all` 재실행한다.

## 2) 코딩룰 문서 변경 시 동기화 체크리스트

대상 문서:
- `docs/frontend-web/codding-rules-frontend.md`
- `docs/common-rules.md` (프론트 관련 섹션)

체크리스트:
1. 문서 diff에서 변경된 규칙 섹션 번호/제목을 기록한다.
2. 룰게이트 자동 규칙 매핑(`FE-A-*`) 영향 여부를 분류한다.
3. 자동 검사가 필요한 항목이면 `myweb-rule-gate` 구현을 갱신한다.
   - AST 우선 기준이면 반드시 AST 검사로 구현한다. parser 미가용 대응은 fallback 추가가 아니라 실행 환경 보정으로 해결한다.
   - 순수 형태 검사 항목이면 regex/grep으로 구현한다.
4. 수동 검사가 맞는 항목이면 `MANUAL` 포커스 항목 설명을 갱신한다.
5. 신규/강화 규칙은 Must Catch + Must Ignore 회귀 케이스를 반드시 추가한다.
6. `scripts/cli/check-myweb-rule-gate-regression.sh`를 실행한다.
7. 실제 저장소에서 `--changed` + `--all`을 모두 실행해 결과를 확인한다.
8. 회귀 케이스 문서(`docs/frontend-web/rule-gate-regression-cases.md`)를 함께 갱신한다.

## 3) 실행 명령

```bash
source ./env.sh
python3 /home/hwi/.codex/skills/myweb-rule-gate/scripts/rule_gate.py . --changed
python3 /home/hwi/.codex/skills/myweb-rule-gate/scripts/rule_gate.py . --all
bash scripts/cli/check-myweb-rule-gate-regression.sh .
```
