# Web (Next.js)

## Purpose
- Provide a Next.js (App Router) template for both protected and public flows.
- Allow per-page SSR/CSR mode selection via a simple `MODE = 'SSR' | 'CSR'` convention.

## Tech Stack
- Node 22.19.0
- Next.js 15+ (App Router)
- React 19
- Tailwind CSS v4
- State/data: SWR, Zustand
- Docs/tests: Storybook 8+, Playwright/Vitest (planned)
- Language: JavaScript only (TypeScript banned)

## Included Units
- CU-WEB-001 Auth & Login Page
- CU-WEB-002 Dashboard (Cards/List/Stats Dummy)
- CU-WEB-003 UI Component Pack (EasyObj/EasyList binding)
- CU-WEB-004 Routing & Guard (Protected Routes)
- CU-WEB-005 API Client (OpenAPI JS integration)
- CU-WEB-006 Page-level SSR/CSR Mode Convention
- CU-WEB-007 Migration (Vite → Next)
- CU-WEB-008 Middleware Guard & Redirect
- CU-WEB-009 Data Fetch Strategy (Page MODE)

## Unit Progress
- CU-WEB-001: in-progress — login page SSR/CSR split works, needs UX/A11y polish
- CU-WEB-002: planned — dashboard widgets to be defined
- CU-WEB-003: in-progress — core components exist, proxy binding retrofit + tests pending
- CU-WEB-004: in-progress — middleware/server guards partially implemented, parameter/401 handling needs polish
- CU-WEB-005: in-progress — CSRF hooks exist, OpenAPI client typing still missing
- CU-WEB-006: in-progress — per-page MODE convention drafted, env wiring TBD
- CU-WEB-007: completed — Vite → Next migration landed in `frontend-web`
- CU-WEB-008: in-progress — `middleware.js` cookie redirect rules present, needs coverage for edge routes
- CU-WEB-009: in-progress — `initData` + runtime fetch helpers drafted, AC requires reinforcement

## TODO
- Finalize per-page MODE guide (`page.jsx` snippet, developer playbook)
- Ensure protected pages default to SSR with `revalidate=0`, `dynamic='force-dynamic'`, `runtime='nodejs'`, `fetchCache='only-no-store'`
- Introduce OpenAPI-powered client helper with shared error handling; enforce `credentials: 'include'` + CSRF header injection
- Stand up Storybook with Next/Tailwind presets and CU-WEB-003 scenarios
- Add Playwright/Vitest coverage for auth redirects, 204 login flow, and session restore
- Retrofit EasyObj/EasyList proxies to support JSON-like direct assignment, dotted keys, and ctx notifications per CU-WEB-003

## Decisions (Fixed)
- Global mode flag (`NEXT_RUNTIME_MODE`) deprecated; per-page `MODE` is authoritative
- Protected pages default config: `revalidate=0`, `dynamic='force-dynamic'`, `runtime='nodejs'`, `fetchCache='only-no-store'`
- Middleware route policy: public (/login, /_next/*, /public/*, /healthz), protected (/, /dashboard/*), API bypass (/api/**)
- CORS/headers: `credentials: 'include'`, headers `X-CSRF-Token`, `Content-Type`, `Authorization`
- JS only enforcement: lint/project rules reject .ts/.tsx

## Acceptance Criteria (Template Complete)
- Auth flow validated locally (login → protected page)
- Unauthorized access to protected routes redirects to /login instantly (server and client)
- API schema generated from OpenAPI; shared client handles 401/403/422
- Mutating requests without CSRF token yield 403 with UX feedback
- SSR/CSR modes respect per-page `MODE` and surface SEO metadata for SSR pages
- Common rules (`docs/common-rules.md`) Definition of Done satisfied

## API Client Contract (Draft)
- Base URL: `NEXT_PUBLIC_API_BASE`
- Cookies: `credentials: 'include'`
- Error schema: `{ status: false, code, requestId }` with Toast/Alert integration (CU-WEB-007)
- Library: openapi-client-axios (JS only)

## Runtime Strategy (Draft)
- Goal: choose SSR/CSR per page with predictable performance
- Contract layering:
  - Per-page contract: `initData.jsx` describes data shape & guards
  - Runtime helpers: `app/lib/runtime/Ssr.jsx` (server, cookies/headers, `no-store`), `app/lib/runtime/Csr.jsx` (client, SWR-friendly)
