---
id: CU-BE-007
name: Dashboard Tasks CRUD API
module: backend
status: implemented
priority: P0
links: [CU-BE-001, CU-BE-002, CU-BE-006, CU-WEB-014]
---

### Purpose
- 보호 화면 `/dashboard/tasks`에서 사용할 업무 관리 CRUD API를 제공한다.
- 템플릿 수준에서 “조회 전용 대시보드”를 “실제 데이터 변경 가능한 관리자 API”로 확장한다.

### Scope
- 포함
  - `GET /api/v1/dashboard` (검색/필터/페이지네이션 확장)
  - `GET /api/v1/dashboard/{id}`
  - `POST /api/v1/dashboard`
  - `PUT /api/v1/dashboard/{id}`
  - `DELETE /api/v1/dashboard/{id}`
  - 공통 응답 스키마/에러 코드/requestId 적용
- 제외
  - 고급 권한 정책(RBAC 세분화), 대량 배치 처리

### Interface
- 인증
  - Bearer 토큰 필수(미인증 401 + `WWW-Authenticate: Bearer`)
- API 계약
  - `GET /api/v1/dashboard`
    - query: `q?`, `status?`, `page?`, `size?`, `sort?`
    - res 200:
      - 래퍼: `{ status, message, result, count, requestId }`
      - `result`: `DashboardItem[]`
      - `count`: 필터 조건 기준 전체 건수(페이지네이션 totalCount)
      - 예시:
        ```json
        {
          "status": true,
          "message": "ok",
          "result": [
            {
              "id": 101,
              "title": "작업명",
              "description": "상세",
              "status": "OPEN",
              "amount": 12000,
              "tags": ["urgent"],
              "createdAt": "2026-02-25T10:00:00Z"
            }
          ],
          "count": 37,
          "requestId": "..."
        }
        ```
  - `GET /api/v1/dashboard/{id}`
  - `POST /api/v1/dashboard`
    - req: `{ title, description?, status, amount?, tags? }`
  - `PUT /api/v1/dashboard/{id}`
    - req: `{ title?, description?, status?, amount?, tags? }`
  - `DELETE /api/v1/dashboard/{id}`

### Data & Rules
- 대상 테이블: `T_DATA`
  - 컬럼: `DATA_NO`, `DATA_NM`, `DATA_DESC`, `STAT_CD`, `AMT`, `TAG_JSON`, `REG_DT`
- 경로 규칙: dashboard CRUD는 REST 리소스 스타일(`/api/v1/dashboard`, `/api/v1/dashboard/{id}`)을 사용한다.
- 집계 API는 읽기 전용 보조 리소스로 `GET /api/v1/dashboard/stats`를 유지한다.
- 쿼리는 `backend/query/dashboard.sql`에 `-- name:` 블록으로 관리한다.
- 문자열 치환 금지, 바인드 파라미터만 사용한다.
- 프론트 호환을 위해 응답 키는 camelCase(alias)로 유지한다.
- `TAG_JSON`은 JSON 배열 문자열로 저장한다(예: `["태그1","태그2"]`).
- 삭제는 템플릿 기본으로 hard delete를 사용한다(soft delete는 차기 확장).

### NFR & A11y
- 목록/상세 조회 API P95 < 400ms 목표.
- 오류 응답은 사용자 메시지 + 내부 `code` + `requestId`를 함께 반환한다.

### Acceptance Criteria
- AC-1: 생성/수정/삭제 후 목록 재조회 시 DB 반영 결과가 일관되게 확인된다.
- AC-2: 잘못된 입력/미존재 ID에 대해 4xx 코드와 표준 에러 본문이 반환된다.
- AC-3: 모든 CRUD 엔드포인트가 Bearer 인증 가드를 통과해야만 동작한다.
- AC-4: 쿼리는 전부 query 파일 기반으로 실행되고 SQL 바인딩 규칙을 준수한다.
- AC-5: `GET /api/v1/dashboard` 목록 응답은 `{status,message,result,count,requestId}`를 준수하고, `count`는 필터 기준 전체 건수(totalCount)를 반환한다.

### Tasks
- T1: `dashboard.sql`에 list/detail/create/update/delete 쿼리 블록 추가.
- T2: `DashboardService` CRUD 메서드 및 입력 검증 추가.
- T3: `DashboardRouter` 엔드포인트 확장 + 상태코드/에러코드 정렬.
- T4: pytest(정상/유효성/권한/미존재 케이스) 추가.
