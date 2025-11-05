/**
 * 파일명: openapi.js
 * 작성자: LSH
 * 설명: OpenAPI JS 클라이언트 래퍼 (openapi-client-axios)
 */
import OpenAPIClientAxios from 'openapi-client-axios'

const BFF_PREFIX = '/api/bff'

// API base는 런타임 구분 후 캐싱한다.
let __clientCache = { base: null, client: null }

async function resolveBase() {
  if (typeof window === 'undefined') {
    const mod = await import('@/app/common/config/getBackendHost.server')
    const backend = mod.getBackendHost()
    return {
      definition: `${backend}/openapi.json`,
      baseURL: backend,
      isServer: true,
    }
  }
  return {
    definition: `${BFF_PREFIX}/openapi.json`,
    baseURL: BFF_PREFIX,
    isServer: false,
  }
}

export async function getOpenApiClient() {
  const { definition, baseURL } = await resolveBase()
  if (!__clientCache.client || __clientCache.base !== baseURL) {
    const api = new OpenAPIClientAxios({
      definition,
      axiosConfigDefaults: {
        baseURL,
        withCredentials: true,
      },
    })
    const client = await api.init()
    try {
      client.interceptors.response.use(
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
    __clientCache = { base: baseURL, client }
  }
  return __clientCache.client
}

// Lightweight helpers for common endpoints (fallback to fetch if schema unavailable)
export async function getSession() {
  try {
    const api = await getOpenApiClient()
    if (api?.client?.get) {
      const res = await api.client.get('/api/v1/auth/session', { headers: { 'Cache-Control': 'no-store' } })
      return res.data
    }
  } catch (_) { /* ignore and fallback */ }
  const { baseURL, isServer } = await resolveBase()
  const sessionUrl = isServer
    ? `${baseURL}/api/v1/auth/session`
    : `${BFF_PREFIX}/api/v1/auth/session`
  const r = await fetch(sessionUrl, { credentials: 'include', headers: { 'Cache-Control': 'no-store' } })
  return r.json()
}

export async function postWithCsrf(path, body) {
  const { baseURL, isServer } = await resolveBase()
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

const openApiHelpers = { getOpenApiClient, getSession, postWithCsrf }

export default openApiHelpers
