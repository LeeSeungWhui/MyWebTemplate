import { parseJsonPayload, normalizeNestedJsonFields } from '@/app/lib/runtime/jsonPayload'
import {
  AUTH_REASON_MAXLEN,
  AUTH_REASON_QUERY_PARAM,
  NEXT_QUERY_PARAM,
  base64UrlEncodeUtf8,
  extractUnauthorizedReason,
} from '@/app/lib/runtime/authRedirect'

/**
 * 파일명: api.js
 * 작성자: Codex
 * 갱신일: 2026-01-18
 * 설명: SSR/CSR 공통 API 호출 유틸 (isomorphic)
 */

const BFF_PREFIX = '/api/bff'
const EMPTY_BODY_STATUS = new Set([204, 205, 304])
const LOGIN_PATH = '/login'

function isServer() {
  return typeof window === 'undefined'
}

function isTestEnv() {
  try {
    return !!(process?.env?.VITEST || process?.env?.NODE_ENV === 'test')
  } catch {
    return false
  }
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

function isFormBody(v) {
  return typeof FormData !== 'undefined' && v instanceof FormData
}

function isBinaryBody(v) {
  return (
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
  let options = {}
  const applyMode = (m) => {
    if (!m) return
    if (m === 'authless') options.authless = true
  }

  if (typeof a2 === 'string') applyMode(a2)
  else if (isInitLike(a2)) init = { ...a2 }
  else if (typeof a2 !== 'undefined') {
    init = { method: 'POST', body: a2 }
  }

  if (typeof a3 === 'string') applyMode(a3)
  else if (a3 && typeof a3 === 'object') {
    const { authless, ...rest } = a3
    if (typeof authless === 'boolean') options.authless = authless
    if (Object.keys(rest).length) init = { ...init, ...rest }
  }

  if (typeof init.authless === 'boolean') {
    options.authless = init.authless
    delete init.authless
  }

  return { path, init, options }
}

function hasHeader(headers, name) {
  if (!headers) return false
  const target = String(name || '').toLowerCase()
  if (!target) return false
  if (headers instanceof Headers) {
    return headers.has(target)
  }
  return Object.keys(headers).some((k) => String(k).toLowerCase() === target)
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

function isPlainObject(value) {
  if (!value || typeof value !== 'object') return false
  if (Array.isArray(value)) return false
  return true
}

function createApiError(path, response, body) {
  const statusCode = response?.status
  const message =
    (isPlainObject(body) && typeof body.message === 'string' && body.message) ||
    `API request failed (${statusCode || 'unknown'})`

  const err = new Error(message)
  err.name = 'ApiError'
  err.statusCode = statusCode
  err.code = isPlainObject(body) ? body.code : undefined
  err.requestId = isPlainObject(body) ? body.requestId : undefined
  err.body = body
  err.path = typeof path === 'string' ? path : String(path || '')
  return err
}

export async function apiRequest(path, initOrBody = {}, modeOrOptions) {
  const { init, options } = normalizeArgs(path, initOrBody, modeOrOptions)
  const method = (init.method || 'GET').toUpperCase()
  const headersIn = init.headers || {}
  const absoluteUrl = isAbsoluteUrl(path)
  const authless = !!options?.authless
  const bodyIn = init.body
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
    const baseHeaders = { ...headersIn }
    if (method !== 'GET' && method !== 'HEAD' && !hasHeader(baseHeaders, 'content-type')) {
      if (!(isFormBody(bodyIn) || isBinaryBody(bodyIn))) {
        baseHeaders['Content-Type'] = 'application/json'
      }
    }
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
    return doFetch()
  }

  // Client: delegate to CSR helpers with refresh-once logic
  const targetUrl = absoluteUrl ? path : toBffPath(path)
  const headers = { ...headersIn }
  if (!hasHeader(headers, 'accept-language')) headers['Accept-Language'] = navigator.language || 'en'
  if (method !== 'GET' && method !== 'HEAD' && !hasHeader(headers, 'content-type')) {
    if (!(isFormBody(bodyIn) || isBinaryBody(bodyIn))) {
      headers['Content-Type'] = 'application/json'
    }
  }

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

  const { pathname, search } = window.location
  const isOnLogin = pathname.startsWith(LOGIN_PATH)
  const nextPath = pathname + (search || '')
  const reason = await extractUnauthorizedReason(res)
  const reasonEncoded = reason ? base64UrlEncodeUtf8(JSON.stringify(reason)) : null
  const reasonQuery = reasonEncoded && reasonEncoded.length <= AUTH_REASON_MAXLEN
    ? `&${AUTH_REASON_QUERY_PARAM}=${encodeURIComponent(reasonEncoded)}`
    : ''
  const redirectTo = `${LOGIN_PATH}?${NEXT_QUERY_PARAM}=${encodeURIComponent(nextPath)}${reasonQuery}`
  if (!authless && !isOnLogin) {
    if (!isTestEnv()) {
      try {
        window.location.assign(redirectTo)
      } catch {
        // navigation 실패는 무시(테스트/특수 환경)
      }
    }
    const err = new Error('UNAUTHORIZED')
    err.name = 'UnauthorizedError'
    err.redirectTo = redirectTo
    throw err
  }
  return res
}

export const apiJSON = async (path, initOrBody = {}, modeOrOptions) => {
  const res = await apiRequest(path, initOrBody, modeOrOptions)
  const body = await parseJsonResponseBody(res)
  if (!res?.ok) {
    throw createApiError(path, res, body)
  }
  if (isPlainObject(body) && body.status === false) {
    throw createApiError(path, res, body)
  }
  return body
}

export const apiGet = (path, init = {}) => apiJSON(path, { ...init, method: 'GET' })
export const apiPost = (path, body, init = {}) => apiJSON(path, { ...init, method: 'POST', body })
export const apiPut = (path, body, init = {}) => apiJSON(path, { ...init, method: 'PUT', body })
export const apiPatch = (path, body, init = {}) => apiJSON(path, { ...init, method: 'PATCH', body })
export const apiDelete = (path, body, init = {}) => apiJSON(path, { ...init, method: 'DELETE', body })
