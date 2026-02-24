---
id: CU-WEB-015
name: Demo Portfolio Page Refresh (Visual + Trust)
module: web
status: implemented
priority: P2
links: [CU-WEB-011, CU-WEB-012, CU-WEB-013, CU-WEB-003, CU-WEB-005]
---

### Purpose
- 기존 `/portfolio`를 제거하고 `/demo/portfolio` 단일 공개 경로로 정렬해, 텍스트 중심 화면을 시각 중심으로 개편해 신뢰도를 높인다.
- 고객이 기술 스택/아키텍처/데모 동선을 한 화면에서 빠르게 이해하도록 한다.

### Scope
- 포함
  - Hero 개편(강한 한줄 메시지 + CTA)
  - 핵심 구현 카드(인증/API/컴포넌트)
  - 아키텍처 다이어그램 섹션
  - 데모 스크린샷 + 이동 CTA
  - 기존 기술 상세 접기/펼치기 유지
- 제외
  - 블로그/장문 기술문서 통합

### Interface
- 라우트(UI)
  - `GET /demo/portfolio` (공개)

### Sections
- Hero: 그라디언트 배경 + 큰 제목 + 한줄 소개
- 프로젝트 개요: Stat 카드 3개(프로젝트 형태/핵심 도메인/데모 경로)
- 핵심 구현: 3개 카드(인증/API/컴포넌트)
- 아키텍처: `Browser → Nginx → FastAPI + Next.js` 다이어그램
- 데모 동선: 스크린샷 3장 + 각 CTA 버튼
- 스택 뱃지: pill 스타일
- 기술 상세: 접기/펼치기 섹션 유지

### Data & Rules
- 고객 대상 페이지이므로 내부 구현 디테일보다 결과 중심 메시지를 우선한다.
- 기존 `mode/path` 등 개발자 내부 표식은 과감히 숨긴다.
- CTA는 데모 페이지/컴포넌트 경로로 명확히 연결한다(로그인 CTA 비노출).
- 공개 페이지 공통 GNB(CU-WEB-012)와 동일 메뉴 구조를 사용한다.
- 공개 노출 기본 경로는 `/demo/portfolio`를 기준으로 한다.

### NFR & A11y
- 이미지/다이어그램 대체 텍스트 제공.
- 색 대비/타이포 계층으로 가독성 확보.

### Acceptance Criteria
- AC-1: `/demo/portfolio` 첫 화면에 Hero 섹션(제목 + 소개문 + CTA)이 렌더링된다.
- AC-2: `프로젝트 개요`, `핵심 구현`, `아키텍처`, `데모 동선`, `스택 뱃지`, `기술 상세` 6개 섹션이 순서대로 렌더링된다.
- AC-3: 데모 동선 섹션에서 스크린샷 카드 3개와 각 CTA 버튼이 노출되고 클릭 동작이 가능하다.
- AC-4: 기존 `mode/path` 뱃지는 화면에서 제거된다.
- AC-5: 공개 GNB 메뉴(`데모/컴포넌트/포트폴리오`)가 랜딩과 동일하게 노출된다.
- AC-6: 아키텍처 섹션에 `Browser → Nginx → FastAPI + Next.js` 흐름이 시각적으로 표현된다.

### Tasks
- T1: `/demo/portfolio` 기준으로 섹션 구조를 재편한다(텍스트벽 해소).
- T2: 아키텍처 다이어그램/스크린샷 카드 컴포넌트 정리.
- T3: CTA 버튼 경로 점검(데모/컴포넌트).
