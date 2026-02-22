---
id: CU-BE-002
name: User Table & Seeding
module: backend
status: implemented
priority: P2
links: [CU-BE-001]
---

### Purpose
- 템플릿 실행과 로그인 데모를 위한 최소 사용자 테이블(`T_USER`)과 데모 계정 준비 규약을 제공한다.

### Scope
- 포함: `T_USER` 스키마 정의, 데모 계정(`demo@demo.demo/password123`) 준비 규약
- 제외: 사용자 CRUD/권한 관리(차기), 서버 런타임에서 자동 테이블 생성·시드 수행(부팅 시 자동 시드는 하지 않음)
- 포함: 별도 시드 스크립트 제공(`backend/scripts/users_seed.py`)

### Interface
- 데모 계정(로컬/개발)
  - username: `demo@demo.demo`
  - password: `password123`
  - 저장: `USER_PW`는 PBKDF2(기본) 또는 bcrypt 해시를 사용한다.

### Data & Rules
- 스키마(`T_USER`)
```
{
  "table": "T_USER",
  "fields": ["USER_NO", "USER_ID", "USER_PW", "USER_NM", "USER_EML", "ROLE_CD", "LAST_LOGIN_DT?"]
}
```
- 제약: `USER_ID` UNIQUE, `USER_PW` PBKDF2 저장

### Acceptance Criteria
- AC-1: DB에 `T_USER` 테이블이 존재하고 demo 계정이 준비된다.
- AC-2: 인증 유닛(CU-BE-001)은 `T_USER` 기반으로 로그인/토큰 발급이 동작한다.
