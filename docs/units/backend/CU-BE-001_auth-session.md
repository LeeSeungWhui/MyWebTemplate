---
id: CU-BE-001
name: Auth & Session
module: backend
status: implemented
priority: P1
links: [CU-BE-004, CU-BE-005]
---

### Purpose
- 로그인 API 제공 및 Web(세션)/App(토큰) 이중 인증 흐름을 템플릿 수준으로 구현한다.

### Scope
- 포함
  - 로그인 API(샘플 계정 인증), 로그아웃, 만료 처리
  - Web: 세션 미들웨어(SessionMiddleware) 적용(쿠키 HttpOnly/SameSite=Lax/Secure)
  - App: Bearer 토큰 발급/검증(토큰 저장은 SecureStore 권장)
  - 표준 응답 스키마 적용(HTTP 상태코드 엄수)
  - 쿠키 플로우: 비멱등 요청에 `X-CSRF-Token` 요구(더블서밋 또는 ORIGIN 검증)
  - 로그인 CSRF 옵션(`[AUTH].login_require_csrf` 기본 false) → true일 때 로그인 API도 `X-CSRF-Token` 필요
- 제외
  - RBAC/권한 매트릭스 상세 설계(차기)
  - 소셜 로그인/OTP 등 확장 흐름

### Interface
- API
  - POST `/api/v1/auth/login`   // Web: 쿠키 세션 발급
    - req: `{ username: string, password: string, rememberMe?: boolean }`  // rememberMe=true → sid max_age를 기본(예: 1d)에서 장기(예: 30d)로 연장
    - res: 204 No Content (Set-Cookie: sid=...)
  - POST `/api/v1/auth/logout`
    - res: 204 No Content (쿠키 만료, 서버 세션 무효화)
    - note: 쿠키 플로우에서는 비멱등이므로 `X-CSRF-Token` 필수
  - GET  `/api/v1/auth/session`  // Cache-Control: no-store
    - res: `{ status: true, message: "", result: { authenticated: boolean, userId?: string, name?: string }, requestId: string }`
  - POST `/api/v1/auth/token`   // App: 토큰 발급
    - res: `{ status: true, message: "", result: { access_token: string, token_type: "bearer", expires_in: number }, requestId: string }`
  - GET  `/api/v1/auth/csrf`    // (선택) 쿠키 플로우용 CSRF 토큰 발급
    - res: `{ status: true, message: "", result: { csrf: string }, requestId: string }`

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
  - 쿠키: HttpOnly, Secure, SameSite=Lax (교차 도메인 호출 필요 시 `SameSite=None; Secure`)
  - 암호: bcrypt 해시 비교, 에러 메시지는 모模糊화(계정/비번 구분 노출 금지)
  - 레이트리밋: 로그인 엔드포인트 5 req/min (IP/계정 기준 중 하나 선택), 초과 시 429 + `code=AUTH_429_RATE_LIMIT` (+ `Retry-After` 헤더 권장)
  - 쿠키 이름: `[AUTH].session_cookie`(기본 sid), HttpOnly/(prod)Secure/SameSite=Lax
  - CSRF 헤더 이름은 `[AUTH].csrf_header`를 따른다(기본 `X-CSRF-Token`).
  - 로그인 CSRF: `[AUTH].login_require_csrf` 기본 false; true일 땐 `/api/v1/auth/login`도 `X-CSRF-Token`이 없으면 403 반환
  - 입력 검증: username 최소 길이/포맷, password 최소 길이(예: ≥ 8)
  - 토큰 만료: `expires_in`은 `[AUTH].token_expire`와 동일
  - JWT 클레임: `sub=<userId>`, `exp=now+[AUTH].token_expire`, `iat`, `jti`(재사용·블랙리스트 대비)
  - 서명 알고리즘: 기본 HS256 (키 회전 계획은 TODO에 포함)
  - 세션 고정 방지: 로그인 성공 시 세션 ID 재발급(Session ID rotate)

### NFR & A11y
- 성능: 로그인 API P95 < 400ms (DB ping 포함)
- 보안: OWASP Top 10 준수, 시크릿은 ENV/CI 주입, CSRF(쿠키 흐름에서 비멱등 메서드 보호)
- CORS(dev): 쿠키 테스트는 origin=`http://localhost:3000` + credentials=true 고정

### Acceptance Criteria
- AC-1: Web 로그인 성공 시 204 + Set-Cookie(sid) 반환, `/api/v1/auth/session`에서 authenticated=true 확인.
- AC-2: 실패 케이스에서 401/403/422 등 적절한 HTTP 코드 + `{status:false, code, requestId}` 반환.
       Bearer 보호 라우트의 401에는 `WWW-Authenticate: Bearer`가 포함된다.
- AC-3: 로그아웃 시 세션/쿠키가 만료되고 인증 상태가 false로 바뀐다.
- AC-4: App 토큰 발급 `/api/v1/auth/token` 성공 시 `{access_token, token_type, expires_in}` 반환 및 보호 라우트 접근 가능.
- AC-5: 쿠키 플로우에서 비멱등 요청은 `X-CSRF-Token` 미포함 시 403을 반환한다.
       `/api/v1/auth/csrf` 로 발급된 토큰을 사용한다.

### Tasks
- T1: `server.py`에 `SessionMiddleware` 추가(키는 `[AUTH].secret_key` 재사용)
- T2: `/api/v1/auth/login`, `/api/v1/auth/logout`, `/api/v1/auth/session` 라우트 구현
- T2-1: `/api/v1/auth/token`, `/api/v1/auth/csrf` 구현
- T3: 샘플 계정 시드/검증 로직(bcrypt) 추가
- T4: 표준 응답 스키마 적용 및 에러 매핑
- T5: Swagger 태그/스키마 예시 추가(links: CU-BE-005)
 T5-1: `/api/v1/auth/session`에 `Cache-Control: no-store` 헤더 설정
 T5-2: 401 응답에 `WWW-Authenticate` 헤더 부착(Bearer/Cookie)
- T6: OpenAPI 보안스키마 병행 표기(APIKeyCookie: sid, HTTPBearer)
- T7: 레이트리밋 미들웨어/데코레이터 적용(로그인 엔드포인트)
- T8: pytest: 성공/실패 로그인, CSRF 403, 토큰 발급, 로그아웃, 세션 유지(E2E 1건)
- T9: 감사 로그 추가(성공/실패/로그아웃). 비밀번호/토큰 등 민감정보는 마스킹.
