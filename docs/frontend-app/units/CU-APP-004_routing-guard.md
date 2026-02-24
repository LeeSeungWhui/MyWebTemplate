---
id: CU-APP-004
name: Routing & Guard (Protected Routes)
module: app
status: in-progress
priority: P1
links: [CU-APP-001, CU-APP-002, CU-APP-005, CU-APP-007, CU-APP-008, CU-BE-001]
---

### Purpose
- 인증 상태에 따라 Auth/App 스택 접근을 제어하고, 앱 복귀/딥링크에서도 일관된 진입 흐름을 보장한다.

### Scope
- 포함
  - Root Navigator: AuthStack(게스트) / AppStack(보호)
  - Initial Route Resolver: 콜드 스타트 시 인증 상태 결정
  - Guard: 보호 화면 접근 시 미인증이면 로그인으로 전환
  - 포그라운드 복귀 시 세션 재검증 후 스택 유지/전환
  - 401 전역 핸들링(토큰 파기 + AuthStack 전환)
- 제외
  - 복잡 RBAC 메뉴/권한 편집
  - 고급 딥링크 파라미터 보안 검증

### Interface
- UI
  - AuthStack: `login` (+ 선택: `forgot-password`)
  - AppStack: `dashboard`, `tasks`, `settings`
  - DocsStack: `component`(개발/검수용)
- API
  - 401 이벤트 구독(CU-APP-005/007) 후 라우팅 전환

### Data & Rules
- 주요 데이터모델(JSON)
{
  "authState": "unauthenticated | resolving | authenticated | expired",
  "intendedRoute": { "name": "string", "params": { "k": "v" } }
}
- 비즈니스 규칙
  - 인증 상태 판정 중복 실행을 방지한다(앱 시작 1회 + 복귀 1회).
  - `intendedRoute`는 로그인 성공 후 1회만 사용하고 즉시 비운다.
  - 동일 스택 전환 반복을 막는다(idempotent navigation).
  - 보안상 토큰/개인정보는 네비게이션 로그에 남기지 않는다.

### 현재 구현 상태 (AS-IS)
- 구현됨
  - Stack Navigator 골격
  - `main`, `component` 라우트 등록
- 미구현
  - `login` 라우트 정의 및 Auth/App 분리 스택
  - 보호 가드/세션 판정/401 전역 전환
  - 딥링크 진입 + intendedRoute 복귀

### NFR & A11y
- 콜드 스타트 인증 판정 < 700ms 목표
- 내비게이션 루프/중복 전환 0
- 전환 시 스크린리더 포커스 흐름 보장

### Acceptance Criteria
- AC-1: 미인증 상태에서 `dashboard/tasks/settings` 진입 시 `login`으로 전환된다.
- AC-2: 로그인 성공 시 원래 의도 경로(intendedRoute)로 1회 복귀한다.
- AC-3: 인증 상태에서 `login` 진입 시 `dashboard`로 리다이렉트된다.
- AC-4: API 401 수신 시 토큰 파기 후 AuthStack으로 이동한다.
- AC-5: 앱 포그라운드 복귀 시 세션 재검증이 1회 수행된다.

### Tasks
- T1: RouteIndex를 Auth/App/Docs 구조로 재편
- T2: `login`, `dashboard`, `tasks`, `settings` 라우트 등록
- T3: 세션 판정 훅(콜드 스타트/복귀) 구현
- T4: 401 전역 핸들러와 내비게이션 연동
- T5: 딥링크 및 intendedRoute 정책 문서화
