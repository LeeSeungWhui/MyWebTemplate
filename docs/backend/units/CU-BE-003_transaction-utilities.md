---
id: CU-BE-003
name: Transaction Utilities
module: backend
status: implemented
priority: P1
links: [CU-BE-006]
---

### Purpose
- DB 트랜잭션 데코레이터와 데모 엔드포인트를 제공해 CRUD 작업을 안전하게 처리한다.

### Scope
- 포함
  - `@transaction(engine)` 기반 DB 트랜잭션 데코레이터
  - 옵션: `isolation`, `timeout_ms`, `retries`, `retry_on`(serialization/deadlock)
  - 테스트용 CRUD 엔드포인트 1쌍
  - 실행/커밋/롤백 로깅(requestId, tx_id, phase, latency_ms, rows, sql_count)
- 제외
  - 분산 DB/XA 트랜잭션 등 복잡한 시나리오(차후 고려)

### Interface
- API(데모)
  - POST `/api/v1/transaction/test/single` 단일 트랜잭션(insert + select)
  - POST `/api/v1/transaction/test/unique-violation` UNIQUE 제약 위반 후 롤백 예시

### Data & Rules
```
{
  "table": "test_transaction",
  "fields": [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "value TEXT UNIQUE"
  ]
}
```
- 원칙: 모든 데이터 변경은 `@transaction(engine)` 내부에서 실행

### NFR & A11y
- 성능: CRUD P95 < 200ms(SQLite 기준)
- 로깅: `requestId, tx_id, phase(start|commit|rollback), latency_ms, rows, sql_count` 기록

### Acceptance Criteria
- AC-1: `/api/v1/transaction/test/single`는 커밋되고 `/api/v1/transaction/test/unique-violation`은 UNIQUE 위반으로 롤백된다.
- AC-2: 트랜잭션 시작/커밋/롤백 로그에 `requestId, tx_id, phase, latency_ms`가 포함된다.
- AC-3: 호출자는 트랜잭션 실행 결과 데이터를 받는다.
- AC-4: `retries` 옵션 설정 시 지정 횟수만큼 재시도 후 실패하거나 성공한다.
- AC-5: 세이브포인트 기반 부분 롤백을 지원한다.

### Tasks
- T1: 테스트 CRUD 엔드포인트(`/api/v1/transaction/test/single`, `/api/v1/transaction/test/unique-violation`) 구현
- T2: `@transaction(engine, isolation="READ COMMITTED", timeout_ms=5000, retries=2, retry_on=["serialization","deadlock"])` 옵션 처리
- T3: 실행 시간(ms)/`sql_count` 로깅 및 집계
- T4: 세이브포인트를 이용한 부분 트랜잭션 예제 추가
- T5: 단위 테스트로 커밋/롤백/재시도 경로 검증
