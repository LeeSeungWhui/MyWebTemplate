---
id: CU-WEB-002
name: Dashboard (Cards/List/Stats Dummy)
module: web
status: planned
priority: P1
links: [CU-WEB-001, CU-WEB-003, CU-WEB-004, CU-WEB-005, CU-WEB-006, CU-BE-002]
---

### Purpose
- 로그인 직후 진입 가능한 기본 정보/요약 화면을 제공한다.
- EasyObj/EasyList 바인딩 규약으로 카드/리스트/통계 위젯 조합, SSR/ISR/CSR 환경 패턴의 모범 구현을 제시한다.

### Scope
- 포함
  - 레이아웃: 상단 헤더 영역(세션 표시), 본문 그리드(카드 3~4 + 리스트 1 + 미니차트/통계 3)
  - 데이터: 로그인 세션(CU-BE-001), 데모 통계/리스트용 API 또는 더미 배치
  - 상태: 로딩/빈상태/에러 상태 스켈레톤 및 메시지
  - 렌더링 전략: 기본 SSR, ENV로 ISR/CSR 전환(links: CU-WEB-006)
  - A11y: 정보 구조/ARIA 가이드(라이브리 최소)
- 제외
  - 실제 비즈니스 차트/분석 로직, 고급 커스터마이즈(차기)

### Interface
- 라우트(UI)
  - `GET /` 또는 `GET /dashboard`(보호 경로; links: CU-WEB-004)
- API(계약 약속)
  - `GET /api/v1/demo/stats` (데모 통계: 카운트/증감)
  - `GET /api/v1/demo/list` (데모 리스트: 최근 N)
  - 공통 응답 스키마 준수 `{status,message,result,count?,code?,requestId}`
- 렌더링 전략 요약
  - SSR 기본: 초회 서버 패치 후 SWR로 미세 갱신
  - ISR 선택: 변동 적은 위젯은 `revalidate=N`(ENV), 리스트 계열 위젯은 CSR 전환
  - CSR 강제: 무거운 위젯(차트 등은 동적 import로 SSR 제외)

### Data & Rules
- 데이터셋 모델(예시)
  - EasyObj: `statsModel`, `filtersModel`
  - EasyList: `recentList`
- 바인딩 규약
  - 모든 입력/필터는 value/onChange/model 규약 준수(CU-WEB-003)
  - 리스트 정렬/필터 파라미터 명세 사용(서버 동기화는 차기)
- 에러/로딩 규칙
  - 서버 에러: 코드 맵핑으로 사용자 친화 메시지 + 요청ID 표출
  - 로딩: 스켈레톤 우선(레이아웃 시프 최소)

### NFR & A11y
- 성능: 최초진입 LCP < 2.5s(로컬 샘플 기준), 위젯 응답 P95 < 400ms(데모 API)
- 설정: 각 위젯 스토리/에러/리셋 버튼 제공
- 접근성: 카드 제목 `aria-labelledby`, 리스트 헤더/범위 지점의 정보 탐색 보장

### Acceptance Criteria
- AC-1: 인증 사용자로 `/dashboard` 진입 시 SSR로 통계/리스트 초기 데이터를 제공하고 SWR로 미세 갱신한다.
- AC-2: 데이터 결손 또는 에러여도 레이아웃이 무너지지 않고 스켈레톤/에러 메시지를 표시한다.
- AC-3: 리스트 필터 조작 시 EasyObj 변경→EasyList 바인딩 결과가 갱신된다.
- AC-4: API 에러가 `{status:false, code, requestId}`인 경우 사용자 메시지와 함께 requestId가 표출된다.
- AC-5: ENV 전환으로 SSR/ISR/CSR 페이지 구성이 일관되게 동작한다.
- AC-6: 필수 landmark/role/테이블이 유효하며 콘트라스트 기준을 충족한다.

### Tasks
- T1 레이아웃: 상단 헤더 + 12-그리드 본문(카드 3~4, 리스트 1, 미니 통계 3) 반응형 구성
- T2 데이터 연동: 통계/리스트 데모 API 호출(공통 응답 파싱), 에러·로딩·빈상태 처리
- T3 바인딩: EasyObj/EasyList 동작 규칙 구현(필터 변경→리스트 갱신)
- T4 상태관리: SWR 캐시 무효화 규칙 정리(토큰/로그아웃 시 리셋)
- T5 렌더링: SSR 기본 + ISR/CSR 전환 ENV 적용(links: CU-WEB-006)
- T6 A11y/UX: 스켈레톤, 에러 코드 맵핑, 정보 탐색/네비게이션 커버리지
- T7 스토리북: 카드/리스트/에러/빈상태 + 다크모드 스토리 등록
- T8 테스트: SSR 초기 데이터 확인, SWR 지속 패칭, 에러 메시지/requestId 표출, ENV 전환 동작

### Notes
- 인증/가드: 보호 경로 진입용 미들웨어 가이드(CU-WEB-004, CU-WEB-008)
- 성능: 카드/리스트는 경량 유지, 차트는 CSR 분리 권장
- ENV: `NEXT_PUBLIC_API_BASE`, `NEXT_REVALIDATE_SECONDS` 최소 세트

