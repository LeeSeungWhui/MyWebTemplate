---
id: CU-BE-001
name: Auth Session (Web Cookie + App Token Contract Split)
module: backend
status: in-progress
priority: P1
links: [CU-BE-004, CU-BE-005, CU-WEB-001, CU-APP-001]
---

### Purpose
- 인증 코어(토큰 발급/검증/회전)는 공용으로 유지하고, Web/App 전송 계약을 분리한다.
- Web은 쿠키 중심 계약으로 보안 노출을 최소화하고, App은 토큰 JSON 계약으로 네이티브 연동성을 보장한다.

### Scope
- 포함
  - Web 인증 API: `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/logout`
  - App 인증 API: `/api/v1/auth/app/login`, `/api/v1/auth/app/refresh`, `/api/v1/auth/app/logout`
  - 보호 API 공통 규약: Bearer 기반 `/api/v1/auth/me`
  - 리프레시 회전/블랙리스트/grace 정책
  - 표준 응답 스키마 적용(HTTP 상태코드 엄수)
- 제외
  - 세션 미들웨어 기반 인증
  - 소셜 로그인/OTP/패스키 등 확장 흐름

### Interface
- Web API (cookie contract)
  - POST `/api/v1/auth/login`
    - req: `{ username: string, password: string, rememberMe?: boolean }`
    - res: `200 JSON { tokenType:'cookie', expiresIn, refreshExpiresIn }` + Set-Cookie(Access/Refresh)
    - 제약: JSON 본문에 `accessToken`/`refreshToken`을 포함하지 않는다.
  - POST `/api/v1/auth/refresh`
    - req: Refresh 쿠키
    - res: `200 JSON { tokenType:'cookie', expiresIn, refreshExpiresIn }` + Access/Refresh 쿠키 회전
    - res: 401 시 Access/Refresh 쿠키를 삭제해 무한 루프를 방지한다.
  - POST `/api/v1/auth/logout`
    - req: Refresh 쿠키(선택)
    - res: 204 No Content + 인증 쿠키 만료

- App API (token contract)
  - POST `/api/v1/auth/app/login`
    - req: `{ username: string, password: string, rememberMe?: boolean }`
    - res: `200 JSON { accessToken, refreshToken, tokenType, expiresIn, refreshExpiresIn }`
    - 제약: `Set-Cookie`를 발급하지 않는다.
  - POST `/api/v1/auth/app/refresh`
    - req: `{ refreshToken: string }`
    - res: `200 JSON { accessToken, refreshToken, tokenType, expiresIn, refreshExpiresIn }`
  - POST `/api/v1/auth/app/logout`
    - req: `{ refreshToken?: string }`
    - res: 204 No Content

- 공통 보호 API
  - GET `/api/v1/auth/me`
    - req: `Authorization: Bearer <accessToken>`
    - res: 200 사용자 정보
    - res: 401 + `WWW-Authenticate: Bearer`

- 공통 응답 규칙(JSON 응답 시)
  - 성공: `{ status: true, message: "", result: {...}, requestId: "<uuid>" }`
  - 에러: `{ status: false, code: "AUTH_401_INVALID", message: "...", requestId: "<uuid>" }` + HTTP 401/403/422 등

### Data & Rules
- 샘플 사용자 스키마(예)
```
{
  "table": "T_USER",
  "fields": ["USER_NO", "USER_ID", "USER_PW", "USER_NM?", "USER_EML?", "ROLE_CD?"]
}
```

- 보안 규칙
  - Access/Refresh 쿠키: HttpOnly, Secure, SameSite=Lax (cross-domain 필요 시 `SameSite=None; Secure`)
  - rememberMe=false → Refresh 세션 쿠키, true → 장기 max-age
  - Web 계약은 JSON 본문 토큰 노출 금지
  - App 계약은 토큰 JSON 반환 + 쿠키 비의존
  - 암호: PBKDF2(기본) 또는 bcrypt 해시 비교, 에러 메시지는 모호화(계정/비번 구분 노출 금지)
  - 레이트리밋: 로그인 엔드포인트 5 req/min (IP/계정 기준), 초과 시 429 + `AUTH_429_RATE_LIMIT`
  - CSRF: Web 쿠키 권한 경로(`refresh`, `logout`)는 Origin/Referer allowlist를 기본 적용
  - 입력 검증: username 최소 길이/포맷, password 최소 길이(예: ≥ 8)
  - 토큰 만료: Access 짧게(`[AUTH].access_expire`), Refresh 길게(`[AUTH].refresh_expire`)
  - JWT 클레임: `sub`, `exp`, `iat`, `jti`

- 리프레시 회전
  - refresh 성공 시 새 refresh 발급, 이전 토큰은 블랙리스트 처리
  - grace: 회전 직후 짧은 시간(기본 10초) 직전 refresh 재사용 허용 후 동일 결과 반환
  - 저장소: 기본 DB(`T_TOKEN`) + DB 장애 시 제한적 메모리 폴백

### NFR & A11y
- 성능: 로그인 API P95 < 400ms
- 보안: OWASP Top 10 준수, 시크릿 ENV 주입, 회전/블랙리스트 권장
- CORS(dev): origin=`http://localhost:3000` + credentials=true(Web 쿠키 전달용)

### Acceptance Criteria
- AC-1: Web 로그인 성공 시 Access/Refresh 쿠키가 설정되고 JSON 본문에 토큰 문자열이 없다.
- AC-2: App 로그인 성공 시 토큰 JSON이 반환되고 `Set-Cookie`는 발급되지 않는다.
- AC-3: Web `/api/v1/auth/refresh`는 쿠키를 회전 재발급하며 JSON 본문 토큰을 노출하지 않는다.
- AC-4: App `/api/v1/auth/app/refresh`는 refreshToken으로 토큰 페어를 재발급한다(실패 시 401).
- AC-5: 401/403/422 오류는 `{status:false, code, requestId}` + 적절한 `WWW-Authenticate` 헤더를 반환한다.
- AC-6: Web/App 로그아웃 후 refresh 재사용이 차단된다.
- AC-7: 보호 라우트는 Bearer 헤더만 신뢰하고 만료 토큰에 401을 반환한다.

### Tasks
- T1: Web 계약(`/api/v1/auth/login|refresh|logout`)을 쿠키 중심 + JSON 토큰 비노출로 정렬
- T2: App 계약(`/api/v1/auth/app/login|refresh|logout`) 추가 및 토큰 JSON 계약 구현
- T3: 공용 `AuthService`에서 전송 전략 분기(코어 로직 중복 금지)
- T4: Web 쿠키 권한 경로 Origin/Referer allowlist 적용
- T5: OpenAPI(Web/App 계약 분리) 문서화 및 예제 정렬 (links: CU-BE-005)
- T6: 레이트리밋/감사로그(성공/실패/로그아웃/refresh) 정렬
- T7: 테스트: Web/App 계약 분리 + 회전/grace/재사용 차단 시나리오 추가
