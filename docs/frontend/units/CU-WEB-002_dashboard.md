---
id: CU-WEB-002
name: Dashboard (Cards/List/Stats Dummy)
module: web
status: in-progress
priority: P1
links: [CU-WEB-001, CU-WEB-003, CU-WEB-004, CU-WEB-005, CU-WEB-006, CU-BE-002]
---

### Purpose
- 로그인 직후 진입 가능한 기본 정보/요약 화면을 제공한다.
- EasyObj/EasyList 바인딩 규약으로 카드/리스트/통계 위젯 조합, SSR/ISR/CSR 환경 패턴의 모범 구현을 제시한다.

### Scope
- 포함
  - 레이아웃: Header/Sidebar/Footer 공용 컴포넌트(`app/common/layout/*`) 활용. Sidebar는 햄버거로 접힘/펼침, Header 메뉴/서브메뉴 지원.
  - 메인 본문: 카드형 차트 3~4개(EasyChart, Recharts 기반) + 하단 EasyTable 섹션
  - 데이터: 로그인 세션(CU-BE-001), `data_template` 테이블(id, title, description, status, amount, tags(JSON), created_at) 기반 리스트/차트 더미 또는 API
  - 상태: 로딩/빈상태/에러 상태 스켈레톤 및 메시지
  - 렌더링 전략: 기본 SSR(nodejs). 페이지 파일 설정(`dynamic/runtime/revalidate`) 또는 `'use client'` 게이팅으로 전환(links: CU-WEB-006)
  - A11y: 정보 구조/ARIA 가이드(라이브리 최소)
- 제외
  - 실제 비즈니스 차트/분석 로직, 고급 커스터마이즈(차기)
  - ISR — MVP 범위에서 제외

### Interface
- 라우트(UI)
  - `GET /` 또는 `GET /dashboard`(보호 경로; links: CU-WEB-004)
- API(계약 약속)
  - `GET /api/v1/dashboard/stats` (통계: byStatus 등)
  - `GET /api/v1/dashboard/list` (리스트: 최근 N)
  - 공통 응답 스키마 준수 `{status,message,result,count?,code?,requestId}`
- 렌더링 전략 요약
  - SSR 기본: 초회 서버 패치 후 화면 렌더링
  - CSR 전환: 무거운 위젯/상호작용은 `'use client'` 컴포넌트로 분리

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
- AC-1: 인증 사용자로 `/dashboard` 진입 시 SSR로 통계/리스트 초기 데이터를 제공한다.
- AC-2: 로딩/에러 상황에서도 레이아웃이 무너지지 않고 스켈레톤/에러 메시지를 표시한다.
- AC-3: API 에러가 `{status:false, code, requestId}`인 경우 사용자 메시지와 함께 requestId가 표출된다.
- AC-4: 페이지 파일 설정(`dynamic/revalidate/runtime`) 또는 `'use client'` 게이팅만으로 SSR/CSR 구성을 바꿔도 규약이 유지된다(links: CU-WEB-006).
- AC-5: 필수 landmark/role/테이블이 유효하며 콘트라스트 기준을 충족한다.

### Tasks
- T1 레이아웃: Header/Sidebar/Footer(공용) 조합 + 12-그리드 본문(차트 카드 3~4, 리스트 1, 통계 3) 반응형 구성
- T2 데이터 연동: 통계/리스트 데모 API 호출(공통 응답 파싱), 에러·로딩·빈상태 처리
- T3 차트: Recharts 기반 EasyChart 래퍼(lib/component) 추가 및 샘플 시리즈 렌더
- T4 바인딩: EasyObj/EasyList 동작 규칙 구현(필터 변경→리스트 갱신)
- T4 상태관리: SWR 캐시 무효화 규칙 정리(토큰/로그아웃 시 리셋)
- T5 렌더링: SSR 기본 + ISR/CSR 전환 ENV 적용(links: CU-WEB-006)
- T6 A11y/UX: 스켈레톤, 에러 코드 맵핑, 정보 탐색/네비게이션 커버리지
- T7 스토리북: 카드/리스트/에러/빈상태 + 다크모드 스토리 등록
- T8 테스트: SSR 초기 데이터 확인, SWR 지속 패칭, 에러 메시지/requestId 표출, ENV 전환 동작

### Notes
- 인증/가드: 보호 경로 진입용 미들웨어 가이드(CU-WEB-004, CU-WEB-008)
- 성능: 카드/리스트는 경량 유지, 차트는 CSR 분리 권장
- 설정: `frontend-web/config.ini`의 `[APP].backendHost`(또는 `[API].base`) 기반으로 동작한다.
