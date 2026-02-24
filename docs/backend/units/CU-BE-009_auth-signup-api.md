---
id: CU-BE-009
name: Auth Signup API
module: backend
status: implemented
priority: P1
links: [CU-BE-001, CU-BE-002, CU-BE-006, CU-WEB-016]
---

### Purpose
- 공개 회원가입 API를 제공해 `/signup` 화면에서 신규 계정을 생성할 수 있게 한다.
- 인증 템플릿의 기본 흐름(가입 → 로그인 → 보호 경로 진입)을 완성한다.

### Scope
- 포함
  - `POST /api/v1/auth/signup`
  - 입력 검증(필수값/이메일 형식/비밀번호 길이)
  - 이메일(로그인 ID) 중복 검사
  - 비밀번호 해싱 저장
  - `T_USER` 신규 사용자 INSERT(기본 권한 `user`)
- 제외
  - 이메일 인증 토큰 발송/검증
  - 비밀번호 정책 고도화(특수문자·강도 점수)
  - 소셜 계정 연동

### Interface
- 인증
  - 회원가입 API는 비인증 공개 엔드포인트다.
- API 계약
  - `POST /api/v1/auth/signup`
    - req: `{ name, email, password }`
    - res(성공): `201` + `{ status:true, result:{ userId, userNm } }`
    - res(중복): `409` + `{ status:false, code:'AUTH_409_USER_EXISTS', requestId }`
    - res(검증 실패): `422` + `{ status:false, code:'AUTH_422_INVALID_INPUT', requestId }`

### Data & Rules
- 대상 테이블: `T_USER`
  - 주요 컬럼: `USER_NO`, `USER_ID`, `USER_PW`, `USER_NM`, `USER_EML`, `ROLE_CD`
- 저장 규칙
  - `email`은 `USER_ID`와 `USER_EML`에 동일 값 저장(템플릿 기본 로그인 ID = 이메일)
  - `password`는 평문 저장 금지, 기존 Auth 해시 규약으로 저장
  - `ROLE_CD` 기본값은 `user`
- 보안 규칙
  - 중복 여부 응답 코드는 표준화하되, 내부 SQL/스택트레이스는 응답에 노출하지 않는다.
  - 문자열 치환 금지, 바인드 파라미터만 사용한다.

### NFR & A11y
- 가입 API P95 < 400ms 목표(로컬/샘플 기준).
- 실패 응답은 항상 `code`와 `requestId`를 포함한다.

### Acceptance Criteria
- AC-1: 유효한 요청으로 회원가입 시 `T_USER`에 신규 레코드가 생성되고 201 응답을 반환한다.
- AC-2: 동일 이메일 재가입 시 409와 `AUTH_409_USER_EXISTS` 코드를 반환한다.
- AC-3: 필수값 누락/형식 오류 요청은 422와 `AUTH_422_INVALID_INPUT` 코드를 반환한다.
- AC-4: DB에는 비밀번호 해시만 저장되고 평문 비밀번호는 저장되지 않는다.

### Tasks
- T1: `AuthRouter`에 `POST /api/v1/auth/signup` 추가.
- T2: `AuthService`에 signup 검증/중복검사/해싱/저장 로직 추가.
- T3: query 파일에 사용자 중복 조회/사용자 생성 SQL 블록 추가.
- T4: pytest(정상/중복/검증 실패) 추가.
