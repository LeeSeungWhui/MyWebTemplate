/**
 * 파일명: openapi.js
 * 작성자: Codex CLI
 * 목적: OpenAPI JS 클라이언트 스켈레톤 (openapi-client-axios)
 */
import createClient from 'openapi-client-axios'

const BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

let clientPromise = null

export function getOpenApiClient() {
  if (!clientPromise) {
    const api = createClient({
      definition: `${BASE}/openapi.json`,
      axiosConfigDefaults: {
        baseURL: BASE,
        withCredentials: true,
      },
    })
    clientPromise = api.init().then((c) => c)
  }
  return clientPromise
}

// Lightweight helpers for common endpoints (fallback to fetch if schema unavailable)
export async function getSession() {
  try {
    const api = await getOpenApiClient()
    // prefer documented path if present
    if (api?.client?.get) {
      const res = await api.client.get('/api/v1/auth/session', { headers: { 'Cache-Control': 'no-store' } })
      return res.data
    }
  } catch (_) {}
  const r = await fetch(BASE + '/api/v1/auth/session', { credentials: 'include', headers: { 'Cache-Control': 'no-store' } })
  return r.json()
}

export async function postWithCsrf(path, body) {
  // Keep compatibility with csr.postWithCsrf
  const r = await fetch(BASE + '/api/v1/auth/csrf', { credentials: 'include' })
  const j = await r.json().catch(() => ({}))
  const csrf = j?.result?.csrf
  return fetch(BASE + path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
    body: JSON.stringify(body || {}),
  })
}

export default { getOpenApiClient, getSession, postWithCsrf }

