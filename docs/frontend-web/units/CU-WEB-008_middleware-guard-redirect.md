---
id: CU-WEB-008
name: Middleware Guard & Redirect
module: web
status: implemented
priority: P1
links: [CU-WEB-001, CU-WEB-004, CU-WEB-005, CU-WEB-006, CU-WEB-002, CU-BE-001]
---

### Purpose
- 미들웨어 단계에서 보호 경로 접근을 선제 차단하고, 로그인 상태에 따라 무깜빡임 307 리다이렉트를 보장한다(Next 기본).
- 서버/클라이언트 가드와 중복되지 않도록 책임을 분담한다.

### Scope
- 포함
  - 공개/보호 경로 패턴 매핑 및 우선순위 규칙
  - 쿠키 `refresh_token` 존재 여부 기반 1차 판정(유효성은 서버 가드가 최종 처리)
  - `next` 파라미터 경로 검증 및 안전한 리다이렉트
  - 정적/문서/프리페치/이미지 자산 bypass 목록
- 제외
  - RBAC/세부 권한, 세션 유효성 원격 조회(미들웨어에서 금지)

### Interface
- 파일: `frontend-web/middleware.js`
- 공개 경로: `frontend-web/app/common/config/publicRoutes.js`에서만 관리(Allowlist)
- 보호 경로: Allowlist 외 전부(Default Protect). 정적/내부/파비콘/파일확장자는 제외
- 리다이렉트 정책
  - 미인증 → 보호 경로: 즉시 `/login` 307 + httpOnly 쿠키 `nx`에 원경로 저장(5분)
  - 인증(= `refresh_token` 존재) + `access_token` 없음/만료 + 보호 경로: `/api/session/bootstrap` 307 + `nx`에 원경로 저장 → access 재발급 후 원래 경로로 복귀
  - 인증 → `/login`
    - `access_token` 유효: `/dashboard` 307 + 잔여 `nx` 삭제
    - `access_token` 없음/만료 + `refresh_token` 존재: `/api/session/bootstrap`으로 보내 access 재발급 후 `nx`(없으면 `/dashboard`)로 이동
  - 로그인 URL에 `?next`/`?reason`이 붙어오면 sanitize 후 `nx`/`auth_reason` 쿠키로 변환하고 깨끗한 `/login`으로 정리

### Data & Rules
- 판정 근거: HttpOnly `refresh_token` 존재 여부를 1차 사용(서명/유효성 검증은 서버 가드 담당, CU-WEB-004 / CU-BE-001)
  - 예외(UX): `access_token`의 `exp`만 파싱해 만료 여부를 대략 판정하고, 만료/없음이면 `/api/session/bootstrap`으로 선회해 SSR 401을 줄인다(서명 검증은 하지 않음).
- 캐시/프리페치
  - 프리페치/프리로드 요청 헤더(예: `purpose=prefetch`)는 리다이렉트하지 않음
- Bypass
  - `/api/**`는 미들웨어에서 판정하지 않음(백엔드에서 인증/권한 처리)
  - 정적·문서 자산, 이미지 최적화 라우트, favicon 등은 그대로 통과
- 보안
  - 오픈 리다이렉트 방지: `next`에 `://` 또는 도메인이 포함되면 무시하고 `/dashboard`로 대체
  - 쿠키 속성/경로는 백엔드 정책 준수(refresh_token 기준, CU-BE-001)

### NFR & A11y
- 성능: 미들웨어 판정 추가 지연 P95 < 10ms
- 안정성: 새로고침/뒤로가기도 가드 결과가 일관되게 반영(깜빡임 0)
- 접근성: 로그인 후 리다이렉트 시 포커스 이동/알림 UX는 페이지 레벨에서 보조 문서화

### Acceptance Criteria
- AC-1: 미인증 사용자가 보호 경로 접근 시 미들웨어에서 `/login`으로 즉시 307, `nx` 쿠키에 복귀 경로가 저장된다.
- AC-2: `refresh_token`이 있는 사용자가 `/login` 접근 시 access 재발급 후 `nx`(없으면 `/dashboard`)로 이동한다. (`access_token` 유효면 즉시, 없/만료면 `/api/session/bootstrap` 경유)
- AC-2b: `refresh_token`이 있고 `access_token`이 없거나 만료된 사용자가 보호 경로 접근 시 `/api/session/bootstrap` 경유로 자동 복구한다.
- AC-3: `/login?next=...`로 접근 시 `next`는 sanitize되어 `nx`로 변환되고, 주소창은 `/login`으로 정리된다.
- AC-3b: `/login?...&reason=...`로 접근 시 `reason`은 `auth_reason`(httpOnly, short TTL)로 변환되고, 로그인 화면에서 토스트로 1회 노출된다.
- AC-4: `/api/**`, 정적 자산, `/_next/*` 요청은 미들웨어가 변경하지 않는다.
- AC-5: 프리페치 요청은 리다이렉트하지 않고 통과(내비 UX 영향 없음).
- AC-6: 보호 페이지가 ISR/CSR로 전환되어도 가드 체인이 동일하게 동작(CU-WEB-006 정합).

### Tasks
- T1 경로 매핑 정의: 공개/보호/바이패스 패턴 구성(우선순위 포함)
- T2 판정 로직: `refresh_token` 존재 여부 1차 판정, 서버 가드에 최종 검증 위임 규칙 명시
- T3 `next` 검증기: 경로만 허용, 무효는 `/` 처리 규칙
- T4 바이패스 처리: `/api/**`, 정적/문서 자산, 프리페치/프리로드 헤더 우회 로직
- T5 런타임 주의: 기본 nodejs 런타임 페이지와 함께 동작. 미들웨어 제약(파일 I/O 금지) 문서화
- T6 통합 테스트: 비인증→보호→/login 307, 인증→/login→/dashboard 307, `next` 유효/무효, API/정적 bypass, 프리페치 미리다이렉트
- T7 문서 & 릴리즈 노트: 가드 체인(미들웨어→서버→클라)의 책임과 한계 명시

### Notes
- 기술: JavaScript Only, Next 15(App Router)
- 체인 정합: 미들웨어는 존재 판정만, 서버 가드는 검증/리다이렉트, 클라는 만료 대응
- 백엔드 연동: `/api/v1/auth/*` 표준 응답/쿠키 정책(CU-BE-001)과 1:1 정합
- 문서 정합: index.md / web.md / backend.md의 경로·쿠키·인증 규약과 일치

### Implementation Notes
- `frontend-web/middleware.js`는 보호 경로에서 `refresh_token` 쿠키를 검사해 없으면 `/login`으로 307 리다이렉트한다.
- 공개/보호 경로 패턴과 `next` 검증 로직은 향후 확장이 필요하다.
