# 코딩 스타일 가이드 (Backend, 정규화 버전)

이 문서는 이 프로젝트의 백엔드(`backend/`, FastAPI)에서  
코드 짤 때 항상 지켜야 하는 **공통 코딩 규칙의 기준선**이다.

- 관련 문서
  - 프론트엔드 웹: `docs/frontend-web/codding-rules-frontend.md`
  - 프론트엔드 앱: `docs/frontend-app/codding-rules-rn.md`
  - 백엔드: `docs/backend/codding-rules-backend.md`
  - 공통: `docs/common-rules.md`

- 기능 구현 1차 → 동작/흐름부터 맞춘다.
- 기능 완료 후 2차 → 이 문서를 체크리스트로 리팩터링한다.

## BE-R-INDEX 라벨 체계와 조문 인덱스

- 본 문서는 `BE-R-*` 기반 조문 체계를 기준으로 구성한다.
- `BE-R-*`: 문서 규범(헌법 조문) 라벨
- `BE-A-*`: 자동 룰게이트 라벨
- `BE-M-*`: 수동 점검 라벨
- `CM-A-*`: 공통(도메인 공용) 자동 룰게이트 라벨
- 라벨 보강 시 `myweb-rule-gate`의 `AUTO_SECTION_RULES`/`MANUAL_RULES`를 함께 갱신한다.

| 조문 라벨 | 조문 제목 | 자동 게이트 라벨 | 수동 점검 라벨 |
| --- | --- | --- | --- |
| BE-R-100 | 코딩 철학 | - | BE-M-0 |
| BE-R-110 | 간결 구현 원칙 | - | - |
| BE-R-130 | 룰게이트 구현 강제 원칙 | - | - |
| BE-R-200 | 디렉터리 구조와 책임 | - | BE-M-1 |
| BE-R-210 | 기본 템플릿: `router / service / query` | - | - |
| BE-R-220 | 도메인 vs 공통 코드 | - | - |
| BE-R-230 | 파일 분리 최소주의 | - | - |
| BE-R-300 | 네이밍 규칙 | BE-A-009, BE-A-010 | - |
| BE-R-310 | 기본 원칙: Python이어도 camelCase | - | - |
| BE-R-320 | 언더스코어 허용 예외 | - | - |
| BE-R-400 | 주석/문서화 규칙 | BE-A-012 | - |
| BE-R-410 | 파일 헤더 | BE-A-007 | - |
| BE-R-420 | 함수 헤더 | BE-A-008, BE-A-017, BE-A-018 | - |
| BE-R-430 | 주석 윗줄 공백 규칙 | BE-A-022 | - |
| BE-R-500 | Imports/타이핑 | BE-A-015 | BE-M-4 |
| BE-R-600 | FastAPI 라우터 규칙 | BE-A-011, BE-A-020 | BE-M-5 |
| BE-R-700 | 서비스 레이어 규칙 | BE-A-001, BE-A-020 | - |
| BE-R-800 | 응답/에러 규약 | - | BE-M-7 |
| BE-R-810 | `result` 타입 고정 규약 | BE-A-021 | - |
| BE-R-900 | DB/SQL 규칙 | BE-A-002, BE-A-003, BE-A-004, BE-A-005, BE-A-006, BE-A-013, BE-A-014, BE-A-016, BE-A-020 | BE-M-8.4 |
| BE-R-1000 | 로깅/관측성 | - | BE-M-9 |
| BE-R-1100 | 테스트 규칙(pytest) | BE-A-010, BE-A-019 | - |
| BE-R-1200 | 작업 플로우(권장) | - | BE-M-11 |
| BE-R-1300 | 트랜잭션 경계 규칙 | BE-A-023 | - |
| BE-R-1310 | 멱등성 규칙 | BE-A-024 | - |
| BE-R-1320 | 외부 I/O timeout/retry 규칙 | BE-A-025 | - |
| BE-R-1330 | 대량조회 보호 규칙 | BE-A-026 | - |

---

## BE-R-100 코딩 철학

> 템플릿은 단순하게, 규약은 한 군데로, 런타임은 보수적으로.

- “멋있어 보이는 추상화” 금지
- 라우터/서비스/라이브러리 책임 섞지 않기
- 실패 케이스(401/422/500)부터 먼저 설계하기

### BE-R-110 간결 구현 원칙

- 목표는 동작을 가장 짧고 명확한 코드로 구현하는 것이다.
- “혹시 몰라” 방어코드/중간객체/우회 상태를 추가하지 않는다.
  - 금지: 의미 없는 중간 복사 후 재대입 (`nextPayload = dict(payload); payload = nextPayload`)
  - 금지: 의미 없는 단순 래퍼 (`def normalize(v): return target(v)`)
  - 금지: 같은 판정식을 여러 경로에 중복 선언 (`isValidX`, `canSubmitX`, `checkBeforeX`가 동일 조건)
- 룰게이트 회피형 수정(의미 동일 + 형태만 변경)은 금지한다.
  - 코드와 룰이 충돌하면 코드 우회가 아니라 룰게이트를 수정한다.
- 분기/검증은 early return을 기본으로 한다.
  - 권장: 입력/권한/가드 실패를 먼저 반환하고 본 로직은 아래로 흐르게 유지
- 조건이 길어지면 이름을 붙여서 읽히게 만든다.
  - 권장: `isInvalidInput`, `isUnauthorizedUser`, `isDbNotReady`

### BE-R-130 룰게이트 구현 강제 원칙

- 룰게이트 작성/보강 시 AST 우선 기준에 해당하는 규칙은 반드시 AST로 구현한다.
- AST 우선 규칙을 regex/grep으로 신규 작성하거나 기존 regex만 유지하는 행위를 금지한다.
- AST 우선 규칙에서 regex/grep fallback은 허용하지 않는다. parser 미가용이면 게이트를 즉시 실패시킨다.
- 문맥 해석이 필요 없는 순수 형태 검사(파일 경로/헤더/주석/고정 문자열)만 regex/grep을 사용한다.

---

## BE-R-200 디렉터리 구조와 책임

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

### BE-R-210 기본 템플릿: `router / service / query`

- `router = HTTP`
  - 요청/응답 처리 전담: 입력 파싱, 인증 의존성, 상태코드, 헤더/쿠키, `JSONResponse`
  - 서비스 호출만 하고 도메인 규칙 계산은 들고 있지 않는다.
- `service = 도메인`
  - 도메인 규칙/검증/트랜잭션/DB 호출 조합 전담
  - `Request/Response`, 쿠키, 헤더를 직접 다루지 않는다.
- `query = SQL key만`
  - SQL 본문은 `backend/query/*.sql`의 `-- name: <key>` 블록에만 둔다.
  - 파이썬 코드에서는 SQL 문자열을 직접 작성하지 않고 query key로만 호출한다.
  - 예: `await db.fetchOneQuery("dashboard.detail", {"id": int(dataId), "userId": ownerUserId})`

```py
# router: HTTP 책임만 수행
@router.get("/{dataId}")
async def getDataTemplateDetail(dataId: int, user=Depends(getCurrentUser)):
    result = await DashboardService.getDataTemplateDetail(dataId, userId=user.username)
    response = JSONResponse(status_code=200, content=successResponse(result=result))
    response.headers["Cache-Control"] = "no-store"
    return response

# service: 도메인 책임 + query key 호출
async def getDataTemplateDetail(dataId: int, userId: str) -> dict:
    db = ensureDbManager()
    ownerUserId = normalizeUserId(userId)
    row = await db.fetchOneQuery("dashboard.detail", {"id": int(dataId), "userId": ownerUserId})
    if not row:
        raise ServiceError("DASH_404_NOT_FOUND")
    return convertKeysToCamelCase(row)
```

### BE-R-220 도메인 vs 공통 코드

- 도메인 전용 로직은 해당 도메인(router/service) 안에서 끝낸다.
- 애매하면 공통 `lib/`로 빼지 않는다.
- 공통 모듈 승격 기준:
  - 이름만 보고 역할이 즉시 이해되는가
  - 동일 로직이 실제로 3군데 이상에서 재사용되는가
- 둘 중 하나라도 아니면 원래 도메인에 유지한다.

### BE-R-230 파일 분리 최소주의

- 기본은 기능 단위로 한 파일에서 흐름이 읽히게 유지한다.
- 1~3줄짜리 단순 래퍼 함수를 만들기 위해 파일을 쪼개지 않는다.
- 특정 라우트/서비스에서만 쓰는 헬퍼는 같은 파일 내부에 둔다.
- 여러 기능에서 반복되는 경우에만 별도 모듈로 분리한다.
- 분리 후에도 “엔트리 한 군데 + 호출 흐름 추적 가능” 원칙을 유지한다.

---

## BE-R-300 네이밍 규칙 (중요)

### BE-R-310 기본 원칙: Python이어도 camelCase

- 변수/함수/메서드: **camelCase** (Python 포함)
  - ✅ `refreshToken`, `issueTokens`, `getRequestId`
  - ❌ `refresh_token`, `issue_tokens`
- 클래스/타입: PascalCase
  - ✅ `AuthConfig`, `DatabaseManager`
- 상수: UPPER_SNAKE_CASE
  - ✅ `DEFAULT_NEXT`, `AUTH_REASON_COOKIE`

### BE-R-320 언더스코어 허용 예외(필수인 경우만)

- 파이썬 시스템 규약
  - dunder: `__init__`, `__enter__` 등
  - “private” 힌트: `_nowMs`처럼 선행 `_`는 허용(템플릿에서 사용 중)
- 프레임워크가 요구하는 콜백/훅 이름
  - 예: `pytest_sessionstart`, watchdog의 `on_modified` 등

---

## BE-R-400 주석/문서화 규칙(프론트와 동일)

### BE-R-410 파일 헤더(필수)

- 모든 런타임 코드 파일 최상단에 파일 헤더를 둔다.

```py
"""
파일명: backend/service/AuthService.py
작성자: <이름>
갱신일: YYYY-MM-DD
설명: 이 파일이 책임지는 역할을 한 줄로 적는다.
"""
```

### BE-R-420 함수 헤더(필수)

- 모든 함수/메서드에 “설명/갱신일”을 남긴다(짧으면 한 줄도 OK).
- 가독성을 위해 각 함수/메서드 선언 블록의 위/아래에는 빈 줄을 정확히 1줄씩 둔다.
- 함수명 재진술형 docstring은 금지한다.
  - 금지 예: `설명: validate 로직을 수행한다.`, `설명: 조회를 처리한다.`
- `설명:` 끝맺음은 명사형으로 작성한다.
  - 금지 예: `설명: 만료 세션을 제거한다.`, `설명: 사용자 캐시를 초기화합니다.`
  - 권장 예: `설명: 만료 세션 제거`, `설명: 사용자 캐시 초기화`
- docstring에는 최소 1개 이상의 구체 정보를 반드시 포함한다.
  - 허용 예: 처리 규칙, 실패/예외 동작, 부작용(DB/캐시/로그 변경), 반환값 의미, 호출 제약(사전 조건/권한)
- `설명:` 한 줄만 있는 주석은 지양한다.
  - 동작이 단순한 메서드라도 “왜 필요한지/실패 시 동작/반환값 의미” 중 하나는 명시한다.

```py
def issueTokens(username: str, remember: bool = False) -> dict:
    """
    설명: 사용자 기준 access/refresh 토큰 페이로드 생성
    반환값: accessToken/refreshToken 만료시각을 포함한 토큰 payload dict
    참고: remember=true면 refresh 만료 시간을 연장한다.
    갱신일: YYYY-MM-DD
    """
```

- 주석/문구는 한글 기준. (예외: 라이브러리 고유 용어, 헤더 키, 코드 값)

### BE-R-430 주석 윗줄 공백 규칙 (필수)

- 독립 주석(`#`)은 바로 윗줄에 빈 줄을 정확히 1줄 둔다.
- 연속 주석 블록의 2번째 줄부터는 재적용하지 않는다(주석 시작 줄만 적용).
- 파일 최상단(첫 줄) 주석 시작은 예외로 둔다.

```py
defaultRole = "viewer"

# 관리자 승격 정책 플래그
isAdminPolicyEnabled = False
```

---

## BE-R-500 Imports/타이핑

- import 순서: 표준 라이브러리 → 서드파티 → 로컬(`lib/`, `service/`, `router/`)
  - 그룹 사이 빈 줄 1줄
- 모듈 상단 import 블록 무결성 유지
  - 선행 실행문(상수 할당/함수 호출/로거 생성 등) 이후 정적 import 재등장 금지
  - 예외: `if TYPE_CHECKING:` 블록, `try: import ... except: <fallback>` 패턴은 허용
- 타입 힌트는 “공개 인터페이스/경계”에만 우선 적용한다.
  - router↔service, service↔lib 같은 경계
  - 복잡한 제네릭으로 가독성 깨는 건 금지
- Python 3.12 기준 표기 우선
  - ✅ `dict[str, Any]`, `list[dict[str, Any]]`, `str | None`
  - ✅ (필요 시) `typing.Dict`/`typing.Optional` 혼용 허용(레거시/라이브러리 스텁 이슈)
- 서드파티 스텁이 없으면 `Any`로 명시하고(숨기지 말고) 최소 범위로 묶는다.

---

## BE-R-600 FastAPI 라우터 규칙

- URL 규칙: 기본 prefix는 `/api/v1` (템플릿 전체 고정)
- 성공/실패는 HTTP 상태코드로 구분하고, 본문은 표준 응답 스키마를 따른다.
- 401 응답에는 `WWW-Authenticate` 헤더를 포함한다.
- 인증 관련/세션 관련 JSON 응답은 `Cache-Control: no-store`를 기본으로 둔다.
- 인증이 필요한 사용자별 데이터 API(예: 프로필/개인 대시보드)도 `Cache-Control: no-store`를 기본으로 둔다.
- 인증이 필요한 사용자별 데이터 API는 소유권 바인딩을 라우터→서비스→SQL 전 구간에서 강제한다.
  - 라우터: `getCurrentUser` 결과의 `user.username`을 서비스에 `userId`로 전달
  - 서비스: 조회/수정/삭제/집계 함수 시그니처에 `userId`를 명시하고 DB 바인딩에 포함
  - SQL: 사용자 데이터 쿼리(`SELECT/UPDATE/DELETE`)는 `USER_ID = :userId` 조건을 포함
- 쿠키는 `HttpOnly`, `SameSite=Lax`, `(prod)Secure`를 기본값으로 둔다.

---

## BE-R-700 서비스 레이어 규칙

- 라우터에서 받은 입력을 “도메인 payload”로 정리한 뒤 서비스로 넘긴다.
- 서비스는 다음만 책임진다.
  - 도메인 규칙/검증(서버 내부 관점)
  - DB/쿼리 호출 조합
  - 토큰 발급/검증 같은 도메인 유틸 호출
- 서비스는 `JSONResponse`/쿠키/헤더를 직접 다루지 않는다(라우터 책임).

---

## BE-R-800 응답/에러 규약(단일화)

- 표준 응답 스키마(공통): `{ status, message, result, count?, code?, requestId }`
  - 성공은 `successResponse(...)`
  - 실패는 `errorResponse(..., code=...)`
- 에러 코드는 UPPER_SNAKE_CASE로, 도메인 prefix를 붙인다.
  - 예: `AUTH_401_INVALID`, `OBS_503_NOT_READY`, `DB_400_PARAM_MISSING`

### BE-R-810 `result` 타입 고정 규약 (필수)

- `result`는 **항상 JSON 객체(object)** 로 고정한다.
  - 금지: 엔드포인트에 따라 `result`가 배열/객체로 바뀌는 유동 계약
  - 금지: 같은 엔드포인트에서 상황별(`empty/non-empty`, `query 유무`)로 `result` 타입이 달라지는 구현
- `result` 내부 필드명은 아래 규칙을 강제한다.
  - 단일 값(문자열/숫자/불리언): `<name>`
  - JSON 객체: `<name>Obj`
  - 리스트(배열): `<name>List`
- `result` 내부에서 제너릭 이름을 금지한다.
  - 금지: `items`, `list`, `data`, `obj`
- 목록 응답도 배열을 루트 `result`로 내리지 않는다.
  - 권장: `result.<name>List`(배열) + `result.totalCount/page/size`(메타)
- 프론트와 계약이 충돌하면 프론트 우회 분기(`result || result.<name>List`)를 늘리지 말고, API 응답 규격 자체를 수정한다.
- 권장 예시:

```json
{
  "status": true,
  "message": "success",
  "result": {
    "taskList": [
      { "id": 101, "title": "샘플" }
    ],
    "searchFilterObj": {
      "keyword": "샘플",
      "status": "ready"
    },
    "totalCount": 37,
    "page": 1,
    "size": 10
  },
  "requestId": "req-123"
}
```

---

## BE-R-900 DB/SQL 규칙

- 문자열 치환으로 SQL 만들지 않는다(금지).
- SQL은 `backend/query/*.sql`에서 `-- name: key`로 관리하고, 서비스에서는 `fetchOneQuery("key", {bind})`처럼 호출한다.
- 바인드 파라미터는 `:name` 형식만 사용한다.
- 파라미터 누락/여분은 실패로 처리한다(템플릿 DB 레이어가 강제).
- 로그에는 유지보수 목적의 파라미터 값 노출을 허용한다(단, PII/시크릿은 반드시 마스킹).
- 쿼리문은 대문자 작성 원칙으로 통일한다.
  - 대상: 키워드, 함수명, 테이블명, 컬럼명, 별칭
  - 예: `SELECT`, `COALESCE`, `T_USER`, `USER_ID`, `AS USER_NM`
  - 예외: 바인드 파라미터명(`:userId`)과, 외부 응답 스키마 호환이 필요한 별칭은 소문자 허용
- `SELECT` 컬럼 목록은 leading comma 형식을 사용한다.
  - 첫 컬럼: `SELECT <column>`
  - 이후 컬럼: `     , <column>`
- 절(Clause)은 줄을 분리해서 작성한다.
  - `  FROM ...`
  - ` WHERE ...`
  - ` GROUP BY ...`
  - ` ORDER BY ...`
  - ` LIMIT ...`
  - `OFFSET ...`
- DB 오브젝트 네이밍은 대문자 기준으로 작성한다.
  - 테이블: `T_` prefix (예: `T_USER`, `T_LOG`)
  - 뷰: `V_` prefix (예: `V_USER_STAT`)
  - 컬럼: 대문자 + 축약형(예: `USER_ID`, `USER_NM`, `UPDATE_DT`)
- 테이블/컬럼명은 의미를 유지하는 범위에서 최대한 짧게 작성한다.
- FK 제약은 사용하지 않는다(관계/무결성은 서비스 로직과 인덱스로 관리).
- 기존 레거시 테이블(lowercase 등)은 운영 안정성을 우선해 유지하고, 신규/개편 스키마부터 위 규칙을 적용한다.
- 예시:

```sql
SELECT STAT_CD
     , COUNT(*) AS CNT
     , COALESCE(SUM(AMT), 0) AS AMT_SUM
  FROM T_DATA
 GROUP BY STAT_CD;
```

---

## BE-R-1000 로깅/관측성

- requestId를 모든 응답에 포함한다(`RequestContext` 기반).
- 인증/리프레시/로그아웃 같은 이벤트는 감사 로그(audit)를 남긴다.
- 로그는 가급적 JSON(구조화)로 남기고, PII/시크릿은 금지한다.

---

## BE-R-1100 테스트 규칙(pytest)

- 테스트 함수는 `test` prefix는 유지하되, 그 이후는 camelCase로 쓴다.
  - ✅ `def testLoginRefreshMeLogoutFlow():`
  - ❌ `def test_login_refresh_me_logout_flow():`
- pytest 훅/fixture 등 프레임워크가 요구하는 이름은 예외로 허용한다.
  - 예: `pytest_sessionstart`, `@pytest.fixture`

---

## BE-R-1200 작업 플로우(권장)

1. 기능 구현: 라우터→서비스→DB/유틸 흐름을 먼저 완성한다.
2. 리팩터링: 책임 분리/네이밍/에러 코드/로그/테스트를 이 문서 기준으로 정리한다.
3. 룰게이트 운영/동기화:
   - 실행 모드 기준(`--all`/`--changed`)과 문서 변경 시 동기화 절차는
     `docs/backend/rule-gate-operations.md`를 따른다.
   - 검출/비검출 회귀 기준은
     `docs/backend/rule-gate-regression-cases.md`를 기준으로 유지한다.

이 문서의 규칙을 바꾸면, 템플릿 코드와 문서도 반드시 같이 갱신한다.

---

## BE-R-1300 트랜잭션 경계 규칙 (필수)

- 한 요청에서 쓰기 작업(INSERT/UPDATE/DELETE 계열)이 2건 이상이면 service에서 단일 트랜잭션 경계로 묶어야 한다.
- 금지: router/lib 계층에서 `commit()/rollback()`를 직접 제어하는 패턴.
- 예외: 순수 조회(read-only) 플로우.
- 우회 금지: 쓰기 2건 이상을 함수 분할/표현식 치환으로 숨겨 룰을 회피하지 않는다.

```py
# 권장: service에서 트랜잭션 경계 단일화
async def createThenAudit(payload: dict, userId: str) -> dict:
    db = ensureDbManager()
    async with db.transaction():
        created = await db.fetchOneQuery("dashboard.create", {"title": payload["title"], "userId": userId})
        await db.executeQuery("audit.insert", {"event": "dashboard.create", "userId": userId})
    return created
```

## BE-R-1310 멱등성 규칙 (필수)

- 재시도 가능한 생성/결제/외부연동 mutation API는 `Idempotency-Key` 계약을 강제한다.
- 동일 키 재요청은 중복 생성 없이 동일 결과를 반환해야 한다.
- 금지: 재시도 시 중복 row 생성.
- 우회 금지: 키 검증을 형식적으로만 남기고 중복 방지 저장/조회 로직을 생략하지 않는다.
- 1차 도입은 WARN으로 운영하고, 오탐 정리 후 ERROR로 승격한다.

## BE-R-1320 외부 I/O timeout/retry 규칙 (필수)

- 외부 HTTP/SDK 호출에는 timeout을 명시해야 한다.
- retry는 idempotent 요청에만 제한적으로 적용한다(무조건 재시도 금지).
- 실패 로그에는 대상/timeout/retry 횟수/requestId를 함께 남긴다.
- timeout 기본값은 하드코딩하지 않고 `config.ini` 정책 섹션을 참조한다.
  - 기본: `[API_POLICY] request_timeout_sec`
  - 개별 API 오버라이드: `[API_POLICY.<apiKey>] request_timeout_sec`
- 우선순위: 코드 오버라이드 > 개별 API 설정 > 전역 기본값
- 우회 금지: 호출 지점에 매직넘버 timeout을 직접 박아 룰을 회피하지 않는다.

## BE-R-1330 대량조회 보호 규칙 (필수)

- 목록 API는 `page/size` 계약을 사용하고 `size` 상한을 서버에서 강제 clamp 해야 한다.
- 금지: 무제한 조회(`size` 미제한, LIMIT 없는 list 조회).
- `size` 상한은 `config.ini` 정책 섹션으로 관리한다.
  - 기본: `[API_POLICY] list_size_max`
  - 개별 API 오버라이드: `[API_POLICY.<apiKey>] list_size_max`
- 권장: 대용량 탐색은 keyset pagination 우선.
- 우선순위: 코드 오버라이드 > 개별 API 설정 > 전역 기본값.
- 절대 상한(`absolute cap`)을 함께 두어 설정 실수로 과대 조회가 열리지 않게 한다.
- 우회 금지: 프론트 입력값(`size`)을 그대로 SQL에 전달해 상한 강제를 생략하지 않는다.

```ini
[API_POLICY]
request_timeout_sec = 5
list_size_max = 100
absolute_list_size_cap = 500

[API_POLICY.dashboard.list]
request_timeout_sec = 3
list_size_max = 200
```
