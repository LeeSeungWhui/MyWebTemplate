# Backend Rule Gate Operations

백엔드 코딩룰 게이트 운영 기준.

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
- `docs/backend/codding-rules-backend.md`
- `docs/common-rules.md` (백엔드 관련 섹션)

체크리스트:
1. 문서 diff에서 변경된 규칙 섹션 번호/제목을 기록한다.
2. 룰게이트 자동 규칙 매핑(`BE-A-*`) 영향 여부를 분류한다.
3. 자동 검사가 필요한 항목이면 `myweb-rule-gate` 구현(정적 분석/정규식)을 갱신한다.
4. 수동 검사가 맞는 항목이면 `MANUAL` 포커스 항목 설명을 갱신한다.
5. `scripts/cli/check-myweb-rule-gate-backend-regression.sh`를 실행한다.
6. 실제 저장소에서 `--changed` + `--all`을 모두 실행해 결과를 확인한다.
7. 회귀 케이스 문서(`docs/backend/rule-gate-regression-cases.md`)를 필요 시 함께 갱신한다.

## 3) 실행 명령

```bash
source ./env.sh
python3 /home/hwi/.codex/skills/myweb-rule-gate/scripts/rule_gate.py . --changed
python3 /home/hwi/.codex/skills/myweb-rule-gate/scripts/rule_gate.py . --all
bash scripts/cli/check-myweb-rule-gate-backend-regression.sh .
```
