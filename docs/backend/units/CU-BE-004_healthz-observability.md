---
id: CU-BE-004
name: Healthz & Observability
module: backend
status: implemented
priority: P1
links: [CU-BE-001, CU-BE-003]
---

### Purpose
- 운영 필수 라이브니스/레디니스 체크와 JSON 로깅/요청 ID를 제공해 배포/모니터링을 수월하게 한다.

### Scope
- 포함
  - `GET /healthz` (라이브니스, 200 고정, no-store)
  - `GET /readyz` (레디니스: DB ping 및 의존성 점검 포함, OK=200 / FAIL=503, no-store)
  - 요청/응답 JSON 로그(시간/레벨/requestId/path/method/status/latency_ms)
  - `X-Request-Id` 수용/전파(응답 JSON·헤더 동시 반영)
  - (선택) `/metrics` 노출(Prometheus), 기본 게이지/히스토그램

- 제외
  - APM 연동/분산 트레이싱(차기)

### Interface
- API
  - GET `/healthz`
    - Headers: `Cache-Control: no-store`
    - Resp(200): `{ status:true, result:{ ok:true, version, gitSha, startedAt, uptimeSeconds }, requestId }`
  - GET `/readyz`
    - Headers: `Cache-Control: no-store`
    - Checks: DB(드라이버별 ping), (옵션) cache/queue/external
    - Resp(OK=200 | FAIL=503):
      `{ status: <bool>, result:{ ok:<bool>, db:"up"|"down", cache?:"up"|"down", queue?:"up"|"down" }, requestId }`

### Data & Rules
- 로그 파일: `backend/logs/*.log`
- traceId 생성/전파 규칙: 요청 헤더 → 미존재 시 새로 발급
- requestId 생성/전파: 요청 헤더 `X-Request-Id` 우선, 없으면 서버 생성(UUIDv4)
- 헬스 엔드포인트는 인증/CSRF/레이트리밋/서킷브레이커 예외 처리
- DB ping:
  - sqlite/postgres/mysql: `SELECT 1`
  - oracle: `SELECT 1 FROM DUAL`
- 각 체크 타임아웃(기본 300ms). 초과 시 WARN 로그 + FAIL로 집계
- 유지보수 모드: `MAINTENANCE_MODE=true`일 때 `/readyz`는 503 반환

### NFR & A11y
- /healthz 응답 P95 < 50ms, /readyz P95 < 100ms
- 구조적 JSON 로그(최소: ts, level, requestId, method, path, status, latency_ms, msg), PII/시크릿 로그 금지
- 헬스 엔드포인트 access log는 DEBUG 레벨로 다운(노이즈 억제)

### Acceptance Criteria
- AC-1: `/healthz` 200, `/readyz`는 모든 의존성 up일 때 200, down 시 503을 반환한다.
- AC-2: 모든 요청/응답에 requestId가 로그로 남고 응답 헤더(`X-Request-Id`) 및 JSON에 포함된다.
- AC-3: 공통 규칙의 로깅/관측성 항목을 만족한다.
- AC-4: Oracle 드라이버 사용 시 `SELECT 1 FROM DUAL`로 ping이 수행된다.
- AC-5: `MAINTENANCE_MODE=true` 설정 시 `/readyz`는 503을 반환한다.

### Tasks
- T1: `/healthz` 구현(버전/sha/업타임, no-store), `/readyz` 구현(플러그형 체크)
- T2: 요청 ID 미들웨어(헤더 수용→contextvar→로그/응답 반영), 로그 포맷 JSON 통일
- T3: 드라이버별 ping 분기(sqlite/pg/mysql/oracle) + 체크 타임아웃/경과시간 로깅
- T4: 유지보수 모드 스위치(`MAINTENANCE_MODE`) 반영
- T5: Swagger 태그 `observability` 추가(필요 시 `include_in_schema=False`)
- T6: (선택) `/metrics` Prometheus 지표(http_latency_histogram 등) 추가
