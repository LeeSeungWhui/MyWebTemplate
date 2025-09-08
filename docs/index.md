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
  - 로그인 화면(+유효성) → 메인 대시보드(카드/리스트/차트 더미) 구현
  - 보호 라우팅, 로그인 상태 유지, 백엔드 로그인 API 연동
- 프론트(App)
  - Expo 기반 스캐폴드, 공통 UI 컴포넌트, 네비게이션 스택
  - 로그인 화면 → 메인 대시보드(모바일 레이아웃) 구현, 백엔드 로그인 연동
- 백엔드
  - DB 커넥션 유틸(SQLAlchemy+databases), 쿼리 로더, 트랜잭션 데코레이터
  - 로그인 API(샘플 사용자/해시), 표준 응답, 로깅, `/healthz`
- 공통
  - Docker 로컬 실행, 기본 CI(lint/test/build), OpenAPI 스키마 제공(JS 클라이언트 연동)

## 제외(차기)
- 관리자 콘솔/권한관리 고도화, 결제/푸시, 멀티테넌시, 고급 CDN/캐시 전략

## 사용자 여정(템플릿 기준)

- 개발자: `.env` 설정 → docker compose 또는 단일 실행 → 샘플 로그인 → 대시보드 확인 → 화면/API 추가 개발
- 기획/디자이너: UI 가이드 기반 컴포넌트 선정 → 화면 검수(Storybook)
- 운영: 헬스체크/로그/모니터링으로 품질 확인 및 롤백

## 아키텍처 개요

- Web: Next.js 15+ App Router, RSC, SSR/CSR 전략, SWR
- App: React Native(Expo), OTA(EAS Update), 네이티브 최소화
- Backend: FastAPI(Uvicorn), SQLAlchemy, OpenAPI 스키마(문서/JS 클라이언트)
- 공통 데이터/상태: EasyObj/EasyList + 바인딩 규약(value/onChange/model)
- 배포/관측성: Docker, Nginx, gh-actions, `/healthz`, JSON 로그, Sentry/Prometheus

```text
[Browser] ─▶ [Nginx]
              ├─ /api/**  → FastAPI
              └─ /*       → Next.js (SSR/CSR)
[RN App] ──────────(HTTPS)→ FastAPI
```

## 운영 환경(Ops) 개요
- Dev(로컬): `Browser → Next(3000) ↔ FastAPI(8000)`, `Expo → FastAPI(8000)`
  - CORS: `http://localhost:3000` + credentials=true
  - Web 쿠키: HttpOnly; SameSite=Lax; Secure(미적용)
  - API Base: Web=`http://localhost:8000/api/v1`, App=`http://<LAN-IP>:8000/api/v1`
- Stage: `Client → Nginx(HTTPS) → FastAPI(/api) & Next`
  - 쿠키 Secure 강제, `/healthz`/`/readyz` 헬스 포함
  - EAS Update 채널: `staging`
- Prod: `Client → Nginx(HTTPS/압축/캐시) → FastAPI & Next`
  - 쿠키: HttpOnly; Secure; SameSite=Lax(교차 필요 시 None)
  - EAS Update 채널: `production`

## Modules

- Web: `docs/modules/web.md`
- Backend: `docs/modules/backend.md`
- Mobile App: `docs/modules/mobile-app.md`
- 공통 규칙: `docs/common-rules.md`
- Ops: `docs/ops/server-environments.md`

## 현재 구현 상태(요약)

- Backend: FastAPI 앱/라우터 자동 로드, 로그인·헤더·트랜잭션 샘플, sqlite(`backend/data/main.db`), 사용자 테이블 시드 스크립트(`backend/scripts/users_seed.py`).
- Web: Next.js `frontend-web` 로그인 페이지와 보호 레이아웃 구현, 레거시 `frontend-web-old` 보관.
- App: Expo 골격/네비게이션 + 기본 컴포넌트 + Dataset 구현.

## Acceptance Criteria(템플릿 완료)
- 로컬에서 Web/App/Backend를 실행해 샘플 계정으로 로그인 후 메인 대시보드를 확인할 수 있다.
- Web/App은 보호 라우팅이 적용되고, 로그인 상태가 새로고침/재시작 후에도 유지된다.
- Backend는 표준 응답 스키마/에러 규격으로 로그인 API를 제공하고 `/healthz`가 200을 반환한다.
- OpenAPI 스키마가 제공되며, 프런트는 JS OpenAPI 클라이언트(openapi-client-axios)로 호출할 수 있다.
- 공통 규칙(common-rules.md)의 DoD를 충족한다.
- Ops 문서(server-environments.md) 설정만으로 dev/stage/prod에서 “로그인→대시보드” 시나리오가 재현된다.

## 로드맵(초안)

- W1~2: 스캐폴딩(Next/Expo/FastAPI) + Docker 통합 + 로그인 API 골격
- W3~4: Web/App 로그인→대시보드 구현, 보호 라우팅/상태 유지, OpenAPI 연동(JS 클라이언트)
- W5: 문서/Storybook/헬스체크/CI 마감, 템플릿 검증 시나리오 확정, **Ops 문서(Dev/Stage/Prod) 최종화**


---

본 문서는 Compact CST 규칙에 따른 전체 개요다. 세부 규칙·전환 가이드·컴포넌트 스펙은 각 Module/Unit 문서를 참조한다.
