# AGENTS_ORCHESTRATION.md

이 문서는 멀티 에이전트, 상태 위임, 도구 라우팅 운영 규칙을 정의한다.

이 문서를 읽기 전에 반드시 아래 문서를 먼저 읽는다.

- `temp_agent/AGENTS.md`
- 구현이 목적이면 `temp_agent/AGENTS_EXECUTOR.md`
- 리뷰가 목적이면 `temp_agent/AGENTS_REVIEW.md`

---

## 목적

오케스트레이션의 목적은 “괜히 에이전트를 많이 쓰는 것”이 아니다.

목표는 아래 3가지다.

- 긴 작업의 속도 향상
- 역할 분리로 정확도 향상
- 대화 컨텍스트 과적재 방지

즉, 메인 에이전트는 지휘를 맡고,
필요할 때만 서브에이전트를 적절히 붙인다.

---

## 기본 원칙

- 작은 작업은 메인 에이전트가 직접 처리한다.
- 분리 이득이 분명할 때만 서브에이전트를 호출한다.
- 역할이 겹치는 서브에이전트를 동시에 남발하지 않는다.
- 컨텍스트에는 원문 로그 대신 요약만 유지한다.
- 충돌 해결 책임은 메인 에이전트가 가진다.

---

## 언제 서브에이전트를 쓰는가

다음 조건 중 하나라도 해당하면 서브에이전트 사용을 적극 고려한다.

- 수정 파일이 많다
- 프론트 / 백엔드 / 문서 / QA가 한 작업에 섞여 있다
- 대규모 코드 탐색이 먼저 필요하다
- 구현과 리뷰를 분리해야 한다
- 테스트 실패 원인을 병렬로 추적하는 것이 유리하다
- Figma 확인, 브라우저 검증, 코드 수정이 동시에 필요하다

반대로 아래는 직접 처리 우선이다.

- 단일 파일 수정
- 빠른 버그 픽스
- 영향 범위가 매우 좁은 작업
- 강하게 얽힌 코드라 병렬 분리가 오히려 위험한 경우

---

## 서브에이전트 역할 예시

실제 역할은 작업에 맞게 좁게 정한다.

- Analyzer: 영향 범위 조사, 관련 파일 찾기, 기존 패턴 정리
- Implementer: 특정 파일군 구현
- Tester: 테스트 실행, 실패 원인 정리
- Reviewer: 변경분 리스크 점검
- Browser QA: Playwright / OpenClaw 기반 흐름 검증

중요 원칙

- 한 에이전트에 역할을 너무 많이 섞지 않는다.
- “프론트 전체 다 봐” 같은 넓은 지시보다, 파일군/책임을 잘라서 준다.
- 결과는 요약과 결론만 받는다.

---

## 권장 분해 패턴

### 1. 분석 → 구현 → 검증

가장 기본 패턴이다.

- Analyzer가 영향 범위를 찾는다.
- Implementer가 수정한다.
- Tester/Reviewer가 검증한다.
- 메인 에이전트가 결과를 합친다.

### 2. 프론트 / 백엔드 분리

양쪽이 같이 물린 작업에 쓴다.

- 프론트 구현 담당
- 백엔드 구현 담당
- 메인 에이전트가 API 계약과 최종 결과를 맞춘다.

### 3. 코드 / 브라우저 QA 분리

UI 플로우 작업에 쓴다.

- Implementer가 코드 수정
- Browser QA가 Playwright/OpenClaw 검증
- 메인 에이전트가 차이를 반영

### 4. 리뷰 분리

장시간 구현 후 품질 확인에 쓴다.

- Implementer가 수정
- Reviewer가 리스크 검토
- 필요 시 gemini CLI와 합의 절차 연결

---

## 상태 위임 원칙

긴 작업 상태는 대화 컨텍스트에 다 밀어 넣지 않는다.
원문은 파일/로그에 두고, 컨텍스트에는 요약만 유지한다.

외부 상태로 관리하기 좋은 예

- repo 분석 결과
- 테스트 로그
- candidate issues
- large diff 메모
- 브라우저 캡처 경로

상태를 남길 때 권장 형식

- `state_path`
- `summary`
- `open_questions`
- `next_action`

원문 로그를 통째로 대화에 복붙하지 않는다.

### codex-state 표준 경로

상태 파일은 기본적으로 `codex-state/` 아래 표준 경로를 우선 사용한다.

- 세션 진입점: `codex-state/sessions/current.json`
- 다음 에이전트 인계: `codex-state/handoff/next-agent-brief.md`
- 분석 메모: `codex-state/analysis/current-analysis.md`
- 작업 계획: `codex-state/plans/current-plan.md`
- 구현 진행 상태: `codex-state/execution/current-task.md`
- 리뷰 후보/합의: `codex-state/review/candidate-issues.md`
- 최신 테스트 요약: `codex-state/qa/latest-test-summary.md`
- 대형 산출물 경로 메모: `codex-state/artifacts/`

운영 원칙

- 긴 작업을 시작하면 먼저 `sessions/current.json`과 `plans/current-plan.md`를 갱신한다.
- 분석이 길어지면 `analysis/current-analysis.md`에 근거를 남긴다.
- 구현 중 상태 변화는 `execution/current-task.md`에 누적한다.
- 리뷰 병합/합의는 `review/candidate-issues.md`를 기준으로 관리한다.
- 테스트/QA 실행 결과는 `qa/latest-test-summary.md`에 남긴다.
- 세션을 넘기거나 중단하기 전에 `handoff/next-agent-brief.md`를 갱신한다.
- `last_updated` 기준 24시간 이상 갱신이 없으면 stale 상태로 보고 재확인한다.

---

## 도구 라우팅 원칙

추측보다 도구를 우선한다.

### 코드 탐색

- 파일 목록: `rg --files`
- 문자열 탐색: `rg`
- 파일 내용 확인: `sed`, `nl`, `svn diff`

### 구현/검증

- 수정: 패치 기반 편집
- 테스트: 프로젝트별 최소 테스트 우선
- 변경 확인: `svn status`, `svn diff`

### 브라우저 / GUI

- 기능 검증: Playwright 우선
- 시각/UI 문제: OpenClaw 우선

### 리뷰

- 현재 세션 1차 리뷰
- `scripts/cli/review-with-gemini.sh`
- `scripts/cli/review-debate-with-gemini.sh`

### 위임 프롬프트

- 위임 프롬프트에는 적용 규칙 문서 경로를 명시한다.
- 구현 위임 기본
  - `temp_agent/AGENTS.md`
  - `temp_agent/AGENTS_EXECUTOR.md`
  - `docs/index.md`
  - `docs/common-rules.md`
  - 프론트: `docs/frontend/index.md`
  - 프론트: `docs/frontend/codding-rules-frontend.md`
  - 백엔드: `docs/backend/index.md`
  - 백엔드: `docs/backend/codding-rules-backend.md`
  - 대상 Unit / module 문서
  - 백엔드 DB/SQL 변경 시 `docs/backend/schema/develop_cvfit.sql`, `docs/backend/units/BE-DATA-001_database-schema.md`
  - 프론트 룰게이트 작업 시 `docs/frontend/rule-gate-operations.md`
  - 필요 시 `docs/frontend/rule-gate-authoring.md`, `docs/frontend/rule-gate-regression-cases.md`
- 리뷰 위임 기본
  - `temp_agent/AGENTS.md`
  - `temp_agent/AGENTS_REVIEW.md`
  - `docs/index.md`
  - `docs/common-rules.md`
  - 프론트: `docs/frontend/index.md`
  - 프론트: `docs/frontend/codding-rules-frontend.md`
  - 백엔드: `docs/backend/index.md`
  - 백엔드: `docs/backend/codding-rules-backend.md`
  - 기획/문서 리뷰 요청 시 `docs/REVIEW_REQUEST.md`
  - 백엔드 DB/SQL 영향 리뷰 시 `docs/backend/schema/develop_cvfit.sql`, `docs/backend/units/BE-DATA-001_database-schema.md`
  - 프론트 룰게이트 리뷰 시 `docs/frontend/rule-gate-operations.md`
  - 필요 시 `docs/frontend/rule-gate-authoring.md`, `docs/frontend/rule-gate-regression-cases.md`
  - `codex-state/review/candidate-issues.md`
- 장시간 작업이면 `codex-state/sessions/current.json`, `codex-state/handoff/next-agent-brief.md`도 같이 넘긴다.

---

## OpenClaw / Playwright 운영 기준

`AGENTS.md`에는 원칙만 두고,
실행 판단은 여기서 더 구체화한다.

브라우저 검증 분기

- 기능/플로우/버튼 동작: Playwright 우선
- CSS 깨짐/반응형/픽셀 비교/스크린샷 증거: OpenClaw 우선

자동 트리거 예

- 피그마 대비 화면 확인
- “눌렀더니 UI가 이상함” 재현
- 단계 이동 검증
- 모달/팝업/레이아웃 깨짐 확인

주의

- 로그인/토큰 등 민감정보 입력이 필요하면 먼저 사용자 확인
- 직접 검증이 불가능하면 사유와 대체 근거를 남긴다

---

## codex CLI 위임 기준

장시간 작업은 codex CLI 위임을 기본 규칙으로 본다.

예시

- `scripts/cli/bootstrap-agent-tools.sh`
- `scripts/cli/delegate-codex-long.sh "<task prompt>"`

적합한 경우

- 수정 파일 다수
- 테스트/QA 포함
- 10분 이상 예상
- 구현과 검수 역할 분리 필요

위 조건에 해당하면 특별한 이유가 없는 한 현재 세션 단독 처리보다 위임을 우선한다.

추가 원칙

- 이미 executor로 위임된 작업은 다시 `delegate-codex-long.sh`로 재위임하지 않는다.
- 재위임 대신 `codex-state/` 표준 상태 파일을 갱신해 컨텍스트를 유지한다.

---

## 리뷰 오케스트레이션

리뷰 요청 시 기본 흐름은 아래를 따른다.

1. 현재 세션 1차 리뷰
2. `scripts/cli/review-with-gemini.sh .`
3. 공통 이슈와 단일 이슈를 분리해 `codex-state/review/candidate-issues.md` 정리
4. 중복 이슈를 최우선 목록으로 정렬
5. `scripts/cli/review-debate-with-gemini.sh <candidate-issues-file> .`
6. 미합의 단일 이슈가 남으면 `candidate-issues`를 갱신하고 5)를 반복
7. 최종 보고는 아래 3섹션으로 고정
   - `공통 이슈(중복, 최우선)`
   - `단일 이슈 합의 결과(채택/기각)`
   - `보류/확인 필요`

즉, 구현 오케스트레이션과 리뷰 오케스트레이션은 분리해서 생각한다.

---

## 충돌 해결 원칙

서브에이전트 결과가 충돌하면 메인 에이전트가 아래 기준으로 정리한다.

- 사용자 지시 우선
- 스펙 문서 우선
- 프로젝트 규칙 문서 우선
- 실제 코드 계약/테스트 결과 우선

충돌 상태를 애매하게 덮지 않는다.
필요하면 사용자에게 확인을 요청한다.

---

## 산출물 정리 원칙

오케스트레이션 결과 보고에는 아래가 남아야 한다.

- 어떤 작업을 어떻게 분해했는지
- 어떤 역할이 무엇을 맡았는지
- 어떤 결과를 채택했는지
- 남은 리스크가 무엇인지

단, 세부 로그를 길게 풀지 말고 요약 중심으로 정리한다.

---

## 이 문서의 역할

이 문서는 멀티 에이전트 운영 규칙만 다룬다.

- 구현 세부는 `temp_agent/AGENTS_EXECUTOR.md`
- 리뷰 세부는 `temp_agent/AGENTS_REVIEW.md`
- 공통 헌장은 `temp_agent/AGENTS.md`

즉, 여기서는 “누가 무엇을 어떻게 나눠서 처리할지”만 관리한다.
