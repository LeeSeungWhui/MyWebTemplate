---
id: CU-BE-006
name: DB & Query Loader Hardening
module: backend
status: implemented
priority: P2
links: [CU-BE-003]
---

### Purpose
- DB 연결과 SQL 로더를 강화해 안전한 쿼리 실행과 변경 감지 리로드를 지원한다.

### Scope
- 포함
  - `query/` 디렉토리의 `.sql` 파일을 로드하고 `-- name:` 주석으로 키를 지정하는 레지스트리.
  - 모든 쿼리는 바인딩 파라미터만 허용.
  - 개발 환경에서 watchdog으로 파일 변경을 감지하여 자동 리로드.
  - 로드/리로드 시 `file, keys, count, duration_ms` 필드를 가진 구조적 로그 기록.
- 제외
  - ORM 기반 자동 생성, 복잡한 마이그레이션 툴.

### Interface
- 파일 예시(.sql)
  - `-- name: member.selectById`
    `SELECT * FROM member WHERE id = :id;`
  - `-- name: member.insert`
    `INSERT INTO member(id, name) VALUES(:id, :name);`
- 사용 예시
  - 서비스에서 `query_registry["member.selectById"]`로 조회 후 SQLAlchemy Core text + bind params로 실행.
- 문서화
  - 상단 `-- name:` 뒤에 키를 쓰고 줄바꿈 후 SQL을 작성. 모든 파일은 UTF-8.

### Acceptance Criteria
- **AC-1:** `query/`의 모든 SQL이 `-- name:` 키를 포함하고 중복 시 로더가 예외를 던진다.
- **AC-2:** 개발 모드에서 .sql 수정 후 1초 이내에 리로드되고 로그에 변경 내용이 남는다.
- **AC-3:** 실행 시 항상 바인딩 파라미터만 사용하며 문자열 치환을 허용하지 않는다.
- **AC-4:** 로드/리로드 이벤트가 JSON 로그(`file, keys, count, duration_ms`)로 기록된다.
- **AC-5:** `query_watch` on/off와 `query_watch_debounce_ms` 설정이 정상 작동한다.
- **AC-6:** 존재하지 않는 쿼리 키 실행 시 `ValueError("Query not found: <queryName>")` 형식의 명시적 예외를 반환한다.

### Tasks

### Notes
- Loader: `query/` 디렉토리를 재귀 스캔해 `.sql`의 `-- name:` 블록으로 {name: sql} 레지스트리를 구성한다. 이름 중복은 즉시 예외로 실패한다(fail-fast). 파일 인코딩은 UTF-8.
- Logging: 초기 로드 `event=query.load`, 변경 리로드 `event=query.reload` 구조적 JSON 로그를 남긴다(공통 필드: file, keys, count, duration_ms).
- Config: [DATABASE] `query_dir`(기본 `query` → backend/query), `query_watch`(기본 true), `query_watch_debounce_ms`(기본 150).
- Coding: 함수/변수는 camelCase, 파일/함수 헤더 주석을 포함한다(common-rules 준수).
- Partial Reload: 변경된 파일만 파싱하여 해당 파일의 키 집합을 레지스트리에서 교체한다(추가/수정/삭제 반영). 교차 파일 중복 충돌이 발생하면 리로드를 중단하고 마지막 정상본을 유지한다.
- Rollback Semantics: 핫리로드 실패 시 레지스트리는 변경되지 않으며 `event=query.reload.error` 로그만 남긴다.
- Missing Query Handling: 서비스에서 존재하지 않는 queryName을 호출하면 `ValueError("Query not found: <queryName>")`를 발생시켜 원인 추적이 가능해야 한다.
