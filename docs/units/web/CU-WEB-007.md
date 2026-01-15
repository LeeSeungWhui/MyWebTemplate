---
id: CU-WEB-007
name: Migration (Vite→Next)
module: web
status: completed
priority: P1
links: [CU-WEB-001, CU-WEB-002, CU-WEB-003, CU-WEB-004, CU-WEB-005, CU-WEB-006, CU-WEB-008, CU-BE-001, CU-BE-002]
---

### Purpose
- 기존 Vite React(+-Tailwind) 기반을 Next 15(App Router, JS-only) 구조로 이관한다.
- 라우팅/데이터/빌드 체인을 정합화해 로그인→대시보드까지 기능 동등(parity)을 보장한다.

### Scope
- 포함
  - 신규 캡슐화: `frontend-web`(JS-only, Tailwind v4, SWR 통일)
  - 라우팅 전환: react-router → App Router(공개/보호 분리, links: CU-WEB-004/008)
  - 컴포넌트 이관: 레거시 UI → CU-WEB-003 규약(EasyObj/EasyList 바인딩)
  - 인증 흐름 정합: 200 로그인(`/api/v1/auth/me` 확인)/로그아웃(CU-WEB-001, CU-BE-001)
  - API 연동: OpenAPI JS 클라 규약(CU-WEB-005)
    - SSR/CSR: 페이지 설정 + MODE 규약(CU-WEB-006)
  - Docs/테스트 이행
- 제외
  - 서드파티 리치 컴포넌트 교체, 멀티테넌시/복잡 권한(차기)

### Interface
- 라우트 매핑(핵심)
  - `/login` → 로그인 페이지(공개)
  - `/` → 대시보드(보호)
  - `/dashboard` → 대시보드 별칭(보호)
  - `/docs/*` → Docs 라우팅(전환 정책 별도)
- 빌드/실행
   - 레거시 `frontend-web-old` 동결(FREEZE), 신규 `frontend-web` 도입
   - 설정: `frontend-web/config.ini`의 `[APP].backendHost`(또는 `[API].base`)로 백엔드 호스트를 지정한다.

### Data & Rules
- 상태/데이터: SWR 표준 사용(기존 TanStack은 제거/병행 불가). SWR 키 규약은 CU-WEB-005 준수
- 데이터셋: EasyObj/EasyList 바인딩 규약(CU-WEB-003). 기존 props 패턴은 어댑터로 흡수
- 스타일: Tailwind v4 토큰/유틸 우선, CSS Module은 최소 유지(점진 제거)
- 인증: 전 구간 쿠키 세션. `credentials:'include'` 강제. 로컬 토큰 저장 금지
- 캐시: 세션은 `no-store`. 공용 데이터는 ETag/304 전달 활용
- 접근성: 레이블/ARIA/포커스 준수. 기존 컴포넌트 A11y 결함은 이관 중 보수

### NFR & A11y
- 성능: 최초진입 LCP < 2.5s(로컬 템플릿 기준), 번들 증가는 +10%p 이내
- 안정성: 치명 콘솔 에러 0, 404/500 라우팅 누락 0
- 접근성: WCAG 2.2 AA 핵심 항목 통과

### Acceptance Criteria
- AC-1 기능 동등: `/login`과 `/`(대시보드)가 기존 기능과 동일하게 동작(세션 확인/리다이렉트 포함).
- AC-2 가드 정합: 보호 경로는 서버/미들웨어 가드로 깜빡임 없는 전환(CU-WEB-004/008).
- AC-3 API 정합: 모든 호출이 표준 응답 래퍼 파싱·에러 맵핑 규칙을 따른다(CU-WEB-005).
- AC-4 컴포넌트 정합: 레거시 UI를 CU-WEB-003 규약으로 조립했고 SSR/CSR 전환에도 안정적이다.
- AC-5 모드 전환: 페이지 `MODE` 변경으로 SSR↔CSR 전환해도 로그인→대시보드 흐름이 유지(CU-WEB-006).
- AC-6 품질 게이트: Docs 페이지 접근성/컨트롤 체크리스트 통과, 로그인/리다이렉트/세션 복원 스모크 확인, 콘솔 에러 0.

### Tasks
- T1 Freeze/브랜치: `frontend-web-old` READ-ONLY 선언, 마이그레이션 브랜치 생성
- T2 스캐폴드: `frontend-web` 생성(Next 15, JS-only, Tailwind v4, ESLint/Prettier)
- T3 라우팅 전환: App Router 도입, 공개/보호 분리, 미들웨어 가드 배치(CU-WEB-008)
- T4 컴포넌트 이관 v1: 버튼/입력/피드백/리스트 핵심 도입(CU-WEB-003 준수)
- T5 인증 연결: 200 로그인(`/api/v1/auth/me` 확인)/로그아웃(쿠키 규칙), 실패 UX 정합(CU-WEB-001)
- T6 대시보드 구성: 레이아웃/카드/리스트/스탯 SSR 기본으로 이식(CU-WEB-002)
- T7 API 클라 연결: OpenAPI JS 클라, SWR 캐시·무효화 정합(CU-WEB-005)
- T8 런타임: 페이지 설정(`revalidate/dynamic/runtime`) + MODE 규약(CU-WEB-006)
- T9 Docs: 컴포넌트/페이지 상태 시나리오 구축(A11y/다크/에러/로딩)
- T10 테스트: 로그인 200·리다이렉트·세션 복원·SWR 후속 패칭·401 처리 확인
- T11 기록/문서: 라우트 매핑, 변경 목록, ENV 사용법, 운영 체크리스트 업데이트
- T12 컷오버: 트래픽 레벨 전환(롤아웃·롤백 계획, 모니터링/알림 설정)
- T13 클린업: 레거시 페이지 제거, 공통 유틸/스타일 정리, 중복 자산/ENV 삭제

### Cutover Plan
- 병행 구동: `frontend-web-old`와 `frontend-web` 동시 운영 후 트래픽 점진 전환
- 장애 시 즉시 레거시로 롤백. 쿠키 도메인/속성은 공통 정책 유지(access_token/refresh_token 호환, Secure/Lax)
- 모니터링: 401/403/5xx, CSR 캐시 미스, 전환 지표 관찰

### Risks & Mitigations
- 인증 불일치(쿠키/프록시): 가드/클라이언트 규약 강화(CU-WEB-004/005/008)
- 바인딩 규약 미준수: CU-WEB-003 체크리스트로 리뷰 게이트
- 성능 리스크: SSR 스켈레톤, 지연 로드, 번들 분석/분리
- ENV 과다: 최소 3개만 사용(로컬/Dev/Prod), 병합 전략 문서화

### Notes
- 기술: JavaScript Only (TypeScript 금지; 단, 테스트/빌드 설정은 예외)
- 런타임: 기본 nodejs(쿠키/세션), 일부 경로 edge 선택 가능
- 명칭: `frontend-web` 일관(index.md/web.md 반영), 레거시는 `frontend-web-old`(최종까지 read-only)

### Implementation Update
- UI 컴포넌트는 `app/lib/component/**`로 재구성되고, 예제는 `app/docs/examples/**`로 이동했다.
- 전역 상태는 `app/common/store/shared.jsx`에서 zustand로 관리하며 `SharedHydrator`로 초기화한다.
- 각 페이지는 `initData.jsx`에 초기 엔드포인트를 정의하고 `app/lib/runtime/ssr.jsx`와 `csr.jsx` 유틸을 사용한다.
- 레거시 Vite 프로젝트는 `frontend-web-old`에 보관되고 신규 `frontend-web`이 기본 경로다.
