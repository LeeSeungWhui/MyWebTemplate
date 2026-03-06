# codex-state

이 디렉토리는 MyWebTemplate 작업 상태를 파일로 관리하는 공간이다.
긴 분석, 테스트 로그, 리뷰 후보, 인계 메모를 대화 컨텍스트 대신 여기 남긴다.

목적은 3가지다.

- 긴 작업에서 컨텍스트 오염 줄이기
- 멀티 에이전트 작업 상태를 재사용 가능하게 만들기
- 다음 세션이나 다음 에이전트가 바로 이어받게 만들기

`AGENTS_ORCHESTRATION.md`의 상태 위임 원칙을 실제 파일 구조로 옮긴 폴더다.

## 기본 원칙

1. 긴 원문은 채팅에 붙이지 말고 `codex-state/`에 저장한다.
2. 채팅에는 항상 `요약 + 파일 경로`만 남긴다.
3. 최신 상태 진입점은 아래 2개로 고정한다.
   - `codex-state/sessions/current.json`
   - `codex-state/handoff/next-agent-brief.md`
4. 작업이 길어질수록 `analysis / execution / review / qa`를 분리한다.
5. 민감정보, 토큰, 쿠키, 개인정보는 상태 파일에도 남기지 않는다.
6. 저장소는 `git` 기준으로 다룬다.
7. 상태 파일은 살아 있는 작업 메모이므로 최신성 관리 규칙이 있어야 한다.
8. 짧은 작업이면 억지로 상태 파일을 만들지 않는다.

## 권장 디렉토리 구조

- `analysis/`
  - 영향 범위 분석, 관련 파일 목록, 기존 패턴 조사
- `plans/`
  - 현재 작업 계획, 분해 전략, 역할 분담
- `execution/`
  - 구현 진행 메모, 작업 범위, 중간 결론
- `review/`
  - 리뷰 후보 이슈, 합의 메모, 드롭 사유
- `qa/`
  - 테스트 결과, 재현 절차, 스모크/QA 요약
- `handoff/`
  - 다음 에이전트용 인계 문서
- `sessions/`
  - 현재 세션 메타데이터와 포인터
- `artifacts/`
  - 스크린샷 경로 메모, 대형 diff 메모, 보조 산출물 설명

## 현재 기본 파일

- `sessions/current.json`
  - 지금 세션의 목표, 상태, 주요 state 파일 포인터
- `handoff/next-agent-brief.md`
  - 다음 세션/다음 에이전트가 바로 읽을 요약
- `analysis/current-analysis.md`
  - 현재 영향 범위/근거 정리
- `plans/current-plan.md`
  - 현재 작업 계획
- `execution/current-task.md`
  - 지금 구현 중인 내용과 진행 상태
- `review/candidate-issues.md`
  - 리뷰 후보 이슈와 합의 상태
- `qa/latest-test-summary.md`
  - 가장 최근 테스트/검증 결과 요약

파일명은 필요하면 늘릴 수 있지만, 최소 진입점은 위 이름을 유지하는 쪽이 좋다.

## 실전 사용 흐름

### 1. 작업 시작

- `sessions/current.json`의 목표, status, 관련 문서 경로를 갱신한다.
- 긴 작업이면 `plans/current-plan.md`를 먼저 적는다.

### 2. 분석 단계

- 관련 파일, 영향 범위, 기존 패턴은 `analysis/current-analysis.md`에 쓴다.
- 채팅에는 무엇을 봤는지와 파일 경로만 남긴다.

### 3. 구현 단계

- 현재 수정 범위, 완료/미완료, 막힌 점은 `execution/current-task.md`에 갱신한다.
- 로그 전체를 붙이지 말고 결론만 요약한다.

### 4. 리뷰 단계

- 리뷰 후보는 `review/candidate-issues.md`에 모은다.
- codex / gemini 교차검토를 하면 `ISSUE / DROP / 보류` 상태까지 남긴다.

### 5. QA 단계

- 테스트 커맨드, 결과, 실패 원인, 재현 링크/경로는 `qa/latest-test-summary.md`에 남긴다.
- 실행 전 `source ./env.sh`가 필요한지 확인한다.

### 6. 인계 단계

- 세션 종료 전 `handoff/next-agent-brief.md`를 갱신한다.
- 다음 에이전트가 필요한 파일만 바로 열 수 있게 경로를 남긴다.

### 7. stale 판정

- `sessions/current.json`의 `last_updated`가 24시간 이상 갱신되지 않았으면 stale로 본다.
- stale 상태면 다음 에이전트는 파일을 그대로 믿지 말고 범위와 진행 상태를 다시 확인한다.
- scope가 바뀌었는데 state 파일이 그대로면 stale로 본다.

## 채팅에 남길 최소 형식

긴 상태를 전달할 때는 아래 4개만 유지하면 된다.

- `state_path`
- `summary`
- `open_questions`
- `next_action`

예:

```md
state_path: codex-state/execution/current-task.md
summary: sample 공개 페이지 API 연동 완료, rule-gate 기존 실패 2건은 별도 이슈로 분리
open_questions: dashboard/tasks 기존 `items` 계약 위반을 이번 턴에 함께 다룰지 미정
next_action: 리뷰 요청 전 최소 검증 결과를 qa/latest-test-summary.md에 정리
```

## 파일 작성 규칙

- UTF-8 유지
- 경로는 레포 루트 기준 상대경로 사용
- 사실/근거와 추측을 섞지 않는다
- 명령을 실행했으면 커맨드와 결과를 같이 남긴다
- 민감정보는 마스킹하거나 생략한다

## 버전 관리 원칙

- `codex-state/`는 상태 폴더라서 모든 파일을 항상 커밋할 필요는 없다.
- 아래는 저장소에 남겨도 되는 템플릿/가이드 성격이다.
  - `codex-state/README.md`
  - `codex-state/artifacts/README.md`
- 아래는 기본적으로 런타임 상태 파일로 보고, 기능 커밋에는 포함하지 않는 쪽을 기본값으로 본다.
  - `codex-state/sessions/current.json`
  - `codex-state/handoff/next-agent-brief.md`
  - `codex-state/analysis/current-analysis.md`
  - `codex-state/plans/current-plan.md`
  - `codex-state/execution/current-task.md`
  - `codex-state/review/candidate-issues.md`
  - `codex-state/qa/latest-test-summary.md`
- 런타임 상태 파일을 저장소에 남길 때는 의도된 스냅샷인지 먼저 확인한다.
- 임시 로그나 대형 산출물은 가능하면 경로만 남긴다.
