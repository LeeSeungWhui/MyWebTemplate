---
id: CU-WEB-004
name: Routing & Guard (Protected Routes)
module: web
status: implemented
priority: P1
links: [CU-WEB-001, CU-WEB-002, CU-WEB-005, CU-WEB-006, CU-WEB-008, CU-BE-001]
---

### Purpose
- Next(App Router)에서 보호 라우트를 안전하게 처리하고, 로그인 상태에 따라 무깜빡임 전환을 보장한다.
- SSR/ISR/CSR 전환에도 일관된 401/403 처리·리다이렉트 규칙을 제공한다.

### Scope
- 포함
  - 경로 분류: 공개(`/login`, 정적 자산) vs 보호(`/`, `/dashboard`, `/settings` 등)
  - 가드 계층(단일화):
    - 미들웨어 가드만 사용(경로 진입 즉시 판정; links: CU-WEB-008)
    - (선택) 클라 보조 가드: 세션 표시/만료 대응은 `apiJSON`으로 단발 패치하거나, 실시간/자동 재검증이 필요할 때만 `useSwr`(SWR 래퍼)
  - 리다이렉트 규칙: 미인증 보호 경로 접근 시 `/login`, 인증 상태로 `/login` 접근 시 `/dashboard`
  - `next` 파라미터: 유효 경로만 허용
- 제외
  - 세부 RBAC, 멀티테넌시 권한 매핑(차기)

### Interface
- 라우팅 정책
  - 공개: `/login`, `/404`, `/public/*`
  - 보호: `/`, `/dashboard`, `/settings`, `/app/**`
- 리다이렉트 정책
  - 미인증 → 보호 경로: 즉시 `/login`으로 리다이렉트(미들웨어, 깜빡임 없음)
  - 인증(= `refresh_token` 존재) + `access_token` 없음/만료 + 보호 경로: `/api/session/bootstrap`으로 선회 → access 재발급 → 원래 경로로 307 리다이렉트
  - 인증 → `/login`
    - `access_token` 유효: 미들웨어에서 즉시 `/dashboard`로 리다이렉트
    - `access_token` 없음/만료 + `refresh_token` 존재: `/api/session/bootstrap`에서 access 재발급 후 `nx`(없으면 `/dashboard`)로 리다이렉트
  - `next`는 유효 경로일 때만 사용, 무효는 `/dashboard` 백
- HTTP/캐시
  - 세션 확인(`/api/v1/auth/me`) 응답은 `Cache-Control: no-store`
  - 페이지 렌더 전략은 자유(SSR/ISR/CSR). 인증 판별은 미들웨어로 선제 처리
- 오류 처리
  - 401(JSON `{status:false, code, requestId}`) 수신 시 세션 무효화 후 `/login` 이동(토스트 + code/requestId)
  - 403 수신 시 권한/정책 오류로 토스트 안내(필요 시 requestId 노출)

### Data & Rules
- 세션 보호: 쿠키 `refresh_token` 존재 여부로 1차 판정(미들웨어). 클라 동기화는 `/api/v1/auth/me` 사용
- 보호 경로 자동 복구: `refresh_token`은 있고 `access_token`이 없거나 만료면 `/api/session/bootstrap`으로 선회해 access를 재발급한 뒤 원래 경로로 복귀한다.
- `/login` 자동 복구: `access_token`이 없어도 `refresh_token`이 있으면 access를 재발급한 뒤 자동 리다이렉트한다(무깜빡임)
- `credentials: 'include'`가 아닌 요청은 보호 경로에서 금지(쿠키 플로우 일관성)
- 오픈 리다이렉트 방어: `next`는 URL/프로토콜 제거 후 경로만 허용
- 상태 동기화: 로그인/로그아웃 후 세션 패치(필요 시 `useSwr` 무효화 규약)
- UX: 리다이렉트/401 처리 시 주요 포커스/알림 UX 일관 유지

### NFR & A11y
- 리다이렉트 TTI: 로컬 기준 200ms 이하(미들웨어/서버 판정으로 깜빡임 0)
- 안정성: 새로고침 후에도 보호 경로 접근 상태가 일관되게 동작
- 접근성: 로그인/오류 문구의 레이블/라이브리전 연결, 키보드 탐색 보장

### Acceptance Criteria
- AC-1: 미인증 사용자가 `/dashboard` 진입 시 미들웨어/서버 레벨에서 즉시 `/login`으로 전환(클라 깜빡임 없음).
- AC-2: `refresh_token`이 있고 `access_token`이 없거나 만료된 사용자가 보호 경로 진입 시 `/api/session/bootstrap`으로 선회해 access 재발급 후 원래 경로로 복귀한다.
- AC-3: `refresh_token`이 있는 사용자가 `/login` 접근 시 `access_token` 유무와 무관하게 access 재발급 후 `nx`(없으면 `/dashboard`)로 전환.
- AC-4: `next=/settings/profile`로 로그인 성공 시 해당 경로로 이동. 무효 `next`는 `/dashboard`로 백.
- AC-5: 보호 페이지에서 API 401 수신 시 세션 무효화 후 `/login` 이동, 토스트에 `code/requestId` 노출.
- AC-6: SSR/ISR/CSR 전환에도 동일하게 동작(리다이렉트/401 처리/세션 동기화 일관).
- AC-7: `/api/v1/auth/me` 응답이 `no-store`여서 브라우저 캐시에 남지 않는다.

### Tasks
- T1 경로 정책 정의: 공개/보호 목록 및 패턴 정의(정규/리스트)
- T2 미들웨어 가드: 보호 경로 미인증→`/login`, `/login` 인증→`/dashboard` (links: CU-WEB-008)
- T3 (삭제) 서버 가드: 보호 페이지 RSC 판정은 사용하지 않음(미들웨어 단일화)
- T4 클라 가드: 세션 동기화(만료/401 자동 핸들). 필요 시 `useSwr` 규약 적용, 메시지 매핑(`AUTH_*`, `VALID_422_*`)
- T5 `next` 파라미터 검증: 유효 경로만 허용, 기본 `/dashboard`, 문서화
- T6 캐시/전략: 보호 페이지 `no-store`/SSR 기본, ISR/CSR 전환 규칙(CU-WEB-006)
- T7 테스트: 인증/비인증 보호경로 접근, `/login` 접근, `next` 유효/무효, 401 처리 후 캐시 무효
- T8 문서/스토리: 가드 상태별 UX 및 에러 코드 매핑 가이드

### Notes
- ENV: 별도 전역 ENV 스위치 없음. API Base는 config.ini(`[API].base`)에서 로드(getBackendHost)하며, 프런트는 `/api/bff/*`를 통해 호출된다.
- 백엔드 연동: `/api/v1/auth/*` (CU-BE-001), 표준 응답 `{status,message,result,count?,code?,requestId}`
- 레이아웃/명칭 레이어: `frontend-web` 일관 유지

### Implementation Notes
- `frontend-web/middleware.js`에서 기본 보호(Default protect)를 적용한다.
  - 공개 경로는 `frontend-web/app/common/config/publicRoutes.js`에서만 관리한다.
  - 공개 경로가 아니고 `refresh_token` 쿠키가 없으면 `/login`으로 307 리다이렉트한다.
  - 리다이렉트 시 httpOnly 쿠키 `nx`에 원 경로를 5분간 저장한다(오픈 리다이렉트 방지 sanitize 적용).
  - 보호 경로에서 `refresh_token`만 있고 `access_token`이 없거나 만료면 `/api/session/bootstrap`으로 선회하고 `nx`에 원 경로를 저장한다.
  - `/login` 진입 시 `refresh_token`만 있고 `access_token`이 없으면 `/api/session/bootstrap`으로 보내 access를 재발급한 뒤 목적지로 리다이렉트한다.
  - 401으로 `/login?next=...&reason=...`가 들어오면, 미들웨어가 `reason`을 httpOnly 쿠키 `auth_reason`로 저장하고 URL은 `/login`으로 정리한다.
  - `/api/session/bootstrap`에서 refresh 실패 시 응답 본문의 `code/requestId`를 `auth_reason` 쿠키로 전달할 수 있다.
- 서버 컴포넌트/레이아웃에서 인증 재검사는 하지 않는다. 미들웨어 통과를 전제한다.
