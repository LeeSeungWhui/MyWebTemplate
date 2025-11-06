/**
 * 파일명: api.js
 * 작성자: Codex
 * 갱신일: 2025-11-05
 * 설명: SSR/CSR 공통 API 호출 유틸 (isomorphic)
 */

const BFF_PREFIX = '/api/bff'

function isServer() {
  return typeof window === 'undefined'
}

function toBffPath(path) {
  const p = String(path || '')
  if (p.startsWith(BFF_PREFIX)) return p
  return `${BFF_PREFIX}${p.startsWith('/') ? p : `/${p}`}`
}

async function resolveServerBase() {
  const mod = await import('@/app/common/config/getBackendHost.server')
  const backend = mod.getBackendHost()
  const { buildSSRHeaders } = await import('@/app/lib/runtime/ssr')
  return { backend, buildSSRHeaders }
}

async function getServerCsrf(headers) {
  const { backend, buildSSRHeaders } = await resolveServerBase()
  const h = await buildSSRHeaders(headers)
  const r = await fetch(`${backend}/api/v1/auth/csrf`, { credentials: 'include', headers: h, cache: 'no-store' })
  const j = await r.json().catch(() => ({}))
  return j?.result?.csrf
}

export async function apiJSON(path, init = {}) {
  const method = (init.method || 'GET').toUpperCase()
  const headersIn = init.headers || {}

  if (isServer()) {
    const { backend, buildSSRHeaders } = await resolveServerBase()
    const headers = await buildSSRHeaders({ 'Content-Type': 'application/json', ...headersIn })
    let body = init.body
    if (body && typeof body !== 'string') body = JSON.stringify(body)
    if (method !== 'GET' && method !== 'HEAD' && !headers['X-CSRF-Token']) {
      const csrf = await getServerCsrf(headers)
      if (csrf) headers['X-CSRF-Token'] = csrf
    }
    const res = await fetch(`${backend}${path.startsWith('/') ? path : `/${path}`}`, {
      method,
      credentials: 'include',
      headers,
      cache: 'no-store',
      body,
    })
    return res.json()
  }

  // Client: delegate to CSR helpers
  if (method === 'GET' || method === 'HEAD') {
    const h = { 'Accept-Language': navigator.language || 'en', ...headersIn }
    const res = await fetch(toBffPath(path), { credentials: 'include', headers: h })
    if (res.status === 401) {
      // redirect to login preserving next
      const { pathname, search } = window.location
      if (!pathname.startsWith('/login')) {
        window.location.assign(`/login?next=${encodeURIComponent(pathname + (search || ''))}`)
      }
      throw new Error('UNAUTHORIZED')
    }
    return res.json()
  }

  // Non-GET: obtain CSRF and POST via BFF
  const csrfRes = await fetch(toBffPath('/api/v1/auth/csrf'), { credentials: 'include' })
  const csrfJson = await csrfRes.json().catch(() => ({}))
  const csrf = csrfJson?.result?.csrf
  const res = await fetch(toBffPath(path), {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf, ...headersIn },
    body: typeof init.body === 'string' ? init.body : JSON.stringify(init.body || {}),
  })
  if (res.status === 401) {
    const { pathname, search } = window.location
    if (!pathname.startsWith('/login')) {
      window.location.assign(`/login?next=${encodeURIComponent(pathname + (search || ''))}`)
    }
  }
  return res.json()
}

export const apiGet = (path, init = {}) => apiJSON(path, { ...init, method: 'GET' })
export const apiPost = (path, body, init = {}) => apiJSON(path, { ...init, method: 'POST', body })
export const apiPut = (path, body, init = {}) => apiJSON(path, { ...init, method: 'PUT', body })
export const apiPatch = (path, body, init = {}) => apiJSON(path, { ...init, method: 'PATCH', body })
export const apiDelete = (path, body, init = {}) => apiJSON(path, { ...init, method: 'DELETE', body })

