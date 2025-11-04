/**
 * ?뚯씪紐? openapi.js
 * ?묒꽦?? LSH
 * 紐⑹쟻: OpenAPI JS ?대씪?댁뼵???ㅼ펷?덊넠 (openapi-client-axios)
 */
import createClient from 'openapi-client-axios'\nimport { getBackendHost } from '@/app/common/config/getBackendHost'

// API base is resolved from config.ini (SharedStore)
// NEXT_PUBLIC_API_BASE is deprecated
let __clientCache = { base: null, promise: null }



export function getOpenApiClient() {
  const base = getBackendHost();
  if (!__clientCache.promise || __clientCache.base !== base) {
    const api = createClient({
      definition: ${base}/openapi.json,
      axiosConfigDefaults: {
        baseURL: base,
        withCredentials: true,
      },
    });
    __clientCache = { base, promise: api.init().then((c) => c) };
  }
  return __clientCache.promise;
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
  } catch (_) { }
  const r = await fetch(getBackendHost() + '/api/v1/auth/session', { credentials: 'include', headers: { 'Cache-Control': 'no-store' } })
  return r.json()
}

export async function postWithCsrf(path, body) {
  // Keep compatibility with csr.postWithCsrf
  const r = await fetch(getBackendHost() + '/api/v1/auth/csrf', { credentials: 'include' })
  const j = await r.json().catch(() => ({}))
  const csrf = j?.result?.csrf
  return fetch(getBackendHost() + path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
    body: JSON.stringify(body || {}),
  })
}

export default { getOpenApiClient, getSession, postWithCsrf }



