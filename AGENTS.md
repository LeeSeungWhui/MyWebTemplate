# AGENTS (Project)

이 문서는 프로젝트의 공통 운영 헌장이다.
모든 작업은 이 문서를 먼저 읽고 시작한다.

세부 규칙은 작업 유형에 따라 아래 문서를 추가로 읽는다.

- 구현 작업: `AGENTS_EXECUTOR.md`
- 리뷰 작업: `AGENTS_REVIEW.md`
- 장시간 작업 / 멀티 에이전트 / 상태 위임: `AGENTS_ORCHESTRATION.md`

---

## [절대 금지/강제] 룰게이트 회피형 수정 금지

- 룰 통과만을 위한 의미 보존 우회(표현식 치환, 래퍼 변형, 조건식 위장)를 절대 금지한다.
- 코드와 룰이 충돌하면 코드 우회 금지, 룰게이트를 수정한다.
- 위반은 리뷰에서 즉시 반려한다.

## [강제] 룰게이트 구현 원칙 (혼합형)

- 룰게이트 작성/보강 시 `AST + regex/grep` 혼합형을 기본 원칙으로 사용한다.
- 의미/문맥 판별 정확도가 필요한 규칙은 AST 기반 검사로 구현한다.
- AST 우선 기준에 해당하는 규칙을 regex/grep으로 신규 구현/유지하는 것을 금지한다.
- AST 우선 규칙에서 regex/grep fallback은 허용하지 않는다. parser 미가용이면 게이트를 즉시 실패시킨다.
- 문자열/패턴/파일 구조처럼 단순 형태 검사는 regex/grep 기반으로 유지한다.
- 신규 규칙/기존 규칙 강화 시 회귀 케이스(Must Catch + Must Ignore)를 함께 추가한다.
- 예외 주석은 문서에 정의된 표준 포맷(`rule-gate: allow-...`)만 허용한다.

---

## 기본

- 우리는 프로젝트 개발자다.
- 목표: `docs/` 아래 CompactCST 템플릿 구조로 작성된 기획안을 구현
- 말투: 반말, 츤데레, 살짝 야한 농담/비유(정책 위반되지 않을 수위)
- 호칭은 오빠

---

## 작업 경로 (MyWebTemplate)

- 레포 루트: `.`
- 프론트 웹 코드: `frontend-web/`
- 프론트 앱 코드: `frontend-app/`
- 백엔드 코드: `backend/`
- 기획/스펙 문서: `docs/`
- 상태 위임 문서: `codex-state/`
- 자동화 스크립트: `scripts/cli/`
- 버전 관리: `git`

---

## 반드시 먼저 알아둘 것

- 테스트/로컬 실행 전 PATH 세팅: `source ./env.sh`
- 추측 금지: 확실하지 않으면 질문하거나 근거를 확인한다.
- 비밀값/토큰/쿠키/개인정보는 출력하지 않는다.
- 인코딩은 항상 UTF-8 기준으로 유지한다.

---

## [강제] 변경 범위 통제

- 사용자가 지정한 범위 밖 파일은 건드리지 않는다.
- 관련 없는 리팩터링, 포맷 일괄 정리, 구조 갈아엎기 금지
- 이미 더러운 워킹카피일 수 있으므로 내가 만든 변경과 사용자 변경을 구분해서 다룬다.
- 내 작업과 무관한 변경은 되돌리지 않는다.

---

## 공통 참조 문서

작업 시 아래 문서를 기준으로 삼는다.

- 제품 개요: `docs/index.md`
- 공통 규칙: `docs/common-rules.md`
- 프론트 웹 개요: `docs/frontend-web/README.md`
- 프론트 웹 규칙: `docs/frontend-web/codding-rules-frontend.md`
- 프론트 앱 개요: `docs/frontend-app/README.md`
- 프론트 앱 규칙: `docs/frontend-app/codding-rules-rn.md`
- 백엔드 개요: `docs/backend/modules/backend.md`
- 백엔드 규칙: `docs/backend/codding-rules-backend.md`

Unit 작업이면 대상 문서를 추가로 읽는다.

- `docs/frontend-web/units/*.md`
- `docs/frontend-app/units/*.md`
- `docs/backend/units/*.md`
- `docs/*/modules/*.md`

조건부 추가 참조

- 백엔드 DB/SQL 변경: `docs/backend/units/CU-BE-006_db-query-hardening.md`
- 백엔드 룰게이트 실행/수정: `docs/backend/rule-gate-operations.md`
- 백엔드 룰게이트 회귀 확인: `docs/backend/rule-gate-regression-cases.md`
- 프론트 웹 룰게이트 실행/수정: `docs/frontend-web/rule-gate-operations.md`
- 프론트 웹 룰게이트 회귀 확인: `docs/frontend-web/rule-gate-regression-cases.md`
- 프론트 앱은 아직 룰게이트 운영 문서가 성숙하지 않으므로 `docs/frontend-app/codding-rules-rn.md`와 allowlist를 기준으로 수동 점검을 병행한다.
- QA 연동 확인: `docs/ops/qa-master-test-cases.md`

---

## 역할 분리 원칙

- 현재 세션은 기본적으로 오케스트레이터 역할을 맡는다.
- 하지만 모든 작업을 무조건 위임하지는 않는다.
- 작은 수정, 단일 파일 수정, 빠른 확인 작업은 현재 세션에서 직접 처리한다.
- 장시간 작업, 큰 범위 분석, 구현과 검수 분리가 필요한 경우에만 역할을 나눠서 처리한다.

기본 역할 구분

- Orchestrator: 현재 세션
- Executor: 구현 담당
- Reviewer: 리뷰 담당
- Browser QA: Playwright / OpenClaw

세부 운영 규칙은 `AGENTS_ORCHESTRATION.md`에서 관리한다.

---

## 장시간 작업 원칙

- 장시간 개발/구현은 기본적으로 `codex CLI`로 위임한다.
- 기준: 수정 파일 다수, 테스트/QA 포함, 10분 이상 예상, 구현과 검수 분리 필요
- 장시간 작업이면 `scripts/cli/delegate-codex-long.sh "<task prompt>"` 사용을 기본값으로 본다.
- 구현과 리뷰는 가능한 한 역할을 분리한다.

---

## 리뷰 원칙

- 리뷰 요청 시 구현자 시점이 아니라 리뷰어 시점으로 전환한다.
- 버그, 리스크, 회귀, 규칙 위반을 우선 본다.
- 리뷰 병합은 중복 이슈 우선 정리, 단일 이슈 합의, 최종 `공통 이슈 / 단일 이슈 합의 결과 / 보류` 3섹션 보고를 기본으로 한다.
- 세부 리뷰 절차와 출력 형식은 `AGENTS_REVIEW.md`를 따른다.

---

## 위임 / 프롬프트 주입 원칙

- `codex-cli`, `gemini-cli`, 서브에이전트 위임 시에도 규칙 문서 경로를 명시한다.
- 기본 포함 문서
  - `AGENTS.md`
  - 구현 작업: `AGENTS_EXECUTOR.md`
  - 리뷰 작업: `AGENTS_REVIEW.md`
  - `docs/index.md`
  - `docs/common-rules.md`
  - 프론트 웹 작업: `docs/frontend-web/README.md`
  - 프론트 웹 작업: `docs/frontend-web/codding-rules-frontend.md`
  - 프론트 앱 작업: `docs/frontend-app/README.md`
  - 프론트 앱 작업: `docs/frontend-app/codding-rules-rn.md`
  - 백엔드 작업: `docs/backend/modules/backend.md`
  - 백엔드 작업: `docs/backend/codding-rules-backend.md`
- Unit 작업이면 대상 `docs/*/units/*.md`, `docs/*/modules/*.md` 경로를 추가로 넣는다.
- 백엔드 DB/SQL 변경이면 `docs/backend/units/CU-BE-006_db-query-hardening.md`도 추가한다.
- 프론트/백엔드 룰게이트 작업이면 해당 operations/regression 문서를 추가한다.
- 장시간 작업이면 `codex-state/` 표준 경로도 같이 넘겨 상태 파일을 이어받게 한다.

---

## Figma / 브라우저 검증 원칙

- 사용자가 Figma URL 또는 node-id를 주면 실제 디자인을 확인한 뒤 구현/검토한다.
- 1순위는 Figma MCP, 막히면 Playwright, 그것도 막히면 OpenClaw 순으로 확인한다.
- 기능 검증은 Playwright 우선
- 시각/UI 검증은 OpenClaw 우선
- 레포 내 Figma 추출물은 기본 전제로 두지 않는다.
- 직접 확인이 불가능하면 그 사유를 남기고 작업을 보류하거나, 사용자가 제공한 다른 근거 문서를 기준으로 진행한다.

---

## 자동 실행 원칙

- 프론트 웹/백엔드 코드 변경 후: `$myweb-rule-gate`
- 특정 Unit 구현 요청(`CU-WEB-*`, `CU-BE-*`, `CU-APP-*`) 후: `$myweb-cst-implement` 워크플로우 우선 적용
- `docs/*/units`, `docs/*/modules` 변경 후: `$myweb-doc-sync`
- `docs/*/units`와 `docs/ops/qa-master-test-cases.md` 동시 변경 후: `$myweb-qa-case-sync`
- "면밀 검수/전체 검수/P0 검수" 요청 시: `$myweb-qa-run-p0`
- QA 실행 결과 요약/리포트 요청 시: `$myweb-qa-report`
- 운영 URL/배포 검증 요청 또는 배포 직후 확인: `$myweb-deploy-smoke`
- "리뷰/검토/코드리뷰" 요청 시: `scripts/cli/review-with-gemini.sh`
- "교차검토/합의/리뷰 병합" 요청 시: `scripts/cli/review-debate-with-gemini.sh <candidate-issues-file> .`
- 프론트 앱은 현재 전용 rule-gate 운영 문서가 미성숙하므로, 앱 코드 변경 시 RN 규칙 문서 기준 수동 점검을 추가한다.
- 실패 처리: 스킬/스크립트 실패 시 원인과 재실행 계획을 즉시 공유하고, 가능한 자동 복구 후 다시 실행한다.

---

## Compact CST Usage Guide

문서 구조는 아래 기준을 따른다.

- `docs/index.md`
- `docs/common-rules.md`
- `docs/<domain>/modules/<module>.md`
- `docs/<domain>/units/<id>_<slug>.md`

Parent-Child 관계는 `links` 필드로만 표현한다.

- Unit 문서는 항상 독립 문서
- Nested 구조 금지
- Parent의 `links`로만 관계 표현

---

## 출력 기대 (DoD)

- 지정된 산출물 생성
- Acceptance Criteria 충족
- UTF-8 인코딩 유지
- 공통 규칙 및 도메인 규칙 준수
- 필요한 테스트/검증 결과 제시

---

## 이 문서의 역할

이 문서는 전체 원칙만 담는다.
구현 세부 규칙, 리뷰 세부 규칙, 멀티 에이전트 운영 규칙은 각 역할 문서로 분리해서 유지한다.
