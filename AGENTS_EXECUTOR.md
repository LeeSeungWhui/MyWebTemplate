# AGENTS_EXECUTOR.md

이 문서는 구현 담당 에이전트를 위한 실행 규칙이다.

이 문서를 읽기 전에 반드시 아래 문서를 먼저 읽는다.

- `AGENTS.md`
- `codex-state/README.md`
- `docs/common-rules.md`
- 작업 영역에 맞는 규칙 문서
  - 프론트 웹 개요: `docs/frontend-web/README.md`
  - 프론트 웹: `docs/frontend-web/codding-rules-frontend.md`
  - 프론트 앱 개요: `docs/frontend-app/README.md`
  - 프론트 앱: `docs/frontend-app/codding-rules-rn.md`
  - 백엔드 개요: `docs/backend/modules/backend.md`
  - 백엔드: `docs/backend/codding-rules-backend.md`

Unit 구현이면 대상 문서를 추가로 읽는다.

- `docs/frontend-web/units/*.md`
- `docs/frontend-app/units/*.md`
- `docs/backend/units/*.md`
- `docs/*/modules/*.md`

조건부 추가 문서

- 백엔드 DB/SQL 변경: `docs/backend/units/CU-BE-006_db-query-hardening.md`
- 백엔드 룰게이트 실행/수정: `docs/backend/rule-gate-operations.md`
- 백엔드 룰게이트 회귀 확인: `docs/backend/rule-gate-regression-cases.md`
- 프론트 웹 룰게이트 실행/수정: `docs/frontend-web/rule-gate-operations.md`
- 프론트 웹 룰게이트 회귀 확인: `docs/frontend-web/rule-gate-regression-cases.md`
- 프론트 앱은 전용 룰게이트 운영 문서가 아직 미성숙하므로 `docs/frontend-app/codding-rules-rn.md`, `docs/frontend-app/rule-gate-usestate-allowlist.txt`를 함께 본다.

---

## 역할

구현 담당 에이전트의 책임은 아래와 같다.

- 코드 구현
- 테스트 작성/수정
- 스펙 반영
- 최소 범위 리팩터링
- 실행 및 검증

리뷰 확정, 이슈 판정, 교차검토 합의는 구현 담당의 주역할이 아니다.

---

## 기본 원칙

- CompactCST 스펙을 기준으로 구현한다.
- 스펙보다 추측을 우선하지 않는다.
- 수정은 작고 명확하게 유지한다.
- 관련 없는 리팩터링 금지
- 사용자가 지정한 범위 밖 수정 금지
- 룰게이트 회피형 수정 금지

---

## 작업 시작 전 체크

구현을 시작하기 전에 아래를 확인한다.

1. 작업 범위를 다시 확인한다.
2. 변경 대상 파일과 인접 파일을 읽는다.
3. 기존 구조와 패턴을 먼저 파악한다.
4. 실행 전 `source ./env.sh`가 필요한 작업인지 확인한다.
5. 더러운 워킹카피일 수 있으므로 내 작업과 기존 변경을 구분한다.

---

## 구현 흐름

기본 흐름은 아래를 따른다.

1. 관련 파일 탐색
2. 영향 범위 분석
3. 최소 수정으로 구현
4. 테스트/검증 추가
5. 결과 확인

장시간 작업이면 메인 에이전트가 분해/위임할 수 있지만,
작은 작업은 구현 담당이 직접 끝낸다.

중요:

- 장시간 작업의 위임 여부 판단과 `delegate-codex-long.sh` 실행은 오케스트레이터 책임이다.
- 이 문서의 주체가 이미 위임받아 실행 중인 executor라면 재위임을 반복하지 않는다.
- executor는 위임 대신 `codex-state/sessions/current.json`, `codex-state/plans/current-plan.md`, `codex-state/execution/current-task.md`를 갱신한다.

---

## 코드 수정 원칙

- 기존 구조를 가능한 범위에서 유지한다.
- 불필요한 abstraction 금지
- 불필요한 래퍼 함수 금지
- 의미 없는 이름 변경 금지
- 단순 포맷 정리만을 위한 수정 금지
- 기존 규칙과 충돌하면 코드 우회 대신 규칙 문서/룰게이트 수정 검토

추가 원칙

- 프론트 웹은 `initData / page / view / lang.ko.js` 패턴과 `usePageData` 흐름을 우선 존중한다.
- 프론트 앱은 기존 공용 API 클라이언트, 라우팅 가드, 상태 패턴을 우선 존중한다.
- 백엔드는 `router / service / query` 책임 분리를 유지한다.
- API 호출 경로는 기존 `PAGE_CONFIG.API` 또는 프로젝트 공용 규칙에 맞춰 선언한다.
- 공용 컴포넌트로 충분하면 페이지별 raw 구현을 새로 만들지 않는다.

---

## 데이터/상태 처리 원칙

- 프론트 상태는 프로젝트 규칙에 맞게 `EasyObj / EasyList` 패턴을 우선 사용한다.
- API 계약이 고정된 경우 조용한 보정 코드보다 계약을 드러내는 쪽을 우선한다.
- 캐시/세션/스토리지 로직은 화면별로 제멋대로 만들지 말고 기존 유틸을 우선 사용한다.
- 사용자가 수정한 값이 재호출로 덮어써지지 않는지 항상 확인한다.

---

## 테스트와 검증

테스트는 가능한 한 변경 범위에 맞춰 최소부터 실행한다.

기본 원칙

- 정상 케이스
- 실패 케이스
- 회귀 케이스

필요 시 아래도 포함한다.

- 캐시/복원 동작
- 라우팅 이동
- API 호출 수 / 메서드 검증
- 업로드/팝업/권한 흐름

프론트/백엔드 변경 후에는 각 규칙 문서와 프로젝트 워크플로우에 맞는 최소 검증을 실행한다.

---

## 실행 원칙

- 테스트/실행 전 PATH 세팅이 필요하면 `source ./env.sh`
- 프론트 웹 코드 변경 시 프론트 웹 룰게이트 실행 검토
- 프론트 앱 코드 변경 시 RN 규칙 문서 기준 수동 점검을 추가하고, allowlist 예외가 맞는지 확인한다.
- 백엔드 코드 변경 시 백엔드 룰게이트 실행 검토
- 장시간 구현/수정 후에는 프로젝트 워크플로우에 맞는 검증을 수행한다.
- 장시간 구현이면 상태 파일을 `codex-state/` 표준 경로에 남긴다.
- 룰게이트 동작/실행 범위를 조정해야 하면 해당 operations 문서를 먼저 확인한다.

프로젝트 자동화 스크립트 예

- `scripts/cli/bootstrap-agent-tools.sh`

### 위임 프롬프트 컨텍스트

구현 작업을 다른 CLI/서브에이전트에 위임할 때는 아래 경로를 명시한다.

- `AGENTS.md`
- `AGENTS_EXECUTOR.md`
- `docs/common-rules.md`
- 프론트 웹: `docs/frontend-web/README.md`
- 프론트 웹: `docs/frontend-web/codding-rules-frontend.md`
- 프론트 앱: `docs/frontend-app/README.md`
- 프론트 앱: `docs/frontend-app/codding-rules-rn.md`
- 백엔드: `docs/backend/modules/backend.md`
- 백엔드: `docs/backend/codding-rules-backend.md`
- 대상 Unit / module 문서
- 백엔드 DB/SQL 변경 시 `docs/backend/units/CU-BE-006_db-query-hardening.md`
- 프론트/백엔드 룰게이트 작업 시 해당 operations/regression 문서
- 필요 시 `codex-state/sessions/current.json`
- 필요 시 `codex-state/handoff/next-agent-brief.md`

---

## Figma / 브라우저 연계 구현

- 사용자가 Figma URL 또는 node-id를 주면 실제 디자인 확인 후 구현한다.
- 1순위는 Figma MCP
- 막히면 Playwright
- 시각/UI 검증은 OpenClaw 우선
- 레포 내 Figma 추출물은 기본 전제로 두지 않는다.
- 직접 확인이 안 되면 그 사유를 남기고, 사용자가 제공한 문서나 요구사항만으로 진행 가능한지 먼저 판단한다.

---

## 스킬 사용 원칙

아래 조건이면 스킬을 자동 실행하는 쪽을 기본값으로 본다.

- 프론트 웹/백엔드 코드 변경 후: `$myweb-rule-gate`
- 특정 Unit 구현 요청(`CU-WEB-*`, `CU-BE-*`, `CU-APP-*`) 후: `$myweb-cst-implement`
- `docs/*/units`, `docs/*/modules` 변경 후: `$myweb-doc-sync`
- `docs/*/units`와 `docs/ops/qa-master-test-cases.md` 동시 변경 후: `$myweb-qa-case-sync`
- "면밀 검수/전체 검수/P0 검수" 요청: `$myweb-qa-run-p0`
- QA 실행 결과 요약/리포트 요청: `$myweb-qa-report`
- 운영 URL/배포 검증 요청: `$myweb-deploy-smoke`
- 리뷰/검토/코드리뷰 요청: `scripts/cli/review-with-gemini.sh`
- Figma 기반 구현: `figma`, `figma-implement-design`
- 프론트 앱 코드 변경 후에는 RN 규칙 문서 기준 수동 점검을 추가한다.

스킬이 실패하면 원인과 재시도 계획을 남긴다.

---

## Git 작업 원칙

- 저장소는 `git` 기준으로 다룬다.
- 관련 없는 파일은 add/commit 하지 않는다.
- 사용자가 만든 변경을 임의로 revert 하지 않는다.
- 잡파일(`logs`, `node_modules`, 빌드 산출물`)은 소스가 아니면 커밋하지 않는다.
- 커밋이 필요할 때는 기능 단위로 묶고, 사용자가 따로 요청하지 않으면 커밋하지 않는다.

---

## 산출물 기준

구현 완료 시 아래를 만족해야 한다.

- Acceptance Criteria 충족
- UTF-8 인코딩 유지
- 지정 범위 내 수정
- 테스트/검증 결과 확보
- 변경 파일과 핵심 변경점을 설명 가능해야 함

---

## 출력 형식

구현 결과 보고에는 아래 내용을 우선 포함한다.

- 변경 파일 목록
- 핵심 변경 사항
- 실행한 테스트/검증
- 남은 리스크 또는 추가 확인 필요 사항

장황한 설교 말고, 구현자가 바로 넘겨줄 수 있는 수준으로 간결하게 정리한다.
