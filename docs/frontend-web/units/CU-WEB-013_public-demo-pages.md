---
id: CU-WEB-013
name: Public Sample Pages (Dashboard / CRUD / Form / Admin)
module: web
status: implemented
priority: P0
links: [CU-WEB-011, CU-WEB-012, CU-WEB-003, CU-WEB-006, CU-WEB-009]
---

### Purpose
- 로그인 없이도 체험 가능한 공개 샘플 페이지를 `/sample/*` 하위로 일원화한다.
- `샘플 대시보드/CRUD/복합폼/어드민` 4개 화면으로 구현 역량을 빠르게 증명한다.

### Scope
- 포함
  - `GET /sample`: 샘플 허브(카드 네비게이션)
  - `GET /sample/dashboard`: 읽기 전용 샘플 대시보드(차트/카드/최근 목록)
  - `GET /sample/crud`: 목록/검색/필터/드로어 CRUD(프론트 상태 기반)
  - `GET /sample/form`: 다단계 입력 폼(검증/요약/제출 UX)
  - `GET /sample/admin`: 사용자/역할/설정 탭 기반 관리자 UI
  - 공통 레이아웃 재사용(Header/Sidebar/Footer)
- 제외
  - 실서버 데이터 영속화(샘플 모드에서는 더미/읽기 전용 허용)

### Interface
- 라우트(UI)
  - `/sample`
  - `/sample/dashboard`
  - `/sample/crud`
  - `/sample/form`
  - `/sample/admin`
- 상태 관리
  - EasyObj/EasyList 규약 기반 바인딩

### Sub Priority
- Unit 자체 우선순위는 P0이며, 내부 페이지 구현 순서를 아래처럼 분리한다.
- P0: `/sample`, `/sample/dashboard`, `/sample/crud`
- P1: `/sample/form`, `/sample/admin`

### Page Specs
- `/sample` (허브)
  - 카드 4개: `대시보드`, `CRUD`, `복합 폼`, `관리자 화면`
  - 카드 클릭 시 각 샘플 페이지 이동
  - 상단에 “로그인 없이 체험 가능한 샘플” 안내 문구 노출
- `/sample/dashboard`
  - KPI 카드 3~4개
  - 월별 추이 차트 1개
  - 최근 항목 테이블 1개
  - `업무 상세로 이동` CTA는 `/sample/crud` 또는 `/sample/admin`으로 연결
  - 기본 정책: 읽기 전용(등록/수정/삭제 버튼 없음)
- `/sample/crud`
  - 상단 검색/필터 바
    - `Input`(placeholder: `검색어를 입력하세요`)
    - `Select`(전체/ready/pending/running/done/failed)
    - `DateInput` 2개(시작일~종료일)
    - `검색` 버튼, 우측 `신규 등록` 버튼
  - 목록 테이블(`EasyTable`)
    - 컬럼: 체크박스/번호/제목/상태/담당자/금액/등록일/관리
    - 페이지네이션: 4~5행/페이지
    - 초기 데이터: 10~15건(더미)
  - 등록/수정 Drawer
    - 필드: 제목(required), 상태(code), 담당자, 금액, 설명, 첨부파일, 저장/취소
  - 삭제 Confirm 다이얼로그
    - 문구: `정말 삭제하시겠습니까?`
- `/sample/form`
  - 스텝 인디케이터: `1. 기본 정보 → 2. 상세 정보 → 3. 확인/제출`
  - Step 1 필드: 이름/이메일/연락처/분류/시작~종료일/예산 범위
  - Step 2 필드: 요청사항/우선기능(CheckButton 그룹)/참고 URL/파일 첨부
  - Step 3: 읽기 전용 요약 카드 + 이전/제출 버튼
  - 제출 성공 시 Toast: `신청이 완료되었습니다`
- `/sample/admin`
  - 상단 Tab: 사용자 목록/역할 관리/시스템 설정
  - 사용자 목록 탭
    - 검색바 + 사용자 추가 버튼
    - 컬럼: 프로필/이름/이메일/역할/상태/가입일/관리
    - 사용자 수정 Drawer: 프로필 이미지, 이름, 이메일(readonly), 역할, 상태, 알림 설정 3종
  - 역할 관리 탭
    - 역할 카드 3개(관리자/편집자/일반사용자)
    - 권한 체크 항목 5개(사용자 관리/콘텐츠 편집/설정 변경/로그 조회/데이터 삭제)
  - 시스템 설정 탭
    - 필드: 사이트명/관리자 이메일/점검 모드/세션 타임아웃/최대 업로드 크기
    - 저장 시 Toast: `설정이 저장되었습니다`

### Data & Rules
- 샘플 페이지는 고객 체험 속도를 우선해 즉시 상호작용 가능해야 한다.
- 브라우저 새로고침 시 더미 초기값으로 재시작을 허용한다.
- `/sample/crud`에서 변경한 데이터는 같은 세션에서 `/sample/dashboard`와 공유된다.
- 주요 조작(등록/수정/삭제/제출/저장)은 토스트 또는 인라인 메시지로 결과를 명확히 보여준다.
- 공개 페이지이므로 인증 없이 접근 가능해야 한다.
- 에러/로딩/빈 상태 처리는 `codding-rules-frontend.md` 7장 규칙(Alert/Toast/Loading)과 동일 패턴을 사용한다.
- 상태값은 코드 기준(`ready`, `pending`, `running`, `done`, `failed`)으로 저장하고, 화면 표시는 한글 라벨로 매핑한다.
- 고객 노출 관점에서 샘플 경로는 `/sample/*`만 사용하며, 인증 경로(`/dashboard*`)로 직접 유도하지 않는다.
- i18n 규칙
  - 샘플 페이지의 사용자 노출 문구(카드명/버튼/테이블 헤더/Toast/빈상태/에러)는 `lang.ko.js` 키로 관리한다.

### NFR & A11y
- 키보드 조작만으로 필터/입력/제출/다이얼로그 이동 가능.
- 오류 메시지와 필수 입력 상태를 시각 + 텍스트로 제공.

### Acceptance Criteria
- AC-1: `/sample` 진입 시 샘플 카드 4개(`대시보드/CRUD/복합 폼/관리자`)가 렌더링되고 각 카드 이동이 동작한다.
- AC-2: `/sample/dashboard` 진입 시 KPI 카드/차트/최근목록이 렌더링되고 비인증 상태에서도 접근 가능하다.
- AC-3: `/sample/crud` 진입 시 검색바(키워드/상태/기간/검색/신규등록)와 테이블 8개 컬럼이 렌더링된다.
- AC-4: `/sample/crud`에서 신규 등록 후 목록 건수가 +1, 수정 후 해당 행 값 변경, 삭제 확인 후 목록에서 제거가 즉시 반영된다.
- AC-5: `/sample/crud` 목록이 0건이면 빈 상태 UI(예: `데이터가 없습니다`)가 표시된다.
- AC-6: `/sample/form`에서 Step 1 필수값 미입력 시 다음 단계 진행이 차단되고 오류 메시지가 표시된다.
- AC-7: `/sample/form`에서 Step 3 제출 성공 시 Toast `신청이 완료되었습니다`가 노출되고 폼이 초기화된다.
- AC-8: `/sample/admin`에서 탭 3개 전환이 동작하고, 사용자 탭 Drawer 저장/취소 동작이 수행된다.
- AC-9: `/sample/admin` 시스템 설정 탭 저장 시 Toast `설정이 저장되었습니다`가 노출된다.
- AC-10: `/sample/dashboard`, `/sample/crud`, `/sample/form`, `/sample/admin` 모두 비인증 상태에서 직접 접근 가능하다.
- AC-11: 데이터 초기화 또는 비정상 상태 예외 시 사용자에게 Alert/Toast 에러 메시지를 보여주고 화면은 기본 레이아웃을 유지한다.
- AC-12: 데이터 준비 중 로딩 컴포넌트(또는 스켈레톤)가 표시되고, 완료 시 콘텐츠로 전환된다.
- AC-13: 샘플 허브 및 `/sample/*`의 사용자 노출 문구는 `lang.ko.js` 기반으로 렌더링되고 하드코딩 문자열이 없다.

### Tasks
- T1: `/sample` 허브 + 4개 샘플 페이지를 `initData/page/view` 구조로 작성한다.
- T2: 공통 UI 컴포넌트(EasyTable/Drawer/Tab/Toast/EasyChart) 조합으로 페이지 구현.
- T3: 공개 라우트 Allowlist를 `/sample/:path*` 중심으로 정리하고 링크를 연결한다.
- T4: 샘플 페이지 공통 텍스트 키를 `lang.ko.js`로 분리하고 적용(카드/필터/테이블/Toast/에러 포함).
