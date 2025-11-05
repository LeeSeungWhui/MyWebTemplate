/**
 * 파일명: openapi.js
 * 작성자: LSH
 * 설명: OpenAPI JS 클라이언트 래퍼 (openapi-client-axios)
 */
import OpenAPIClientAxios from 'openapi-client-axios'
import { getBackendHost } from '@/app/common/config/getBackendHost'

const BFF_PREFIX = '/api/bff'

// API base is resolved from config.ini (SharedStore)
// NEXT_PUBLIC_API_BASE is deprecated
let __clientCache = { base: null, promise: null }

function resolveBase() {
  const isServer = typeof window === 'undefined'
  if (isServer) {
    const backend = getBackendHost()
    return {
      definition: `${backend}/openapi.json`,
      baseURL: backend,
      isServer,
    }
  }
  return {
    definition: `${BFF_PREFIX}/openapi.json`,
    baseURL: BFF_PREFIX,
    isServer,
  }
}

export function getOpenApiClient() {
  const { definition, baseURL } = resolveBase()
  if (!__clientCache.promise || __clientCache.base !== baseURL) {
    const api = new OpenAPIClientAxios({
      definition,
      axiosConfigDefaults: {
        baseURL,
        withCredentials: true,
      },
    });
    __clientCache = { base: baseURL, promise: api.init().then((c) => {
      // 글로벌 401 인터셉터: 토큰 만료 시 로그인으로 이동
      try {
        c.interceptors.response.use(
          (res) => res,
          (err) => {
            const status = err?.response?.status
            if (typeof window !== 'undefined' && status === 401) {
              const { pathname, search } = window.location
              if (!pathname.startsWith('/login')) {
                const next = pathname + (search || '')
                window.location.assign(`/login?next=${encodeURIComponent(next)}`)
              }
            }
            return Promise.reject(err)
          },
        )
      } catch (_) { /* noop */ }
      return c
    }) };
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
  const { baseURL, isServer } = resolveBase()
  const sessionUrl = isServer
    ? `${baseURL}/api/v1/auth/session`
    : `${BFF_PREFIX}/api/v1/auth/session`
  const r = await fetch(sessionUrl, { credentials: 'include', headers: { 'Cache-Control': 'no-store' } })
  return r.json()
}

export async function postWithCsrf(path, body) {
  // Keep compatibility with csr.postWithCsrf
  const { baseURL, isServer } = resolveBase()
  const csrfUrl = isServer ? `${baseURL}/api/v1/auth/csrf` : `${BFF_PREFIX}/api/v1/auth/csrf`
  const r = await fetch(csrfUrl, { credentials: 'include' })
  const j = await r.json().catch(() => ({}))
  const csrf = j?.result?.csrf
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const target = isServer ? `${baseURL}${normalizedPath}` : `${BFF_PREFIX}${normalizedPath}`
  return fetch(target, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
    body: JSON.stringify(body || {}),
  })
}

export default { getOpenApiClient, getSession, postWithCsrf }
