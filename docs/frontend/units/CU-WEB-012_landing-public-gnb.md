---
id: CU-WEB-012
name: Landing & Public GNB
module: web
status: implemented
priority: P0
links: [CU-WEB-011, CU-WEB-004, CU-WEB-008, CU-WEB-009]
---

### Purpose
- 첫 방문 3초 안에 “무엇을 만들 수 있는 개발자인지” 전달하는 랜딩(`/`)을 제공한다.
- 공개 페이지 공통 GNB를 통해 `/demo/*` 기반 탐색을 통일한다(로그인 메뉴 비노출).

### Scope
- 포함
  - `/` 랜딩(히어로, 서비스 카드, 스크린샷, 스택 뱃지, CTA, 푸터)
  - 공개 GNB(데모 드롭다운 포함) + 모바일 햄버거/드로어
  - 공개 메뉴에서 인증 동선 제거(템플릿 라우트는 직접 URL 접근만 허용)
  - 루트 공개 전환 및 인증 사용자 리다이렉트 정책 연동
- 제외
  - 데모 상세 기능 구현(`/demo/*` 내부 동작)

### Interface
- 라우트(UI)
  - `GET /` (공개)
- GNB 링크
  - `데모`(드롭다운): `/demo`, `/demo/dashboard`, `/demo/crud`, `/demo/form`, `/demo/admin`
  - `컴포넌트`: `/component`
  - `포트폴리오`: `/demo/portfolio`

### Sections
- Hero
  - 배경: `#1e3a5f → #312e81` 그라디언트
  - 제목: `웹 개발, 깔끔하게 만들어드립니다`
  - 부제: `관리자 화면부터 반응형 웹까지, 이 페이지가 포트폴리오입니다.`
  - CTA: `데모 체험하기`(solid), `컴포넌트 보기`(outline)
  - 우측 비주얼: 대시보드 스크린샷 1장(회전 + 그림자 + 라운드)
- 제공 서비스(4카드 그리드)
  - 카드1: `관리자 대시보드` / `RiDashboardLine`
  - 카드2: `CRUD 관리 화면` / `RiTableLine`
  - 카드3: `반응형 웹사이트` / `RiSmartphoneLine`
  - 카드4: `API 개발` / `RiCodeSSlashLine`
  - 스타일: white card, rounded-xl, hover shadow 상승, gap-6, 반응형 1→2→4열
- 데모 스크린샷 갤러리
  - 카드 3개: 데모 대시보드/CRUD/폼
  - 카드 클릭 시 각각 데모 페이지로 이동
- 기술 스택
  - 뱃지: `Next.js 15`, `React 19`, `Python`, `FastAPI`, `SQLAlchemy`, `Vitest`
  - 스타일: pill + 연한 배경 + hover lift
- 하단 CTA
  - 배경: `bg-blue-50`
  - 문구: `직접 체험해 보세요`
  - 버튼: `데모 보기`
- Footer
  - 배경: `bg-gray-900`
  - 구성: 로고 + 카피라이트 + 링크(데모 허브/컴포넌트/포트폴리오/GitHub)

### Data & Rules
- 랜딩 CTA는 최소 2개(`데모 체험하기`, `컴포넌트 보기`)를 제공한다.
- 공개 GNB는 공개 페이지에서 동일 UX를 유지한다(sticky + backdrop blur).
- 루트 공개 정책은 미들웨어 규칙과 충돌 없이 동작해야 한다.
- 데모 드롭다운은 `데모 홈`, `데모 대시보드`, `CRUD 관리`, `복합 폼`, `관리자 화면` 항목을 제공한다.
- 공개 GNB는 `/`, `/demo/*`에서 동일한 메뉴 구조를 유지한다.
- 로그인/회원가입/비밀번호찾기 링크는 공개 GNB/푸터에서 노출하지 않는다.
- 스크린샷 갤러리 이미지는 초기 구현 시 placeholder를 사용하고, 데모 페이지 완성 후 실제 캡처 이미지로 교체한다.

### NFR & A11y
- 반응형: 모바일 1열/태블릿 2열/데스크톱 다열 그리드.
- 접근성: landmark/nav 구조, 버튼/링크 포커스 상태, 이미지 대체텍스트 제공.

### Acceptance Criteria
- AC-1: 비인증 사용자가 `/` 접속 시 Hero 제목 `웹 개발, 깔끔하게 만들어드립니다`와 부제, CTA 버튼 2개가 렌더링된다.
- AC-2: Hero 배경은 `#1e3a5f → #312e81` 그라디언트이며, 우측 대시보드 스크린샷 카드 1개가 노출된다.
- AC-3: 제공 서비스 섹션에 4개 카드(`관리자 대시보드`, `CRUD 관리 화면`, `반응형 웹사이트`, `API 개발`)가 렌더링된다.
- AC-4: 데모 스크린샷 갤러리 카드 3개 클릭 시 각각 `/demo/dashboard`, `/demo/crud`, `/demo/form`으로 이동한다.
- AC-5: 기술 스택 뱃지 6개(`Next.js 15`, `React 19`, `Python`, `FastAPI`, `SQLAlchemy`, `Vitest`)가 노출된다.
- AC-6: 하단 CTA 섹션에 버튼 `데모 보기`가 노출되고 `/demo` 링크가 동작한다.
- AC-7: 공개 GNB에 `데모/컴포넌트/포트폴리오` 메뉴가 노출되고 `로그인` 메뉴는 노출되지 않는다.
- AC-8: 모바일 뷰포트에서 햄버거 메뉴를 열면 GNB와 동일한 링크 집합이 표시된다.
- AC-9: 인증 사용자의 `/` 접근은 `/dashboard` 또는 정책상 지정된 템플릿 경로로 전환된다.
- AC-10: 공개 GNB 메뉴 클릭 시 컴포넌트/포트폴리오는 `/component`, `/demo/portfolio`로 이동한다.

### Tasks
- T1: `app/(public)` 계열 랜딩 페이지 구조 및 섹션 컴포넌트 작성.
- T2: 공개 GNB 컴포넌트와 데모 드롭다운 작성.
- T3: 미들웨어/publicRoutes 정책에서 루트 공개 동작과 `/demo/*` 노출 정책 검증.
