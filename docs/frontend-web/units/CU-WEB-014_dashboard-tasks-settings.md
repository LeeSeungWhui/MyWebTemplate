---
id: CU-WEB-014
name: Dashboard Expansion (Tasks CRUD + Settings)
module: web
status: implemented
priority: P0
links: [CU-WEB-011, CU-WEB-002, CU-WEB-003, CU-WEB-004, CU-WEB-005, CU-WEB-009, CU-BE-001, CU-BE-002, CU-BE-007, CU-BE-008]
---

### Purpose
- 기존 `/dashboard`를 “조회 전용 데모”에서 “실제 업무 관리 가능한 어드민”으로 확장한다.
- 보호 영역에서 실DB CRUD와 설정 UI를 제공해 실무형 포트폴리오 완성도를 높인다.
- 공개 퍼널 노출 대상이 아니라 템플릿 인증 경로(`/dashboard*`)의 확장 기능으로 유지한다.

### Scope
- 포함
  - `/dashboard/tasks`: 실DB 기반 업무 목록/검색/필터/등록/수정/삭제
  - `/dashboard/settings`: 내 프로필/시스템 설정 탭 UI
  - 기존 대시보드와 업무관리 연계(전체보기/제목 클릭 이동)
  - 사이드바 메뉴 재구성(대시보드/업무관리/설정)
- 제외
  - 고급 권한정책(RBAC 세분화), 감사 리포트 화면

### Interface
- 라우트(UI)
  - `GET /dashboard/tasks`
  - `GET /dashboard/settings`
- API(계약)
  - `GET /api/v1/dashboard`
  - `GET /api/v1/dashboard/{id}`
  - `POST /api/v1/dashboard`
  - `PUT /api/v1/dashboard/{id}`
  - `DELETE /api/v1/dashboard/{id}`
  - `GET /api/v1/profile/me`
  - `PUT /api/v1/profile/me`

### UI Specs
- `/dashboard/tasks` 검색/필터 바
  - 키워드 검색(`Input`, 제목/설명 대상)
  - 상태 필터(`Select`: 전체/ready/pending/running/done/failed)
  - 정렬 필터(`Select`: 등록일/금액/제목 기준)
  - 검색 버튼 + 초기화 버튼
  - 우측 `업무 등록` 버튼
- `/dashboard/tasks` 목록 테이블(`EasyTable`)
  - 컬럼: 제목/상태/금액/태그/등록일/관리
  - 상태 Badge 색상: ready(회색), running(파랑), done(초록), failed(빨강)
  - 페이지네이션: API `limit/offset` 기반
- `/dashboard/tasks` 등록/수정 Drawer
  - 제목(`Input`, required) ↔ `DATA_NM`
  - 상태(`Select`) ↔ `STAT_CD`
  - 금액(`NumberInput`) ↔ `AMT`
  - 태그(`Input`, 콤마 구분) ↔ `TAG_JSON`
  - 설명(`Textarea`) ↔ `DATA_DESC`
  - 저장/취소 버튼
- `/dashboard/settings` 탭
  - 탭1 `내 프로필`: 이름/이메일(readonly)/역할(Badge)/알림설정 3종/저장 버튼
  - 탭2 `시스템 설정`: 사이트명/점검모드/세션타임아웃(분)/최대업로드크기(MB)/저장 버튼

### Data & Rules
- 대상 테이블: `T_DATA` (`DATA_NO`, `DATA_NM`, `DATA_DESC`, `STAT_CD`, `AMT`, `TAG_JSON`, `REG_DT`)
- 프론트 모델은 API 응답 호환(camelCase)으로 유지한다.
- dashboard CRUD API는 REST 리소스 경로(`/api/v1/dashboard`, `/api/v1/dashboard/{id}`)를 따른다.
- `/dashboard/tasks`는 새로고침 후에도 데이터가 유지되어야 한다(실DB 반영).
- `/dashboard/tasks`는 URL 쿼리(`q/status/sort/page`)를 상태와 동기화해 링크 공유/새로고침 시 동일 조건을 재현한다.
- `/dashboard/settings` 프로필 저장은 `PUT /api/v1/profile/me`를 기준으로 연동한다.
- CRUD 저장 후 목록을 즉시 재조회해 서버 상태를 기준으로 화면을 동기화한다.
- 에러/로딩/빈 상태 표시는 `codding-rules-frontend.md` 7장 규칙(Alert/Toast/Loading)을 따른다.
- `TAG_JSON`은 콤마 입력값을 배열로 분리한 뒤 JSON 배열 문자열(예: `["태그1","태그2"]`)로 변환해 전송한다.
- i18n 규칙
  - `/dashboard/tasks`, `/dashboard/settings`의 사용자 노출 문구(필터/버튼/테이블/탭/상태 메시지)는 `lang.ko.js` 키로 관리한다.

### NFR & A11y
- 에러 시 사용자 메시지 + requestId 표시.
- 테이블/폼/다이얼로그 키보드 접근성 보장.

### Acceptance Criteria
- AC-1: `/dashboard/tasks`에 검색바(키워드/상태/검색/초기화/업무등록)와 테이블 6개 컬럼(제목/상태/금액/태그/등록일/관리)이 렌더링된다.
- AC-2: `/dashboard/tasks` 등록/수정 Drawer 필드 값이 DB 컬럼 매핑(`DATA_NM`, `STAT_CD`, `AMT`, `TAG_JSON`, `DATA_DESC`)에 맞게 요청 payload로 전송된다.
- AC-3: 생성/수정/삭제 성공 후 목록 재조회 시 DB 반영 데이터가 화면에 유지된다(새로고침 후 동일).
- AC-4: 목록 API 결과가 0건이면 빈 상태 UI(예: `업무가 없습니다`)가 표시된다.
- AC-5: 목록 조회/저장 중에는 로딩 컴포넌트(스켈레톤 또는 로딩 인디케이터)가 표시된다.
- AC-6: API 에러 응답 시 Alert/Toast에 사용자 메시지가 표시되고, `requestId`가 존재하면 함께 노출된다.
- AC-7: `/dashboard/settings`에서 `내 프로필/시스템 설정` 탭 전환이 동작하고 각 탭의 필드 구성이 스펙과 일치한다.
- AC-8: `/dashboard/settings` 저장 클릭 시 성공 피드백(Toast 또는 Alert)이 표시된다.
- AC-9: 보호 경로 미인증 접근 시 로그인 리다이렉트가 유지된다.
- AC-10: Dashboard 확장 화면의 사용자 노출 문구는 `lang.ko.js` 기반으로 렌더링되고 하드코딩 문자열이 없다.

### Tasks
- T1: 백엔드 CRUD 엔드포인트(쿼리/서비스/라우터) 추가.
- T2: `/dashboard/tasks` UI + API 연동 + 에러/로딩/빈상태 처리.
- T3: `/dashboard/settings` 탭 UI 구현 및 저장 UX 정리.
- T4: 대시보드 화면에서 업무관리로의 링크/CTA 연결.
- T5: tasks/settings 텍스트 키를 `lang.ko.js`로 분리하고 화면 렌더링에 적용.
