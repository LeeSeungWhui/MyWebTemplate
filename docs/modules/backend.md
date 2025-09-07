# Backend (FastAPI)

## 목적
- 인증/세션, 공통 응답 래퍼, 트랜잭션 유틸리티를 갖춘 프로덕션 준비형 백엔드 템플릿 제공.

## 기술 스택
- Python 3.12, FastAPI 0.115.x (Pydantic v2), Starlette 0.45.x
- Uvicorn 0.34.x (reload in dev)
- SQLAlchemy 2.0 async(Core 우선)
- Drivers: aiosqlite / aiomysql|asyncmy / asyncpg / python-oracledb
- Docs/Client: OpenAPI(Swagger UI/Redoc), JS 클라이언트(openapi-client-axios)

## 인증 모드 & CORS
- Web(Next): 쿠키 세션(SessionMiddleware). HttpOnly, (prod) Secure, SameSite=Lax.
- App(Expo): Bearer 토큰(SecureStore 보관).
- CORS(dev): Web 쿠키 모드 origin= http://localhost:3000 + allow_credentials=true. 토큰 전용은 * 허용+allow_credentials=false 가능.
- CSRF(쿠키 모드): POST/PUT/PATCH/DELETE 요청에서 X-CSRF-Token(설정값) 필수.

## 버전
- 모든 업무 도메인 경로는 /api/v1/... 사용. 과거 .do 경로는 이관/리다이렉트.

## 포함 Unit
- CU-BE-001 Auth & Session
- CU-BE-002 Header Data API
- CU-BE-003 Transaction Utilities
- CU-BE-004 Healthz & Observability
- CU-BE-005 OpenAPI Docs & JS Client
- CU-BE-006 DB & Query Loader Hardening

## 구현 상태(요약)
- 라우트: backend/router/*.py
- CORS: config.ini [CORS]
- 오류 응답: 일관 JSON
- 로깅: 파일+콘솔(backend/logs/*.log)

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
secret_key = your-secret-key
token_expire = 3600
session_cookie = sid
csrf_header = X-CSRF-Token

[CORS]
allow_origins = http://localhost:3000
allow_credentials = true

[SERVER]
port = 8000
```

## 실행
- 의존성: pip install -r backend/requirements.txt
- 개발: python backend/run.py (uvicorn reload)
- 배포: gunicorn -k uvicorn.workers.UvicornWorker server:app -w 4 -b 0.0.0.0:8000

## 체크리스트
- SessionMiddleware: HttpOnly/SameSite=Lax, prod Secure. max_age=[AUTH].token_expire
- Health: GET /healthz, GET /readyz(DB ping/캐시) 제공
- OpenAPI: 스키마/보안 정의, 쿠키+Bearer 병행
- JS 클라이언트: openapi-client-axios 가이드(타입스크립트 금지)
- DB: 바인드 파라미터 사용(문자열 치환 금지), 쿼리 로깅
- Query: query/ .sql — -- name: 블록, 로더 적재, dev 핫리로드(watchdog), 실패 시 마지막 정상본 유지
- CORS/설정: dev는 allowlist, prod는 엄격 검증
- 관측성: requestId/correlationId, JSON 로그, 로테이션
- 테스트/CI: healthz/readyz, 응답 래퍼 강제, CSRF 403, 401 WWW-Authenticate, pytest
- /healthz,/readyz는 보안 필터 예외

## Links
- Parent: docs/index.md
- Children: docs/units/backend/

## 정책/명시
- CSRF 헤더 이름은 [AUTH].csrf_header. 쿠키 모드 비멱등 요청에서 누락 시 403(AUTH_403_CSRF_REQUIRED).
- 버전 규칙: /api/v1 고정. 공개 경로(/healthz, /readyz, /docs, /openapi.json)는 루트 유지.
- 응답 래퍼 규약은 docs/common-rules.md를 따른다.
