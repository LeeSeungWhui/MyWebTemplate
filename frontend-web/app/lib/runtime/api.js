import { parseJsonPayload, normalizeNestedJsonFields } from '@/app/lib/runtime/jsonPayload'

/**
 * 파일명: api.js
 * 작성자: Codex
 * 갱신일: 2025-11-05
 * 설명: SSR/CSR 공통 API 호출 유틸 (isomorphic)
 */

const BFF_PREFIX = '/api/bff'
const EMPTY_BODY_STATUS = new Set([204, 205, 304])
const REFRESH_PATH = '/api/v1/auth/refresh'
const LOGIN_PATH = '/login'

function isServer() {
  return typeof window === 'undefined'
}

function isAbsoluteUrl(input) {
  return typeof input === 'string' && /^https?:\/\//i.test(input)
}

function toBffPath(path) {
  const p = String(path || '')
  if (p.startsWith(BFF_PREFIX)) return p
  return `${BFF_PREFIX}${p.startsWith('/') ? p : `/${p}`}`
}

function isBodyLike(v) {
  return (
    typeof v === 'string' ||
    (typeof FormData !== 'undefined' && v instanceof FormData) ||
    (typeof Blob !== 'undefined' && v instanceof Blob) ||
    (typeof ArrayBuffer !== 'undefined' && v instanceof ArrayBuffer)
  )
}

function serializeBody(input) {
  if (input == null) return undefined
  if (isBodyLike(input)) return input
  // EasyObj/EasyList proxies expose toJSON; JSON.stringify will respect it.
  // Also supports plain objects/arrays directly.
  try {
    return typeof input === 'string' ? input : JSON.stringify(input)
  } catch {
    // Fallback: attempt structured clone via toJSON where possible
    try {
      // This will call toJSON on proxies and drop unsupported values
      return JSON.stringify(JSON.parse(JSON.stringify(input)))
    } catch {
      return JSON.stringify({})
    }
  }
}

function normalizeArgs(path, a2, a3) {
  // Supports overloading:
  // - api*(path)
  // - api*(path, init)
  // - api*(path, body)
  // - api*(path, body, 'authless')
  // - api*(path, body, { authless: boolean })
  // - api*(path, initLike, 'authless' | options)
  const isInitLike = (v) => {
    if (!v || typeof v !== 'object') return false
    if (isBodyLike(v)) return false
    const keys = Object.keys(v)
    return (
      'method' in v || 'headers' in v || 'body' in v ||
      'csrf' in v || 'auth' in v || 'authless' in v || keys.length === 0
    )
  }

  let init = {}
  const applyMode = (m) => {
    if (!m) return
  }

  if (typeof a2 === 'string') applyMode(a2)
  else if (isInitLike(a2)) init = { ...a2 }
  else if (typeof a2 !== 'undefined') {
    init = { method: 'POST', body: a2 }
  }

  if (typeof a3 === 'string') applyMode(a3)
  else if (a3 && typeof a3 === 'object') {
    const { authless, ...rest } = a3
    if (Object.keys(rest).length) init = { ...init, ...rest }
  }

  return { path, init }
}

/**
 * 응답 본문을 안전하게 텍스트로 변환
 * @param {Response} response fetch Response 객체
 * @returns {Promise<string>} 본문 텍스트
 */
async function readResponseText(response) {
  if (!response || typeof response.text !== 'function') return ''
  if (EMPTY_BODY_STATUS.has(response.status)) return ''
  try {
    return await response.text()
  } catch {
    return ''
  }
}

/**
 * 백엔드 JSON 문자열을 보정/정규화
 * @param {Response} response fetch Response
 * @returns {Promise<object|null>} 파싱 결과
 */
async function parseJsonResponseBody(response) {
  const rawText = await readResponseText(response)
  if (!rawText) return null
  const parsed = parseJsonPayload(rawText, { context: 'apiJSON' })
  if (!parsed) {
    const syntaxError = new SyntaxError('Invalid JSON response')
    syntaxError.cause = rawText
    throw syntaxError
  }
  return normalizeNestedJsonFields(parsed)
}

export async function apiRequest(path, initOrBody = {}, modeOrOptions) {
  const { init, csrfMode } = normalizeArgs(path, initOrBody, modeOrOptions)
  const method = (init.method || 'GET').toUpperCase()
  const headersIn = init.headers || {}
  const absoluteUrl = isAbsoluteUrl(path)
  const resolveFrontendOrigin = () => {
    const envOrigin =
      process.env.APP_FRONTEND_ORIGIN ||
      process.env.FRONTEND_ORIGIN ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_URL
    if (envOrigin) {
      return envOrigin.startsWith('http') ? envOrigin : `https://${envOrigin}`
    }
    const port = process.env.PORT || 3000
    return `http://127.0.0.1:${port}`
  }

  if (isServer()) {
    const { buildSSRHeaders } = await import('@/app/lib/runtime/ssr')
    const baseHeaders = (
      method === 'GET' || method === 'HEAD'
        ? { ...headersIn }
        : { 'Content-Type': 'application/json', ...headersIn }
    )
    const headers = await buildSSRHeaders(baseHeaders)
    const body = serializeBody(init.body)
    const requestInit = {
      method,
      credentials: 'include',
      headers,
      cache: 'no-store',
    }
    if (method !== 'GET' && method !== 'HEAD' && typeof body !== 'undefined') {
      requestInit.body = body
    }
    const targetUrl = absoluteUrl ? path : new URL(toBffPath(path), resolveFrontendOrigin())
    const doFetch = () => fetch(targetUrl, requestInit)
    let res = await doFetch()
	    if (res.status !== 401 || absoluteUrl) return res
	    try {
	      const refreshHeaders = await buildSSRHeaders({ 'Content-Type': 'application/json' })
	      const refreshUrl = new URL(toBffPath(REFRESH_PATH), resolveFrontendOrigin())
	      const refreshRes = await fetch(refreshUrl, {
	        method: 'POST',
	        credentials: 'include',
	        headers: refreshHeaders,
	        cache: 'no-store',
	      })
      if (refreshRes.ok) {
        res = await doFetch()
      }
    } catch (_) {
      // refresh 실패 시 그대로 반환
    }
    return res
  }

  // Client: delegate to CSR helpers with refresh-once logic
  const targetUrl = absoluteUrl ? path : toBffPath(path)
  const headers = method === 'GET' || method === 'HEAD'
    ? { 'Accept-Language': navigator.language || 'en', ...headersIn }
    : { 'Content-Type': 'application/json', ...headersIn }

  const doFetch = async () => {
    const reqInit = {
      method,
      credentials: 'include',
      headers,
    }
    if (method !== 'GET' && method !== 'HEAD') {
      reqInit.body = serializeBody(init.body) ?? '{}'
    }
    return fetch(targetUrl, reqInit)
  }

  const res = await doFetch()
  if (res.status !== 401) return res

  // attempt single refresh then retry
  try {
    const refreshRes = await fetch(toBffPath(REFRESH_PATH), {
      method: 'POST',
      credentials: 'include',
    })
    if (!refreshRes.ok) throw new Error('refresh failed')
    // refresh may set new cookies; retry original request
    const retry = await doFetch()
    if (retry.status !== 401) return retry
  } catch (_) {
    // ignore, fallback to redirect
  }

  const { pathname, search } = window.location
  if (!pathname.startsWith(LOGIN_PATH)) {
    window.location.assign(`${LOGIN_PATH}?next=${encodeURIComponent(pathname + (search || ''))}`)
  }
  throw new Error('UNAUTHORIZED')
}

export const apiJSON = async (path, initOrBody = {}, modeOrOptions) => {
  const res = await apiRequest(path, initOrBody, modeOrOptions)
  return parseJsonResponseBody(res)
}

export const apiGet = (path, init = {}) => apiJSON(path, { ...init, method: 'GET' })
export const apiPost = (path, body, init = {}) => apiJSON(path, { ...init, method: 'POST', body })
export const apiPut = (path, body, init = {}) => apiJSON(path, { ...init, method: 'PUT', body })
export const apiPatch = (path, body, init = {}) => apiJSON(path, { ...init, method: 'PATCH', body })
export const apiDelete = (path, body, init = {}) => apiJSON(path, { ...init, method: 'DELETE', body })
