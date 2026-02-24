# Backend (FastAPI)

## 목적
- 인증/세션, 공통 응답 래퍼, 트랜잭션 유틸리티를 갖춘 프로덕션 준비형 백엔드 템플릿 제공.

## 기술 스택
- Python 3.12, FastAPI 0.128.x (Pydantic v2), Starlette 0.50.x
- Uvicorn 0.40.x (reload in dev)
- SQLAlchemy 2.0.45 async(Core 우선)
- Drivers: aiosqlite / aiomysql|asyncmy / asyncpg / python-oracledb
- Docs/Client: OpenAPI(Swagger UI/Redoc), JS 클라이언트(openapi-client-axios)

## 인증 모드 & CORS
- Web/APP 공통: 토큰 기반. 액세스 토큰은 짧게 발급해 HttpOnly Access 쿠키로 내려주고, 리프레시 토큰은 HttpOnly Refresh 쿠키로 관리(rememberMe에 따라 session/장기).
- BFF(Next)에서 Access 쿠키를 읽어 `Authorization: Bearer ...` 헤더로 백엔드에 전달, 401 시 한 번 `/api/v1/auth/refresh` 후 재시도.
- CORS(dev): origin= http://localhost:3000 + allow_credentials=true(리프레시 쿠키 전달). 필요 시 allow_origin_regex 사용.
- CSRF: 세션을 쓰지 않으므로 비멱등 요청에서 CSRF 헤더 요구를 제거. Refresh는 HttpOnly 쿠키 검증으로 처리.

## 버전
- 모든 업무 도메인 경로는 /api/v1/... 사용. 과거 .do 경로는 이관/리다이렉트.

## 포함 Unit
- CU-BE-001 Auth & Session
- CU-BE-002 User Table & Seeding
- CU-BE-003 Transaction Utilities
- CU-BE-004 Healthz & Observability
- CU-BE-005 OpenAPI Docs & JS Client
- CU-BE-006 DB & Query Loader Hardening
- CU-BE-007 Dashboard Tasks CRUD API
- CU-BE-008 Profile & Settings API (Dashboard)
- CU-BE-009 Auth Signup API

## Unit 진행 현황
- CU-BE-001: implemented — Access/Refresh 쿠키 기반 인증/세션 API + 401/refresh 재시도 규약 반영
- CU-BE-002: implemented — `T_USER` 기반 샘플 계정/시드 스크립트와 테스트 데이터 초기화 흐름 반영
- CU-BE-003: implemented — 단일/중첩 트랜잭션 유틸 + requestId/sqlCount 로깅 반영
- CU-BE-004: implemented — `/healthz` `/readyz` + requestId 전파 + 유지보수 모드(`MAINTENANCE_MODE`) 처리 반영
- CU-BE-005: implemented — OpenAPI 문서(`/docs`, `/openapi.json`)와 JS 호출 유틸 계약 정렬
- CU-BE-006: implemented — query loader/watcher + 바인드 파라미터 검증 + SQL 실행 하드닝 + 누락 쿼리명 명시 예외(`Query not found: <name>`) 반영
- CU-BE-007: implemented — `/api/v1/dashboard` REST CRUD + 검색/필터/페이지네이션 + 상태 집계 반영
- CU-BE-008: implemented — `/api/v1/profile/me` 조회/저장 + 설정 화면 연동 API 반영
- CU-BE-009: implemented — `/api/v1/auth/signup` + 중복 이메일(409) + 입력 검증(422) 반영

## 구현 상태(요약)
- 라우트: backend/router/*.py
- CORS: config.ini [CORS]
- 오류 응답: 일관 JSON
- 로깅: 파일+콘솔(backend/logs/*.log)
- 데모 계정은 환경별 DB에 준비되어 있어야 한다(예: `demo@demo.demo/password123`).
- 대시보드 확장 API(CU-BE-007, CU-BE-008)와 회원가입 API(CU-BE-009)는 구현 완료 상태로 반영됨.

## 코드 구조
- router/: API 엔드포인트(APIRouter). prefix=/api/v1 고정, 모듈별 라우터 분리(예: AuthRouter, ObservabilityRouter).
- service/: 각 엔드포인트의 비즈니스 로직. 트랜잭션 데코레이터 우선, DB·캐시 접근은 서비스에서만 수행.
- query/: SQL 파일(.sql). -- name: <키> 블록으로 구분, 바인드 파라미터만 허용. 로더가 레지스트리로 적재.
- lib/: 공통 유틸(Response, RequestContext, Database, transaction, csrf, logging 등).
- middleware/: RequestId, 로깅, CSRF/보안 미들웨어.
- tests/: pytest 스펙(healthz/readyz, auth, 트랜잭션, 쿼리 로더 등).

## 쿼리 로더 & 변경 감시(Dev Hot Reload)
- 로더: 서버 기동 시 query/ 이하 모든 .sql을 스캔해 -- name: 키로 분리, 레지스트리(app.state.queries)에 적재.
  - 예: -- name: member.selectById → service에서 "member.selectById"로 조회 사용
  - 보안: 문자열 치환 금지, 바인드 파라미터(:id 등)만 허용
- 변경 감시: dev에서 watchdog으로 .sql 변경을 감시해 디바운스(기본 150ms) 후 해당 파일만 재적재.
  - 성공 시 INFO: query.reload file=<path> keys=[...] count=..., 실패 시 ERROR 후 마지막 정상본 유지
  - 초기 로딩 실패는 부팅 실패(fail-fast)
- 설정 키:
  - [DATABASE].query_dir = query
  - [DATABASE].query_watch = true
  - [DATABASE].query_watch_debounce_ms = 150
- 관측성: readyz OK 시 query 레지스트리 크기(metrics 선택), 로그에 requestId/correlationId 포함


## 응답 래퍼 규약
- 본문: { status:boolean, message:string, result:any|null, count?:number, code?:string, requestId:string }
- 규칙: 목록 응답에만 count. 오류는 code 포함 + HTTP 4xx/5xx.

## DB Ping
- sqlite/postgresql/mysql: SELECT 1, oracle: SELECT 1 FROM DUAL
- 캐시/메시지는 /readyz에서 함께 노출 가능.

## 튜닝 권장
- pool_pre_ping=True, pool_recycle=1800, pool_size=5, max_overflow=10 (환경에 맞게 조정)

## 라이프사이클
- 앱 기동: AsyncEngine 생성 app.state.engine 보관. 종료 시 dispose.

## Acceptance Criteria (Template Complete)
- 로그인 API가 성공/실패를 구분하여 응답 래퍼로 반환.
- 단일 DB 트랜잭션 유틸(데코레이터/컨텍스트) 정상 동작.
- GET /healthz 200, GET /readyz(DB ping) 200. JSON 로그에 requestId 포함.
- Swagger UI(/docs)에서 로그인/응답 모델 문서화. 프런트는 JS OpenAPI 클라이언트(openapi-client-axios)로 호출 가능.
- 공통 규칙(common-rules.md) DoD 충족.

## 설정(config.ini)
- `backend/config.ini`는 로컬 전용이며 git에 올리지 않는다.
  - 시작은 `backend/config.example.ini`를 복사해서 `backend/config.ini`로 만들어 사용한다.

```
[DATABASE]
name = main_db
type = sqlite
database = ./data/main.db
; dsn = sqlite+aiosqlite:///./data/main.db
query_dir = query
query_watch = true
query_watch_debounce_ms = 150

[AUTH]
token_enable = true
; ⚠️ 반드시 32바이트 이상 랜덤 키로 교체
secret_key = replace-with-strong-random-secret
token_expire = 3600
refresh_expire = 604800
access_cookie = access_token
refresh_cookie = refresh_token

[CORS]
allow_origins = http://localhost:3000,http://localhost
allow_credentials = true

[SERVER]
port = 2000
```

- `secret_key`는 기본값/예제값을 절대 그대로 쓰지 않는다. 배포 환경에서는 ENV 또는 서버 비밀값으로 주입한다.

## 실행
- 의존성: `pip install -r backend/requirements.txt`
- PATH 세팅: `source ./env.sh`
- 개발(포그라운드): `python backend/run.py`
- 운영/백그라운드(run.sh):
  - 시작(prod): `./backend/run.sh start`
  - 시작(dev): `./backend/run.sh start-dev`
  - 상태 확인: `./backend/run.sh status` / `./backend/run.sh status-dev`
  - 중지: `./backend/run.sh stop` / `./backend/run.sh stop-dev`
- 배포 권장: `backend/run.sh start` 기본 바인딩은 `0.0.0.0:<port>`다. 운영에서는 Nginx 리버스 프록시 + 방화벽(또는 보안그룹)으로 외부 접근을 제한한다. localhost 바인딩이 필요하면 run.sh의 host를 `127.0.0.1`로 조정해 사용한다. (docs/ops/nginx-subdomains.md 참고)

## 체크리스트
- 토큰 방식: Access/Refresh 둘 다 HttpOnly 쿠키. Access는 짧게, Refresh는 rememberMe에 따라 session/장기. 401 → refresh → 재시도.
- Health: GET /healthz, GET /readyz(DB ping/캐시) 제공
- OpenAPI: 스키마/보안 정의, 쿠키+Bearer 병행
- JS 클라이언트: openapi-client-axios 가이드(타입스크립트 금지)
- DB: 바인드 파라미터 사용(문자열 치환 금지), 쿼리 로깅
- Query: query/ .sql — -- name: 블록, 로더 적재, dev 핫리로드(watchdog), 실패 시 마지막 정상본 유지
- CORS/설정: dev는 allowlist, prod는 엄격 검증
- 관측성: requestId/correlationId, JSON 로그, 로테이션
- 테스트/스모크: healthz/readyz, 응답 래퍼 강제, 401 WWW-Authenticate, pytest
- /healthz,/readyz는 보안 필터 예외

## Links
- Parent: docs/index.md
- Children: docs/backend/units/

## 정책/명시
- CSRF 헤더는 현재 템플릿에서 강제하지 않는다(세션 미사용).
- 버전 규칙: /api/v1 고정. 공개 경로(/healthz, /readyz, /docs, /openapi.json)는 루트 유지.
- 응답 래퍼 규약은 docs/common-rules.md를 따른다.
