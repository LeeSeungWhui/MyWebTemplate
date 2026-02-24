# Frontend Web Planning

웹(Next.js) 기획안 진입점이다.
실제 스펙 원문은 아래 문서를 기준으로 유지한다.

## Core Docs
- 모듈 스펙: `docs/frontend-web/modules/web.md`
- 페이지 디자인 스펙: `docs/frontend-web/page-design-spec.md`
- 웹 코딩 규칙: `docs/frontend-web/codding-rules-frontend.md`

## Unit Specs
- 경로: `docs/frontend-web/units/CU-WEB-*.md`
- 범위: 인증/가드/API/공개 퍼널/샘플 페이지/포트폴리오

## 운영 원칙
- 고객 공개 동선은 `/`, `/sample/*`, `/component` 기준으로 유지한다.
- 템플릿 인증 경로(`/login`, `/signup`, `/forgot-password`, `/dashboard*`)는 공개 메뉴 비노출 정책을 유지한다.
