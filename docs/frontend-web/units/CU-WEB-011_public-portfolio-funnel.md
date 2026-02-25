---
id: CU-WEB-011
name: Public Sample Funnel (Landing → Sample Hub)
module: web
status: implemented
priority: P0
links: [CU-WEB-012, CU-WEB-013, CU-WEB-015, CU-WEB-003, CU-WEB-001, CU-WEB-002, CU-WEB-014, CU-WEB-004, CU-WEB-008, CU-WEB-010, CU-WEB-016]
---

### Purpose
- 숨고/크몽 고객이 URL 하나로 로그인 없이도 샘플 화면을 연속 체험할 수 있는 공개 퍼널을 정의한다.
- 공개 샘플 퍼널과 템플릿 인증 경로를 분리해, 고객 경험과 템플릿 재사용성을 동시에 유지한다.

### Scope
- 포함
  - 공개 IA: `/`, `/sample`, `/sample/dashboard`, `/sample/crud`, `/sample/form`, `/sample/admin`, `/component`, `/sample/portfolio`
  - 공개 GNB에서 로그인/회원가입 노출 제거
  - 퍼널 동선/우선순위(P0/P1/P2)와 구현 순서 재정의
  - 템플릿 경로(`/login`, `/signup`, `/forgot-password`, `/dashboard*`)는 라우트 유지 + 공개 네비 비노출 정책
- 제외
  - 앱(App) 화면 설계/동선

### Interface
- 공개 라우트(목표): `/`, `/sample`, `/sample/dashboard`, `/sample/crud`, `/sample/form`, `/sample/admin`, `/component`, `/sample/portfolio`
- 템플릿 라우트(유지, 비노출): `/login`, `/signup`, `/forgot-password`, `/dashboard`, `/dashboard/tasks`, `/dashboard/settings`
  - 레거시 호환 라우트(비노출): `/portfolio`
- 공개 GNB 공통 메뉴: `샘플`, `컴포넌트`, `포트폴리오`

### Data & Rules
- 루트(`/`)는 공개 랜딩으로 유지하고, 핵심 CTA는 `/sample`로 연결한다.
- 고객 노출 화면은 `/sample/*`를 중심으로 두고, 컴포넌트 문서는 `/component` 단일 경로를 유지한다.
- 공개 GNB/푸터에서 로그인/회원가입 링크를 노출하지 않는다.
- 템플릿 인증 경로는 삭제하지 않고 직접 URL 진입만 허용한다(문서/개발자용).
- `/portfolio`는 레거시 호환용으로 유지하고 공개 퍼널/GNB에서는 노출하지 않는다.
- `/sample/dashboard`는 읽기 전용 또는 더미 모드 기본값을 사용한다.
- 페이지 우선순위는 다음 기준을 사용한다.
  - P0: `/`, `/sample`, `/sample/dashboard`, `/sample/crud`
  - P1: `/sample/form`, `/sample/admin`, `/component`
  - P2: `/sample/portfolio`, 템플릿 인증 경로 노출 정책 정리
- i18n 규칙
  - 공개 퍼널의 사용자 노출 문구(메뉴명/CTA/안내 문구)는 `lang.ko.js` 키를 통해 렌더링한다.

### NFR & A11y
- 공개 퍼널 성능 기준: LCP < 2.5s, INP < 200ms.
- 공개/템플릿 경로 공통 접근성: 키보드 탐색, landmark/aria-label 제공.
- 네비 정책 기준: 공개 경로에서 인증 진입 링크가 보이지 않아야 한다.

### Acceptance Criteria
- AC-1: 비인증 사용자가 `/` 접근 시 랜딩 Hero 제목 `웹 개발, 깔끔하게 만들어드립니다`와 CTA 2개(`샘플 체험하기`, `컴포넌트 보기`)가 렌더링된다.
- AC-2: 공개 페이지 공통 GNB에 `샘플/컴포넌트/포트폴리오` 3개 메뉴가 노출되고, 로그인 메뉴는 노출되지 않는다.
- AC-3: 고객 동선 기준 `/(랜딩) → /sample(허브) → /sample/dashboard → /sample/crud` 순서 이동이 링크 클릭으로 재현된다.
- AC-4: `/component`, `/sample/portfolio`가 비인증 상태에서 직접 접근 가능하다.
- AC-5: `/login`, `/signup`, `/forgot-password`, `/dashboard*` 라우트는 유지되며 직접 URL 접근 시 기존 동작(인증/가드)이 유지된다.
- AC-6: 본 유닛의 하위 유닛(CU-WEB-012, CU-WEB-013, CU-WEB-015)이 `/sample/* + /component` 구조와 일관되게 정의된다.
- AC-7: 공개 퍼널의 사용자 노출 문구는 `lang.ko.js` 기반으로 렌더링되고 하드코딩 문자열이 없다.

### Tasks
- T1: IA를 `/sample/* + /component` 중심으로 재정의하고 라우트 정책을 고정한다.
- T2: 랜딩/GNB(CU-WEB-012), 샘플 허브+샘플 페이지(CU-WEB-013), 포트폴리오 경로 전환(CU-WEB-015) 순으로 구현한다.
- T3: 템플릿 인증 경로(CU-WEB-001/002/010/016)는 비노출 정책만 적용하고 코드/라우트는 유지한다.
- T4: 퍼널 공통 네비/CTA/안내 텍스트를 `lang.ko.js` 키로 정렬한다.
