---
id: CU-BE-001
name: Auth (Access/Refresh 쿠키 토큰)
module: backend
status: implemented
priority: P1
links: [CU-BE-004, CU-BE-005]
---

### Purpose
- 로그인 API 제공 및 Access/Refresh 쿠키 기반 토큰 흐름을 템플릿 수준으로 구현한다.

### Scope
- 포함
  - 로그인 API: 자격 증명 검증 후 Access/Refresh 쿠키 발급(rememberMe에 따라 Refresh 수명 session/장기)
  - 리프레시 API: Refresh 쿠키 검증 후 Access 쿠키 재발급(회전 권장)
  - 로그아웃: Refresh 쿠키 폐기, 필요 시 서버 블랙리스트 처리
  - 표준 응답 스키마 적용(HTTP 상태코드 엄수)
- 제외
  - 세션 미들웨어 기반 인증
  - 소셜 로그인/OTP 등 확장 흐름

### Interface
- API
  - POST `/api/v1/auth/login`
    - req: `{ username: string, password: string, rememberMe?: boolean }`
    - res: 200 JSON `{ access_token, token_type, expires_in }` + Set-Cookie: Access(짧음), Refresh(rememberMe에 따라 session/장기)
  - POST `/api/v1/auth/refresh`
    - req: Refresh 쿠키
    - res: 200 JSON `{ access_token, token_type, expires_in }` + Access/Refresh 쿠키 회전
  - POST `/api/v1/auth/logout`
    - res: 204 No Content (Refresh 쿠키 만료, 선택적 블랙리스트)
  - GET `/api/v1/auth/me`
    - 헤더 Bearer 인증 후 사용자 정보 반환(WWW-Authenticate: Bearer on 401)

- 공통 응답 규칙(JSON 응답 시)
  - 성공: `{ status: true, message: "", result: {...}, requestId: "<uuid>" }`
  - 에러: `{ status: false, code: "AUTH_401_INVALID", message: "...", requestId: "<uuid>" }` + HTTP 401/403/422 등
    - 토큰 보호 라우트의 401 응답에는 `WWW-Authenticate: Bearer` 헤더를 포함한다.
    - 세션 보호 라우트의 401 응답 헤더는 문서화용으로 `WWW-Authenticate: Cookie`를 사용한다.

### Data & Rules
- 샘플 사용자 스키마(예)
```
{
  "table": "T_USER",
  "fields": ["ID_MEMBER", "NM_MEMBER", "PASSWORD_HASH"]
}
```
- 보안 규칙
  - Access/Refresh 쿠키: HttpOnly, Secure, SameSite=Lax (cross-domain 필요 시 `SameSite=None; Secure`)
  - rememberMe=false → Refresh를 세션 쿠키로 발급(브라우저 종료 시 삭제), true → max-age(예: 7~30일)
  - 암호: bcrypt 해시 비교, 에러 메시지는 모模糊화(계정/비번 구분 노출 금지)
  - 레이트리밋: 로그인 엔드포인트 5 req/min (IP/계정 기준 중 하나 선택), 초과 시 429 + `code=AUTH_429_RATE_LIMIT` (+ `Retry-After` 헤더 권장)
  - 쿠키 이름: Access/Refresh 별도(`access_token`, `refresh_token` 등) 정의. HttpOnly/(prod)Secure/SameSite=Lax
  - CSRF: 세션 미사용이므로 비멱등 요청에 CSRF 헤더 요구 제거. Refresh는 HttpOnly 쿠키 검증으로 처리.
  - 입력 검증: username 최소 길이/포맷, password 최소 길이(예: ≥ 8)
  - 토큰 만료: Access는 짧게(`[AUTH].access_expire`), Refresh는 길게(`[AUTH].refresh_expire` 또는 rememberMe 설정)
  - JWT 클레임: `sub=<userId>`, `exp=now+[AUTH].token_expire`, `iat`, `jti`(재사용·블랙리스트 대비)
  - 서명 알고리즘: 기본 HS256 (키 회전 계획은 TODO에 포함)
  - 리프레시 회전: `/refresh` 성공 시 새 Refresh를 재발급, 이전 토큰은 블랙리스트 처리 권장

### NFR & A11y
- 성능: 로그인 API P95 < 400ms (DB ping 포함)
- 보안: OWASP Top 10 준수, 시크릿은 ENV/CI 주입, Refresh 회전/블랙리스트 권장
- CORS(dev): origin=`http://localhost:3000` + credentials=true 고정(쿠키 전달용)

### Acceptance Criteria
- AC-1: 로그인 성공 시 Access/Refresh 쿠키가 설정되고 본문에 `{access_token,...}`가 반환된다.
- AC-2: 401/403/422 등 오류 시 `{status:false, code, requestId}`+적절한 `WWW-Authenticate` 헤더를 포함한다.
- AC-3: `/api/v1/auth/refresh`는 유효한 Refresh 쿠키로 Access/Refresh를 회전해 재발급한다. 만료/블랙리스트 시 401 반환.
- AC-4: 로그아웃 시 Refresh 쿠키가 만료되고 이후 `/refresh`가 401을 반환한다.
- AC-5: 보호 라우트는 Bearer 토큰 헤더만 신뢰하며, 토큰 만료 시 401을 반환한다.

### Tasks
- T1: `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/logout`, `/api/v1/auth/me` 구현(Access/Refresh 쿠키 포함)
- T2: Sample 계정 시드/검증(bcrypt)
- T3: 표준 응답 스키마 및 WWW-Authenticate 헤더 적용
- T4: Swagger 보안 스키마(Access/Refresh 쿠키 + Bearer) 문서화 (links: CU-BE-005)
- T5: 레이트리밋 적용(로그인)
- T6: pytest: 로그인 성공/실패, refresh 성공/실패, logout, 401/429 헤더 검증
- T7: 감사 로그(성공/실패/로그아웃/refresh). 민감정보 마스킹.
