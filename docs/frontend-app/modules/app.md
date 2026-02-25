# App (Expo / React Native)

## 목적
- 완성된 Web 템플릿의 인증/대시보드/설정 흐름을 모바일 앱으로 이식한다.
- 고객 공개 체험 동선은 Web(`/`, `/sample/*`)이 담당하고, App은 로그인 기반 운영 템플릿에 집중한다.

## 기술 스택
- Node: v24.11.0
- React Native: 0.81+ / Expo: 54+
- React: 19.x (Expo SDK 대응 버전 준수)
- 내비게이션: React Navigation 7
- 스타일: NativeWind 4.x + tailwindcss 3.x
- 데이터: SWR(도입 대상), EasyObj/EasyList
- 테스트: Jest + React Native Testing Library(선택)
- 언어: JavaScript Only

## 코딩 규칙
- 공통 규칙: `docs/common-rules.md`
- RN 전용 규칙: `docs/frontend-app/codding-rules-rn.md`
- 웹 전용 규칙(`docs/frontend-web/codding-rules-frontend.md`)은 RN에 그대로 복사 적용하지 않고, 공통 항목만 선택 적용한다.

## 포함 Unit
- CU-APP-001 Auth & Login Page
- CU-APP-002 Dashboard (Cards/List/Stats)
- CU-APP-003 UI Component Pack (EasyObj/EasyList 바인딩)
- CU-APP-004 Routing & Guard (Protected Routes)
- CU-APP-005 API Client (OpenAPI JS 연동)
- CU-APP-006 OTA & Runtime Config (EAS Update)
- CU-APP-007 Error & Toast UX
- CU-APP-008 Connectivity & Foreground Revalidation

## 현재 구현 상태 (AS-IS)
- 구현됨
  - Expo 스캐폴드 + 실행 스크립트(`pnpm start|android|ios|web`)
  - React Navigation 스택 골격(`main`, `component`)과 기본 레이아웃
  - Dataset(EasyObj/EasyList), 공통 UI 컴포넌트 1차 세트
  - 컴포넌트 Docs/Examples 페이지 골격
- 미구현
  - 로그인 화면/보호 스택/세션 가드
  - 백엔드 API 클라이언트(OpenAPI 연동)
  - 대시보드/업무/설정 실화면
  - 전역 오류/오프라인/포그라운드 재검증

## 목표 구조 (TO-BE)
- 라우트 맵(앱 네이티브 기준)
  - Auth Stack: `login` (필수), `forgot-password` (선택)
  - App Stack: `dashboard`, `tasks`, `settings`
  - Docs Stack: `component` (개발/검수용)
- Web과의 기능 매핑
  - Web `/dashboard` ↔ App `dashboard`
  - Web `/dashboard/tasks` ↔ App `tasks`
  - Web `/dashboard/settings` ↔ App `settings`
  - Web `/component` ↔ App `component`

## Unit 진행 현황
- CU-APP-001: planned — 로그인 UI/세션 저장/401 처리 설계 완료, 화면 미구현
- CU-APP-002: planned — 대시보드 위젯/목록 API 계약 정리 완료, 화면 미구현
- CU-APP-003: in-progress — 공통 컴포넌트/바인딩 1차 구현 진행 중
- CU-APP-004: in-progress — 라우팅 골격만 구현, Auth/App Guard 미구현
- CU-APP-005: planned — OpenAPI 클라이언트/인터셉터 설계 단계
- CU-APP-006: planned — OTA/런타임 구성 정책 정의 단계(P2)
- CU-APP-007: planned — 전역 에러/토스트 정책 정의 단계
- CU-APP-008: planned — 복귀 재검증/오프라인 정책 정의 단계

## 인증 & API 계약 (백엔드 기준 최신)
- 인증 API(App 계약): `/api/v1/auth/app/login`, `/api/v1/auth/app/refresh`, `/api/v1/auth/app/logout`, `/api/v1/auth/me` (CU-BE-001)
- 대시보드 API: `/api/v1/dashboard`, `/api/v1/dashboard/stats` (CU-BE-007)
- 설정 API: `/api/v1/profile/me` (CU-BE-008)
- 공통 응답 스키마: `{status, message, result, count?, code?, requestId}`
- 모바일 1차 규약
  - 로그인 성공 응답의 `accessToken`/`refreshToken`을 SecureStore에 저장하고 Bearer로 사용
  - `app/refresh`는 `refreshToken` 본문으로 호출해 토큰 페어를 회전한다.
  - 401 발생 시 토큰 파기 후 로그인 스택으로 전환
  - Web 쿠키 계약(`/api/v1/auth/*`)은 앱에서 사용하지 않는다.

## 단계별 릴리스
- Phase 1 (P0/P1): 로그인 + 보호 가드 + 대시보드(read-only)
- Phase 2 (P1): 업무 목록/설정 화면 + 오류/토스트 + 오프라인 배너
- Phase 3 (P2): OTA 채널/런타임 컨피그 + 운영 로깅 고도화

## NFR / 품질 지표
- 콜드 스타트→TTI < 3s(중저가 단말), 스크롤 60fps
- API P95 < 400ms(백엔드 기준), 치명 콘솔 에러 0
- 스모크: 로그인/가드/401 처리/오프라인 복구/수동 새로고침

## Acceptance Criteria (Module)
- iOS/Android(또는 Expo Go)에서 로그인 후 대시보드 요약 정보를 조회할 수 있다.
- 미인증 상태에서 보호 화면 진입 시 로그인으로 즉시 전환된다.
- `/api/v1/dashboard` + `/api/v1/dashboard/stats` 호출이 앱에서 정상 동작한다.
- 오류/재시도/오프라인 UX가 CU-APP-007/008 규약을 따른다.
- 공통 규칙(`docs/common-rules.md`) DoD를 충족한다.

## TODO
- `login`/`dashboard`/`tasks`/`settings` 라우트 확정 및 화면 골격 구현
- OpenAPI JS 클라이언트 도입 + 공통 오류 정규화
- Guard/Foreground Revalidate/Offline 배너 통합
- 앱 스모크 시나리오 문서(로그인→대시보드→설정→로그아웃) 작성
- RN 코딩룰 문서(`docs/frontend-app/codding-rules-rn.md`) 기준으로 rule-gate 점검 항목 추가

## Links
- Parent: docs/index.md
- Children: docs/frontend-app/units/

## 결정사항(고정)
- API 클라이언트: openapi-client-axios 고정 채택
- 공개 샘플 퍼널은 Web에서 제공하고 App은 인증 기반 운영 화면 중심으로 구현
