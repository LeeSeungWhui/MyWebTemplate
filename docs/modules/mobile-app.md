# Mobile App (Expo / React Native)

## 목적
- Expo(React Native) 기반으로 로그인→메인 정보까지 동작하는 모바일 템플릿을 제공한다.
- Web과 동일한 Dataset(EasyObj/EasyList), 응답 래퍼, SWR 철학을 공유한다.

## 기술 스택
- Node: v24.11.0
- React Native: 0.81+ / Expo: 54+
- React: 19.x (Expo SDK 대응 버전 준수)
- 내비게이션: React Navigation 7
- 스타일: NativeWind 4.x + tailwindcss 3.x
- 데이터: SWR
- 테스트: Jest + React Native Testing Library(선택)
- 언어: JavaScript Only

## 포함 Unit
- CU-APP-001 Auth & Login Screen
- CU-APP-002 Dashboard (Cards/List/Stats Dummy)
- CU-APP-003 UI Component Pack (EasyObj/EasyList 바인딩)
- CU-APP-004 Navigation & Guard (Protected Stack)
- CU-APP-005 API Client (OpenAPI JS 연동)
- CU-APP-006 OTA & Runtime Config (EAS Update)
- CU-APP-007 Error & Toast UX
- CU-APP-008 Connectivity & Foreground Revalidation

## 진행 현황(요약)
- 현재: Expo 기반 스캐폴드 존재(frontend-app)
  - 내비/기본 컴포넌트 초안, Dataset(EasyObj/EasyList) 보유
  - 스크립트: pnpm start|android|ios|web, RN/Expo 설정 파일 구성
  - 문서/샘플: frontend-app/src/docs/* 일부 보유
- 부족: 로그인 화면/보호 스택/API 클라이언트/오류 UX 미구성

## 인증/스토리지 규약
- 인증 모드: Bearer 토큰(웹과 동일한 JWT 클레임/코드 규약, CSRF 미사용)
- 백엔드 엔드포인트: CU-BE-001과 동일한 `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/me`를 사용한다.
- 저장소: 액세스/리프레시 토큰=Expo SecureStore(필수), 세션 캐시/환경=AsyncStorage
- 401 처리: `AUTH_401_INVALID` 수신 또는 `/api/v1/auth/me` 401 시 토큰 파기→로그인 스택 전환(코드/requestId 포함)
- 리프레시 토큰: `/api/v1/auth/refresh` 성공 시 토큰 회전(신규 access/refresh 발급), 실패/블랙리스트 시 즉시 로그아웃

## 데이터 상태 규약
- SWR 키 규약(예): ['auth','session'], ['header', ...], ['list', endpoint, params]
- 무효화: 로그인/로그아웃/헤더 변경/업데이트에서 파급
- EasyObj/EasyList 바인딩 value/onChange/model 규약 고정

## 네트워크 & 환경(Dev/Prod)
- Base URL: EXPO_PUBLIC_API_BASE
- 에뮬레이터: Android=10.0.2.2, iOS=localhost
- HTTPS 기본; ATS/예외는 최소화(별도 문서)
- 규약: Abort, 204(No Content) 처리, 공통 응답 스키마 `{status, message, result, count?, code?, requestId}` 기반 오류 정규화

## 내비 & 가드
- 보호 스택: 미인증→로그인 스택, 인증 시 메인 스택
- 포그라운드 재개: 세션 재검증(깜빡임 최소)
- 401: 토큰 파기→로그인 스택, 403/422: 화면 단 오류/토스트

## 대시보드 화면 구성
- 카드/리스트/통계 경량 위젯 포함, A11y 고려

## OTA & 런타임 설정(선택)
- EAS Update 채널/롤아웃, 강제/선택 업데이트 배너
- 실패 시 롤백/로그 보유

## 오류/관측성
- 오류 바운더리(화면/세션), 공통 구조적 로깅
- 요청 로그: ts, level, requestId, route, method, url, status, latency_ms, code
- requestId 응답 헤더 우선, 미존재시 생성(로그 축약)

## 프론트/리질리언스(선택)
- 네트워크 상태: online/degraded/offline
- GET 백오프 최대 2회(408/429/5xx), 복구 시 SWR 재검증
- 포그라운드 변경은 경량 갱신 우선

## NFR / 품질 지표
- 콜드 스타트→TTI < 3s(중저가 단말), 스크롤 60fps
- API P95 < 400ms(백엔드 기준), 치명 콘솔 에러 0
- 스모크: 로그인/리다이렉트/세션 복원/오류 토스트 확인

## Acceptance Criteria (Template Complete)
- iOS/Android(또는 Expo Go)에서 앱 계정 로그인→메인 정보 확인 가능
- 보호 내비: 미인증 접근은 즉시 로그인 스택 전환, 인증 상태에서 로그인 화면 접근은 루트 전환
- 모든 API 호출이 응답 스키마를 따르고, OpenAPI 기반 JS 클라이언트(openapi-client-axios)로 호출 가능
- 오류/관측성 규약(CU-APP-007)과 프론트 재검증(CU-APP-008)이 문서대로 동작
- 공통 규칙(docs/common-rules.md) DoD 충족

## TODO
- 로그인 화면 구현(검증/오류 UX) + `/api/v1/auth/login`·`/api/v1/auth/refresh`·`/api/v1/auth/me` 연동
- 보호 스택/가드 적용, 포그라운드 루틴
- 대시보드 위젯 구성 + A11y 점검
- OpenAPI JS 클라이언트 도입(openapi-client-axios), SWR 무효화 규약 정리
- 경계 오류/구조적 로깅(requestId) 체계 구축
- (선택) OTA 채널/전략 설정, 포그라운드 배치/시점 제어 도입
- 시나리오 스모크: 로그인/리다이렉트/세션 파기/401·5xx/프론트 재검증

## Links
- Parent: docs/index.md
- Children: docs/units/mobile-app/

## 결정사항(고정)
- API 클라이언트: openapi-client-axios 고정 채택
