---
id: CU-APP-004
name: Navigation & Guard (Protected Stack)
module: app
status: draft
priority: P1
links: [CU-APP-001, CU-APP-002, CU-APP-005, CU-APP-007, CU-APP-008, CU-BE-001]
---

### Purpose
- 인증 상태에 따라 화면 진입을 제어하고, 포그라운드 복귀/링킹 상황에서도 안전하고 예측 가능한 내비게이션을 보장한다.

### Scope
- 포함
  - Root Navigator: AuthStack(게스트) / AppStack(보호)
  - Initial Route Resolver: 콜드 스타트 시 인증 결정 + 앱 재시작 대응
  - Guard: 보호 경로 접근 시 미인증이면 로그인으로 이동, 로그인 상태에서 로그인 화면 접근 시 루트로 리다이렉트
  - 포그라운드 복귀 시 세션 재검증 결과에 따른 상태 전환
  - 401/403 전역 핸들링(토큰 파기/전환), 기본 딥링크/유니버설 링크 매핑
  - Android Back 버튼 정책(루트에서 2-탭 종료, 루프 방지)
- 제외
  - 복잡한 RBAC 메뉴/권한 편집, 고급 딥링크 파라미터 검증

### Interface
- UI: AuthStack(로그인/비밀번호 찾기), AppStack(대시보드/하위 화면), RootNavigator가 인증 상태에 따라 스택 전환
- API: 전역 401/403 응답을 구독해 토큰 파기 및 AuthStack 전환(CU-APP-001/005)

### Data & Rules
- 주요 데이터모델(JSON)
{
  "authState": "unauthenticated | resolving | authenticated | expired",
  "intendedRoute": { "path": "string", "params": {"k": "v"} }
}
- 비즈니스 규칙
  - 콜드 스타트 인증 결정 P95 ≤ 700ms(초과 시 게스트 우선 진입)
  - 포그라운드 재검증은 1회만 수행(중복 방지)
  - intendedRoute는 1회성, 성공 시 즉시 소거
  - 동일 전환 반복 방지(idempotent nav)
  - 보안: 토큰은 SecureStore, 세션 캐시는 메모리/AsyncStorage(선택), 자격/PII 로깅 금지

### NFR & A11y
- 성능 목표: 콜드 스타트 인증 결론 < 700ms, 복귀 재검증 < 1s
- 품질: 내비 루프/중복 전환 0, 콘솔 에러 0
- 접근성: 전환 시 포커스 이동, 헤더/라이브리전 알림

### Acceptance Criteria
- AC-1: 미인증 상태에서 보호 경로 진입 시 로그인으로 전환되고, 로그인 성공 시 원래 경로로 복귀한다.
- AC-2: 인증 상태에서 로그인 화면 접근 시 루트로 리다이렉트된다.
- AC-3: 포그라운드 복귀 시 세션 재검증이 수행되며, 만료면 로그인으로 전환된다.
- AC-4: API 401/403은 토큰 파기 후 AuthStack으로 전환되며 code/requestId가 표기된다.
- AC-5: 딥링크로 보호 경로 진입 시 로그인 후 해당 경로에 도달한다.
- AC-6: Android Back 동작이 문서 정책대로 동작(루트 2-탭 종료, 루프 없음)한다.

### Tasks
- T1: RootNavigator/AuthStack/AppStack 구성과 보호 경로 목록 정의
- T2: Initial Route Resolver 구현(토큰 조회/결정 + 앱 재시작 케이스)
- T3: Foreground Resume 세션 재검증(중복 실행 방지)
- T4: Global 401/403 핸들러(토큰 파기, 전환, 로깅 연동)
- T5: linking 설정(prefixes/경로 매핑), intendedRoute 메모리 관리
- T6: Android BackHandler 정책 및 예외 처리
- T7: 중복 내비 방지 및 가드 창구 통합
- T8: 시나리오 테스트(콜드 스타트, 401, 복귀, Back 버튼)

