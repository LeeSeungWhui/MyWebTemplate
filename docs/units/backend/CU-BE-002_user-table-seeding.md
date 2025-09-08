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
- 포함: T_USER 스키마 정의, 데모 계정 시드 스크립트
- 제외: 사용자 CRUD/권한 관리(차기), 서버 런타임에서 테이블 생성·시드 수행

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
- 제약: `username` UNIQUE, `password_hash` PBKDF2 저장
- 시드: `users_seed.py --init --seed-demo` 실행 시 데모 계정 `demo/password123` 생성

### Acceptance Criteria
- AC-1: `backend/scripts/users_seed.py --init --seed-demo` 실행 시 `T_USER`가 생성되고 demo 계정이 준비된다.
- AC-2: 시드 스크립트로 사용자를 추가/조회할 수 있다.
- AC-3: 인증 유닛(CU-BE-001)은 `T_USER` 기반으로 로그인/토큰 발급이 동작한다.


