Server Environments (Dev/Stage/Prod)
목적

로컬/스테이징/프로덕션 환경별 규칙을 한 장에 고정해 배포·운영 삽질을 없앤다.

Nginx는 배포 전용. 로컬은 직결(Next↔FastAPI) 원칙.

범위

네트워크 토폴로지, ENV 키 매트릭스, CORS/쿠키 정책, 배포/롤백 절차, 헬스체크·로그·백업 기준.

환경 정의
1) Local (개발)

Topology:
Browser → Next(dev:3000) ↔(credentials) FastAPI(8000)
Expo(App) → FastAPI(8000)

CORS: http://localhost:3000만 허용 + allow_credentials=true

쿠키: HttpOnly; SameSite=Lax; Secure(불필요)

API Base:

Web: NEXT_PUBLIC_API_BASE = http://localhost:8000/api/v1

App: EXPO_PUBLIC_API_BASE = http://<LAN-IP>:8000/api/v1

Nginx: 사용 안 함

2) Staging (검증)

Topology:
Browser/Expo → Nginx → (path) FastAPI / (static) Next

목적: 릴리스 후보 검증, 실제 도메인/HTTPS, 쿠키 Secure 강제

배포: 작은 사용자(나 혼자) 대상 점검, EAS Update 채널 staging

3) Production

Topology:
Client → Nginx(HTTPS, 압축/캐시/리라이트) → FastAPI(/api) & Next(SSR/static)

쿠키: HttpOnly; Secure; SameSite=Lax(서브도메인 교차 필요 시 None)

헬스: GET /healthz(liveness), GET /readyz(DB/의존성)

EAS Update 채널 production (silent → 다음 콜드스타트 적용)

ENV 키 매트릭스 (핵심만)
구분	키	Local	Staging	Prod
Web	NEXT_PUBLIC_API_BASE	http://localhost:8000/api/v1	https://stage.example.com/api/v1	https://api.example.com/api/v1
App	EXPO_PUBLIC_API_BASE	http://<LAN-IP>:8000/api/v1	https://stage.example.com/api/v1	https://api.example.com/api/v1
BE	AUTH.secret_key	dev 키	stage 키	prod 키(회전 계획)
BE	AUTH.token_expire	3600	3600	3600
BE	CORS.allow_origins	http://localhost:3000	https://stage.example.com	https://web.example.com
BE	CORS.allow_credentials	true	true	true
BE	DATABASE.dsn	sqlite	postgres(stage)	postgres(prod)
App	EXPO_PUBLIC_FEATURE_*	자유	제한	보수적
App	EXPO_PUBLIC_MIN_APP_VERSION	옵션	운영 게이트 테스트	강제 업데이트 게이트

원칙: JS Only, 타입은 OpenAPI 응답 정규화로 방어.

쿠키/CORS 정책

Local(Web 쿠키): origin=http://localhost:3000, credentials=true, SameSite=Lax, Secure=off

Stage/Prod(Web 쿠키): 정확한 allowlist, credentials=true, SameSite=Lax(교차 필요하면 None; Secure)

App(Bearer): CORS 영향 적음. 토큰은 SecureStore, 401 시 즉시 로그아웃/가드 전환.

배포/롤백 (Solo 기준)
Web/BE

브랜치: main 단일, 태그 vX.Y.Z

CI 최소선: lint → pytest(로그인/헬스/트랜잭션) → openapi-validate → web 빌드 스모크

배포:

Staging: FastAPI 재시작, Next 빌드 교체 → 스모크 → OK면 Prod

Prod 롤백: 바로 이전 태그로 되돌림(서버 재시작/정적 교체)

App(Expo)

OTA(EAS Update): staging→검증→production 퍼센트 롤아웃

강제 업데이트: 서버 EXPO_PUBLIC_MIN_APP_VERSION 상향 → 진입 차단 UX(게이트 화면)

헬스/모니터링/로그

헬스:

/healthz: 50ms 내 응답, 인증 불필요

/readyz: DB ping 포함(운영 의존성 체크)

로그(구조적 JSON):
ts, level, requestId, method, path, status, latency_ms, code?

보존: 로컬 자유 / 스테이징 7일 / 프로덕션 14~30일(파일 로테이션)

보안/시크릿

시크릿: .env는 로컬에서만, 스테이징/프로덕션은 환경변수/CI 주입

JWT: HS256, 키 회전 계획(간단히 날짜 suffix로 운영)

레이트리밋: 로그인 5 req/min(IP+계정), 초과 시 429 + Retry-After

백업/마이그레이션

DB: dev=sqlite, stage/prod=PostgreSQL

백업: prod 일 1회 스냅샷(보유 7일), 롤백 테스트 월 1회

마이그레이션: Alembic는 옵션(초기엔 seed만). 스키마 드리프트 생기면 승격.

장애·DR(Disaster Recovery) 최소 가이드

장애 발생: 최근 태그로 즉시 롤백 → /readyz 확인 → 원인 로그 역추적(requestId)

앱 OTA 사고: production 채널 롤백 릴리스 즉시 배포, 강제 업데이트 게이트로 차단

수용 기준(이 문서의 DoD)

로컬/스테이징/프로덕션 각각에서 로그인→대시보드 시나리오가 환경 변수만 바꿔서 통과

/healthz·/readyz 응답과 CORS/쿠키 정책이 표와 일치

릴리스/롤백 절차를 나 혼자 10분 내 재현 가능