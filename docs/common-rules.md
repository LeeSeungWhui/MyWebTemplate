# Common Rules

- 목적: 모든 Unit/모듈에 공통 적용되는 기본 규칙. Compact CST 문서의 DoD 판정 기준으로 사용한다.

## 코딩 규칙
- 네이밍
  - 공통: 클래스/컴포넌트 PascalCase, 상수 UPPER_SNAKE_CASE
  - 변수/함수: camelCase (JavaScript/React/Python 공통)
  - API 경로: lowercase(권장: kebab-case)
- TypeScript 사용 금지(런타임 코드). 타입은 JSDoc/JSON Schema/런타임 검증으로 대체
  - 예외: 테스트/빌드/린트 설정 파일은 TS 허용
- 함수형 컴포넌트 우선(웹/앱)
- 주석은 반드시 한글로 하며 의도/제약을 중심으로 간결하게 유지
- 파일 헤더 주석 필수(파일명, 작성자, 갱신일, 설명)
- 함수 헤더 주석 필수(설명, 갱신일)

## 접근성(Accessibility)
- 목표 수준: WCAG 2.2 AA 이상
- 키보드: 모든 인터랙션은 키보드만으로 가능, focus-visible 제공
- 네이밍/역할: landmark/role/aria-label 제공, 이미지 대체텍스트 명시
- 대비: 텍스트 4.5:1 이상, 비텍스트 3:1 이상
- 스크린리더: 상태 변경(Toast/Dialog 등)은 라이브 영역 또는 적절한 aria로 알림
- 테스트: Axe/Lighthouse A11y ≥ 90, 키보드 전수 동작

## 보안(Security)
- 기준: OWASP Top 10, 최소 권한 원칙
- 인증/세션: Web은 쿠키(HttpOnly, Secure, SameSite=Lax), App은 토큰 헤더. 로그아웃/만료 필수
- CSRF/CORS: 쿠키 인증의 비멱등 API는 CSRF 방어. CORS는 환경별 allowlist(와일드카드 금지)
- 입력 검증: 화이트리스트 기반. 파일 업로드는 MIME/용량 검사 및 백엔드 재검증
- SQL 안전성: 반드시 파라미터 바인딩. 문자열 치환 금지. 쿼리 로깅 시 PII 마스킹
- 시크릿: 레포 저장 금지. ENV/배포 환경 시크릿 사용, 키 롤테이션 정책 유지
- 전송/보관: 운영 HTTPS 강제, 민감 데이터 저장 시 암호화

### 인증 가드 원칙(옵션1 단일화)
- 가드 위치: `frontend-web/middleware.js`에서만 인증 가드 수행. 서버 컴포넌트/레이아웃에서 재검사 금지
- 공개 경로: `frontend-web/app/common/config/publicRoutes.js`에서만 관리. 여기에 없으면 기본 보호(Default protect)
- 복귀(next) 처리: 비인증 접근 시 미들웨어가 httpOnly 쿠키 `nx`에 원 경로를 저장하고 `/login`으로 리다이렉트한다
- 로그인 접근: 인증 상태에서 `/login` 접근 시 `/dashboard`로 리다이렉트, 잔여 `nx`는 삭제
- 매처: `export const config.matcher = ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)']`로 페이지 중심 적용(Next 내부/정적 제외)

## 성능(Performance)
- Web: LCP < 2.5s, INP < 200ms, CLS < 0.1, Lighthouse ≥ 80
- API: P95 응답 < 400ms(핵심 엔드포인트), 타임아웃/재시도/서킷브레이커 고려
- DB: 주요 쿼리 P95 < 200ms, N+1 금지, 인덱스 설계 문서화
- 번들: 페이지별 JS(gzip) ≤ 200KB, 코드 스플리팅/지연 로딩, `next/image` 사용
- 캐싱: SSR `no-store`/`revalidate:N` 명시, API 캐시 헤더 일관 적용
- 모니터링: Web Vitals 수집, 서버/DB 지표 대시보드

## API 규칙
- HTTP 상태코드와 표준 응답 본문을 함께 사용한다
  - 본문 스키마: `{ status: boolean, message: string, result: any|null, count?: number, code?: string, requestId: string }`
  - 규칙: 목록 응답에만 `count` 포함. 에러 시 `code` 포함 + HTTP 4xx/5xx로 반환
- 에러: 사용자 메시지와 내부 코드 구분. 401 응답은 인증 방식에 맞춰 `WWW-Authenticate` 헤더 포함
- 페이징: `page`, `size`, `totalCount` 표준화. 정렬/필터 파라미터 명세화
- 버전: `/api/v1` 경로 버저닝. 중단 정책과 마이그레이션 가이드 제공

## 로깅/관측성
- 포맷: 구조적 JSON 로그(시간, 레벨, requestId, path, method, status, latency_ms, db_time_ms?, msg)
- 상관관계: `X-Request-Id` 수용/전파, 서비스 간 추적
- 개인정보: PII/시크릿 로그 금지. 필요 시 마스킹
- 헬스체크: `GET /healthz` OK 및 선택적 DB ping 결과 제공

## 국제화(i18n)
- 텍스트는 키/리소스로 관리. 날짜/숫자 서식은 로케일에 맞게 처리
- 접근성 텍스트(aria-label 등)도 번역 키로 관리

## 데이터/프라이버시
- 분류: PII/민감정보 최소 수집. 보존 기간과 파기 정책 명시
- 암호화: 전송/보관 시 암호화. 키 관리는 KMS 등 사용

## 로컬 개발
- PowerShell(윈도우): `.\env.ps1`
- Bash/리눅스: 반드시 `source ./env.sh` (또는 `. ./env.sh`)로 같은 셸에 적용하고, 명령은 그 셸에서 바로 실행
  - CLI/자동화에서는 `bash -lc "source ./env.sh && <원하는 명령>"` 형태로 한 번에 실행   

## 로컬 품질 게이트
- 기본: Lint/Format/(선택)Typecheck/Unit Test/Build를 로컬에서 통과한 뒤 머지/배포한다
- 커버리지: Unit Test ≥ 70%
- 보안/품질: 취약점/라이선스 스캔(가능 시), 빌드 아티팩트 보존

## DoD(Definition of Done)
- Lint/Format 통과, 테스트 커버리지 ≥ 70%
- 접근성 체크(Axe/Lighthouse A11y ≥ 90, 키보드 전수 OK)
- 성능 예산 충족(LCP/INP/CLS, API·DB P95 목표)
- 보안 체크리스트 통과(CORS/CSRF/시크릿/입력 검증/SQL 바인딩)
- 문서 업데이트(README, 설계/모듈/Unit, 변경 로그)
- 코드 리뷰 승인 ≥ 1, 로컬 품질 게이트 통과
