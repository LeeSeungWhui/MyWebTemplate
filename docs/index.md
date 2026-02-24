# 프로젝트 개요 (index.md)

## Vision

- 단일 코드베이스(Web/Mobile/Backend)로 빠르고 안정적인 개발·배포를 지향한다.
- 데이터/상태 추상화(EasyObj / EasyList)로 재사용 중심 UI 조립을 표준화한다.

## 목표 지표 (North Star)

- 신규 화면 TTV < 10분(기획 → API 바인딩 → 배포)
- 배포 안정성: 실패율 < 0.2%, 롤백 < 5분
- 성능: LCP < 2.5s, API P95 < 400ms
- 재사용성: 신규 화면 컴포넌트 재사용 ≥ 60%

## 템플릿 범위(완성 기준)

- 프론트(Web)
  - Next.js(App Router) 기반 스캐폴드 `frontend-web`
  - UI 컴포넌트 셋(EasyObj/EasyList 바인딩 규약 준수)
  - 공개 퍼널: 랜딩(`/`) → 데모 허브(`/demo`) → 데모 페이지(`/demo/dashboard|crud|form|admin`) → 컴포넌트(`/component`) → 포트폴리오(`/demo/portfolio`)
  - 템플릿 인증 경로(비노출): `/login`, `/signup`, `/forgot-password`, `/dashboard*`
  - 로그인 화면(+유효성) → 템플릿 대시보드(카드/리스트/차트 더미) 구현
  - 보호 라우팅, 로그인 상태 유지, 백엔드 로그인 API 연동
- 프론트(App)
  - Expo 기반 스캐폴드, 공통 UI 컴포넌트, 네비게이션 스택
  - 로그인 화면 → 메인 대시보드(모바일 레이아웃) 구현, 백엔드 로그인 연동
- 백엔드
  - DB 커넥션 유틸(SQLAlchemy+databases), 쿼리 로더, 트랜잭션 데코레이터
  - 로그인 API(샘플 사용자/해시), 표준 응답, 로깅, `/healthz`
- 공통
  - 로컬 실행 스크립트(env.sh/run.sh), 로컬 lint/test/build, OpenAPI 스키마 제공

## 제외(차기)
- 관리자 콘솔/권한관리 고도화, 결제/푸시, 멀티테넌시, 고급 CDN/캐시 전략

## 사용자 여정(템플릿 기준)

- 고객(숨고/크몽): URL 진입(`/`) → 데모 허브(`/demo`) → 데모 체험(`/demo/dashboard`, `/demo/crud`) → 컴포넌트 확인(`/component`) → 포트폴리오(`/demo/portfolio`)
- 개발자: `source ./env.sh` → backend/frontend-web 실행 → 샘플 로그인 → 대시보드 확인 → 화면/API 추가 개발
- 기획/디자이너: UI 가이드 기반 컴포넌트 선정 → 화면 검수(템플릿 Docs)
- 운영: 헬스체크/로그/모니터링으로 품질 확인 및 롤백

## 아키텍처 개요

- Web: Next.js 15+ App Router, RSC, SSR/CSR 전략(선택적 SWR)
- App: React Native(Expo), OTA(EAS Update), 네이티브 최소화
- Backend: FastAPI(Uvicorn), SQLAlchemy, OpenAPI 스키마(문서)
- 공통 데이터/상태: EasyObj/EasyList + 바인딩 규약(value/onChange/model)
- 배포/관측성: Nginx, `/healthz`, JSON 로그, Sentry/Prometheus

```text
[Browser] ─▶ [Nginx]
              ├─ /api/**  → FastAPI
              └─ /*       → Next.js (SSR/CSR)
[RN App] ──────────(HTTPS)→ FastAPI
```

## 운영 환경(Ops) 개요
- Dev(로컬): `Browser → Next(3000) ↔ FastAPI(2000)`, `Expo → FastAPI(2000)`
- CORS: `http://localhost:3000` + credentials=true
  - Web 쿠키: HttpOnly; SameSite=Lax; Secure(미적용)
- API Base: Web=`http://localhost:2000/api/v1`, App=`http://<LAN-IP>:2000/api/v1`
- Stage: `Client → Nginx(HTTPS) → FastAPI(/api) & Next`
  - 쿠키 Secure 강제, `/healthz`/`/readyz` 헬스 포함
  - EAS Update 채널: `staging`
- Prod: `Client → Nginx(HTTPS/압축/캐시) → FastAPI & Next`
  - 쿠키: HttpOnly; Secure; SameSite=Lax(교차 필요 시 None)
  - EAS Update 채널: `production`

## Modules

- Web: `docs/frontend/modules/web.md`
- Mobile App: `docs/frontend/modules/mobile-app.md`
- Backend: `docs/backend/modules/backend.md`
- 공통 규칙: `docs/common-rules.md`
- Ops: `docs/ops/server-environments.md`

## 현재 구현 상태(요약)

- Backend: FastAPI 앱/라우터 자동 로드, 로그인(Access/Refresh 쿠키), 쿼리 로더/트랜잭션 샘플, sqlite(`backend/data/main.db`) 포함.
- Web: Next.js `frontend-web` 공개 퍼널(`/`, `/demo/*`) + 템플릿 인증 흐름(`/login`, `/signup`, `/forgot-password`) + 템플릿 대시보드(`/dashboard`, `/dashboard/tasks`, `/dashboard/settings`) 구현/정비 예정.
- App: Expo 골격/네비게이션 + 기본 컴포넌트 + Dataset 구현.

## Acceptance Criteria(템플릿 완료)
- 공개 URL(`/`)에서 랜딩 Hero/GNB/CTA가 노출되고, `/demo`, `/demo/dashboard`, `/demo/crud`, `/demo/form`, `/demo/admin`, `/component`, `/demo/portfolio`로 이동할 수 있다.
- 로컬에서 Web/App/Backend를 실행해 샘플 계정으로 로그인 후 메인 대시보드를 확인할 수 있다.
- `/login`, `/signup`, `/forgot-password`, `/dashboard*` 경로는 공개 퍼널 메뉴에 노출되지 않지만 직접 URL 접근 시 동작해야 한다.
- Web/App은 보호 라우팅이 적용되고, 로그인 상태가 새로고침/재시작 후에도 유지된다.
- Backend는 표준 응답 스키마/에러 규격으로 로그인 API를 제공하고 `/healthz`가 200을 반환한다.
- OpenAPI 스키마가 제공되며, 프런트는 통합 유틸(`apiJSON`/`apiRequest`)로 백엔드와 통신한다.
- 공통 규칙(common-rules.md)의 DoD를 충족한다.
- Ops 문서(server-environments.md) 설정만으로 dev/stage/prod에서 “로그인→대시보드” 시나리오가 재현된다.

## 로드맵(초안)

- W1~2: 스캐폴딩(Next/Expo/FastAPI) + 로그인 API 골격
- W3~4: Web/App 로그인→대시보드 구현, 보호 라우팅/상태 유지, 통합 API 유틸 정리
- W5: 문서/헬스체크/테스트 마감, 템플릿 검증 시나리오 확정, **Ops 문서(Dev/Stage/Prod) 최종화**


---

본 문서는 Compact CST 규칙에 따른 전체 개요다. 세부 규칙·전환 가이드·컴포넌트 스펙은 각 Module/Unit 문서를 참조한다.
