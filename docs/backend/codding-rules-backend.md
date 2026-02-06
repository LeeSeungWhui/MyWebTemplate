# 코딩 스타일 가이드 (Backend, 정규화 버전)

이 문서는 이 프로젝트의 백엔드(`backend/`, FastAPI)에서  
코드 짤 때 항상 지켜야 하는 **공통 코딩 규칙의 기준선**이다.

- 관련 문서
  - 프론트엔드: `docs/frontend/codding-rules-frontend.md`
  - 백엔드: `docs/backend/codding-rules-backend.md`
  - 공통: `docs/common-rules.md`

- 기능 구현 1차 → 동작/흐름부터 맞춘다.
- 기능 완료 후 2차 → 이 문서를 체크리스트로 리팩터링한다.

---

## 0. 코딩 철학

> 템플릿은 단순하게, 규약은 한 군데로, 런타임은 보수적으로.

- “멋있어 보이는 추상화” 금지
- 라우터/서비스/라이브러리 책임 섞지 않기
- 실패 케이스(401/422/500)부터 먼저 설계하기

---

## 1. 디렉터리 구조와 책임

- `backend/server.py`
  - FastAPI 앱 엔트리, 설정 로드, 라우터 등록, 미들웨어/오픈API 부착
- `backend/router/`
  - HTTP 계층(입력 검증, 상태코드, 쿠키 설정/삭제, 헤더, Cache-Control)
  - **서비스 호출만** 하고, 비즈니스 로직은 들고 있지 않는다.
- `backend/service/`
  - 비즈니스 로직(인증/도메인 규칙/DB 호출 조합)
  - **Request/Response 객체를 직접 만지지 않는다.**
- `backend/lib/`
  - 공통 유틸(응답 래퍼, 인증 유틸, DB 매니저/쿼리 로더, 로깅, requestId 등)
  - “3군데 이상 재사용” 아니면 웬만하면 서비스/라우터에 둔다.
- `backend/query/`
  - SQL 파일(.sql). `-- name: <키>` 블록 기반 로더 사용
- `backend/tests/`
  - pytest. 템플릿의 인증/헬스/트랜잭션/쿼리 로더 계약을 깨지 않게 방어한다.

---

## 2. 네이밍 규칙 (중요)

### 2.1 기본 원칙: Python이어도 camelCase

- 변수/함수/메서드: **camelCase** (Python 포함)
  - ✅ `refreshToken`, `issueTokens`, `getRequestId`
  - ❌ `refresh_token`, `issue_tokens`
- 클래스/타입: PascalCase
  - ✅ `AuthConfig`, `DatabaseManager`
- 상수: UPPER_SNAKE_CASE
  - ✅ `DEFAULT_NEXT`, `AUTH_REASON_COOKIE`

### 2.2 언더스코어 허용 예외(필수인 경우만)

- 파이썬 시스템 규약
  - dunder: `__init__`, `__enter__` 등
  - “private” 힌트: `_nowMs`처럼 선행 `_`는 허용(템플릿에서 사용 중)
- 프레임워크가 요구하는 콜백/훅 이름
  - 예: `pytest_sessionstart`, watchdog의 `on_modified` 등

---

## 3. 주석/문서화 규칙(프론트와 동일)

### 3.1 파일 헤더(필수)

- 모든 런타임 코드 파일 최상단에 파일 헤더를 둔다.

```py
"""
파일명: backend/service/AuthService.py
작성자: <이름>
갱신일: YYYY-MM-DD
설명: 이 파일이 책임지는 역할을 한 줄로 적는다.
"""
```

### 3.2 함수 헤더(필수)

- 모든 함수/메서드에 “설명/갱신일”을 남긴다(짧으면 한 줄도 OK).

```py
def issueTokens(username: str, remember: bool = False) -> dict:
    """
    설명: 사용자 기준으로 access/refresh 토큰 페이로드를 생성한다.
    갱신일: YYYY-MM-DD
    """
```

- 주석/문구는 한글 기준. (예외: 라이브러리 고유 용어, 헤더 키, 코드 값)

---

## 4. Imports/타이핑

- import 순서: 표준 라이브러리 → 서드파티 → 로컬(`lib/`, `service/`, `router/`)
  - 그룹 사이 빈 줄 1줄
- 타입 힌트는 “공개 인터페이스/경계”에만 우선 적용한다.
  - router↔service, service↔lib 같은 경계
  - 복잡한 제네릭으로 가독성 깨는 건 금지
- Python 3.12 기준 표기 우선
  - ✅ `dict[str, Any]`, `list[dict[str, Any]]`, `str | None`
  - ✅ (필요 시) `typing.Dict`/`typing.Optional` 혼용 허용(레거시/라이브러리 스텁 이슈)
- 서드파티 스텁이 없으면 `Any`로 명시하고(숨기지 말고) 최소 범위로 묶는다.

---

## 5. FastAPI 라우터 규칙

- URL 규칙: 기본 prefix는 `/api/v1` (템플릿 전체 고정)
- 성공/실패는 HTTP 상태코드로 구분하고, 본문은 표준 응답 스키마를 따른다.
- 401 응답에는 `WWW-Authenticate` 헤더를 포함한다.
- 인증 관련/세션 관련 JSON 응답은 `Cache-Control: no-store`를 기본으로 둔다.
- 쿠키는 `HttpOnly`, `SameSite=Lax`, `(prod)Secure`를 기본값으로 둔다.

---

## 6. 서비스 레이어 규칙

- 라우터에서 받은 입력을 “도메인 payload”로 정리한 뒤 서비스로 넘긴다.
- 서비스는 다음만 책임진다.
  - 도메인 규칙/검증(서버 내부 관점)
  - DB/쿼리 호출 조합
  - 토큰 발급/검증 같은 도메인 유틸 호출
- 서비스는 `JSONResponse`/쿠키/헤더를 직접 다루지 않는다(라우터 책임).

---

## 7. 응답/에러 규약(단일화)

- 표준 응답 스키마(공통): `{ status, message, result, count?, code?, requestId }`
  - 성공은 `successResponse(...)`
  - 실패는 `errorResponse(..., code=...)`
- 에러 코드는 UPPER_SNAKE_CASE로, 도메인 prefix를 붙인다.
  - 예: `AUTH_401_INVALID`, `OBS_503_NOT_READY`, `DB_400_PARAM_MISSING`

---

## 8. DB/SQL 규칙

- 문자열 치환으로 SQL 만들지 않는다(금지).
- SQL은 `backend/query/*.sql`에서 `-- name: key`로 관리하고, 서비스에서는 `fetchOneQuery("key", {bind})`처럼 호출한다.
- 바인드 파라미터는 `:name` 형식만 사용한다.
- 파라미터 누락/여분은 실패로 처리한다(템플릿 DB 레이어가 강제).
- 로그에는 파라미터 값을 남기지 않는다(키만 마스킹).

---

## 9. 로깅/관측성

- requestId를 모든 응답에 포함한다(`RequestContext` 기반).
- 인증/리프레시/로그아웃 같은 이벤트는 감사 로그(audit)를 남긴다.
- 로그는 가급적 JSON(구조화)로 남기고, PII/시크릿은 금지한다.

---

## 10. 테스트 규칙(pytest)

- 테스트 함수는 `test` prefix는 유지하되, 그 이후는 camelCase로 쓴다.
  - ✅ `def testLoginRefreshMeLogoutFlow():`
  - ❌ `def test_login_refresh_me_logout_flow():`
- pytest 훅/fixture 등 프레임워크가 요구하는 이름은 예외로 허용한다.
  - 예: `pytest_sessionstart`, `@pytest.fixture`

---

## 11. 작업 플로우(권장)

1. 기능 구현: 라우터→서비스→DB/유틸 흐름을 먼저 완성한다.
2. 리팩터링: 책임 분리/네이밍/에러 코드/로그/테스트를 이 문서 기준으로 정리한다.

이 문서의 규칙을 바꾸면, 템플릿 코드와 문서도 반드시 같이 갱신한다.
