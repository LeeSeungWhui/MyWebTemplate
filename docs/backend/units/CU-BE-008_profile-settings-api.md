---
id: CU-BE-008
name: Profile & Settings API (Dashboard)
module: backend
status: implemented
priority: P1
links: [CU-BE-001, CU-BE-006, CU-WEB-014]
---

### Purpose
- `/dashboard/settings` 화면에서 사용할 프로필/설정 API 계약을 정의한다.
- 초기에는 프로필 저장을 우선하고, 시스템 설정은 확장 가능한 구조로 제공한다.

### Scope
- 포함
  - `GET /api/v1/profile/me`
  - `PUT /api/v1/profile/me`
  - (선택) `GET /api/v1/settings/public`
  - (선택) `PUT /api/v1/settings/public`
- 제외
  - 관리자 전용 고급 설정(권한/결제/알림 정책), 감사 승인 워크플로우

### Interface
- 인증
  - 프로필 API는 Bearer 토큰 필수
  - 설정 API는 템플릿 정책에 따라 인증 여부 결정(기본은 보호)
- 요청/응답 예시
  - `GET /api/v1/profile/me` → `{ userId, userNm, userEml, roleCd }`
  - `PUT /api/v1/profile/me` req → `{ userNm, notifyEmail?, notifySms?, notifyPush? }`

### Data & Rules
- 사용자 기준 테이블: `T_USER` (`USER_NO`, `USER_ID`, `USER_NM`, `USER_EML`, `ROLE_CD`)
- 시스템 설정은 초기 단계에서 DB 미적용 가능(메모리/파일 기반)하며, 차기 유닛에서 영속화한다.
- 프로필 수정 시 인증 주체(`sub`)와 대상 사용자 일치 검증을 강제한다.
- 응답 스키마/에러 규약은 공통 규칙을 따른다.
- `notifyEmail/notifySms/notifyPush`는 v1에서 선택 필드다.
  - DB 컬럼(`NOTIFY_EMAIL`, `NOTIFY_SMS`, `NOTIFY_PUSH`)이 없는 환경에서는 서버 영속화 없이 UI 상태로만 처리한다.
  - 컬럼 확장 후에는 동일 필드를 DB에 저장하는 방식으로 승격한다.

### NFR & A11y
- 프로필 조회/저장 API P95 < 400ms 목표.
- 입력 검증 실패 시 필드 단위 오류를 식별 가능한 형태로 반환한다.

### Acceptance Criteria
- AC-1: 인증 사용자가 자신의 프로필을 조회/수정할 수 있다.
- AC-2: 비인증 요청은 401, 권한 없는 요청은 403으로 명확히 구분된다.
- AC-3: 프로필 저장 후 재조회 시 변경값이 일치한다.
- AC-4: 에러 응답에 `code`와 `requestId`가 포함된다.

### Tasks
- T1: profile 라우터/서비스/쿼리 골격 추가.
- T2: `T_USER` 기반 조회/수정 쿼리 정의(`backend/query/*.sql`).
- T3: `/dashboard/settings` 연동에 필요한 최소 DTO/검증 로직 확정.
- T4: pytest(인증/정상/유효성/권한) 추가.
