---
id: CU-BE-002
name: User Table & Seeding
module: backend
status: implemented
priority: P2
links: [CU-BE-001]
---

### Purpose
- 템플릿 실행과 로그인 데모를 위한 최소 사용자 테이블(`user_template`)과 데모 계정 준비 규약을 제공한다.

### Scope
- 포함: `user_template` 스키마 정의, 데모 계정(`demo@demo.demo/password123`) 준비 규약
- 제외: 사용자 CRUD/권한 관리(차기), 서버 런타임에서 테이블 생성·시드 수행, 별도 시드 스크립트 제공(현 템플릿 미포함)

### Interface
- 데모 계정(로컬/개발)
  - username: `demo@demo.demo`
  - password: `password123`
  - 저장: `password_hash`는 PBKDF2(기본) 또는 bcrypt 해시를 사용한다.

### Data & Rules
- 스키마(`user_template`)
```
{
  "table": "user_template",
  "fields": ["id", "username", "password_hash", "name", "email", "role", "last_login_at?"]
}
```
- 제약: `username` UNIQUE, `password_hash` PBKDF2 저장

### Acceptance Criteria
- AC-1: DB에 `user_template` 테이블이 존재하고 demo 계정이 준비된다.
- AC-2: 인증 유닛(CU-BE-001)은 `user_template` 기반으로 로그인/토큰 발급이 동작한다.

