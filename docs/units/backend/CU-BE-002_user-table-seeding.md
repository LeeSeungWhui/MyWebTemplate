---
id: CU-BE-002
name: User Table & Seeding
module: backend
status: implemented
priority: P2
links: [CU-BE-001]
---

### Purpose
- 템플릿 실행과 로그인 데모를 위한 최소 사용자 테이블(T_USER)과 시드 도구 제공.

### Scope
- 포함: T_USER 스키마 정의, 서버 스타트업 시 테이블/데모 계정 보장, 수동 시드 스크립트
- 제외: 사용자 CRUD/권한 관리(차기)

### Interface
- 시드 스크립트(로컬 개발용)
  - 경로: `backend/scripts/users_seed.py`
  - 예시:
    - 초기화+데모: `py -3 backend/scripts/users_seed.py --init --seed-demo`
    - 유저 추가: `py -3 backend/scripts/users_seed.py --add --username alice --password secret123 --name "Alice" --email alice@example.com --role user`
    - 목록: `py -3 backend/scripts/users_seed.py --list`

### Data & Rules
- 스키마(T_USER)
```
{
  "table": "T_USER",
  "fields": ["id", "username", "password_hash", "name", "email", "role", "last_login_at?"]
}
```
- 제약: `username` UNIQUE, `password_hash` bcrypt 저장
- 시드: 기본 계정 `demo/password123`, role=`admin`

### Acceptance Criteria
- AC-1: 서버 기동 시 `T_USER`가 존재하고 demo 계정이 없으면 자동 생성된다.
- AC-2: 시드 스크립트로 사용자를 추가/조회할 수 있다.
- AC-3: 인증 유닛(CU-BE-001)은 `T_USER` 기반으로 로그인/토큰 발급이 동작한다.

### Notes
- 구 Header Data API는 템플릿 범위에서 제외되었으며, 본 유닛으로 대체됨.

