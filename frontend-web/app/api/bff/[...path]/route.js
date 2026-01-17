/**
 * 파일명: route.js
 * 작성자: Codex
 * 갱신일: 2025-11-XX
 * 설명: Backend API 프록시(BFF) 라우트. Access/Refresh HttpOnly 쿠키를 받아 Authorization 헤더로 전달한다.
 */

import { NextResponse } from 'next/server'
import { getBackendHost } from '@/app/common/config/getBackendHost.server'
import { createHash } from 'node:crypto'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SKIP_HEADERS = new Set(['connection', 'content-length', 'host'])
const REFRESH_PATH = '/api/v1/auth/refresh'
const LOGIN_PATH = '/api/v1/auth/login'
const LOGOUT_PATH = '/api/v1/auth/logout'

// refresh_token 기반 singleflight(동시 탭/요청 경합 완화)
// key: sha256(refresh_token)
const refreshInflight = new Map()

function toBackendUrl(pathSegments = [], search = '', backendHost = 'http://localhost:2000') {
  const normalizedPath = Array.isArray(pathSegments) && pathSegments.length
    ? `/${pathSegments.join('/')}`
    : '/'
  return new URL(`${normalizedPath}${search}`, backendHost)
}

function cloneRequestHeaders(req, accessToken = null) {
  const headers = new Headers()
  req.headers.forEach((value, key) => {
    if (SKIP_HEADERS.has(key.toLowerCase())) return
    if (key.toLowerCase() === 'authorization') return
    headers.set(key, value)
  })
  if (accessToken) headers.set('authorization', `Bearer ${accessToken}`)
  return headers
}

function rewriteSetCookie(rawValue) {
  if (!rawValue || typeof rawValue !== 'string') return null
  const segments = rawValue.split(';')
  const rewritten = []
  for (const segment of segments) {
    const trimmed = segment.trim()
    if (!trimmed) continue
    const lower = trimmed.toLowerCase()
    if (lower.startsWith('domain=')) continue
    rewritten.push(trimmed)
  }
  const hasPath = rewritten.some((seg) => seg.toLowerCase().startsWith('path='))
  if (!hasPath) rewritten.push('Path=/')
  return rewritten.join('; ')
}

function collectSetCookies(res) {
  let setCookies = res.headers.getSetCookie?.() || []
  if (!setCookies.length) {
    const single = res.headers.get('set-cookie')
    if (single) setCookies = [single]
  }
  return setCookies
}

function hashToken(token) {
  if (!token || typeof token !== 'string') return null
  try {
    return createHash('sha256').update(token).digest('hex')
  } catch {
    return null
  }
}

function shouldAttemptRefresh(backendPathname) {
  if (!backendPathname || typeof backendPathname !== 'string') return false
  if (backendPathname === REFRESH_PATH) return false
  if (backendPathname === LOGIN_PATH) return false
  if (backendPathname === LOGOUT_PATH) return false
  return true
}

async function refreshOnce(req, backendHost) {
  const refreshToken = req.cookies.get('refresh_token')?.value || null
  const tokenKey = hashToken(refreshToken)
  if (!tokenKey) return { ok: false, accessToken: null, setCookies: [] }

  const inflight = refreshInflight.get(tokenKey)
  if (inflight) return inflight

  const task = (async () => {
    const refreshUrl = new URL(REFRESH_PATH, backendHost)
    const headers = cloneRequestHeaders(req, null)
    // refresh는 쿠키 기반이므로 Authorization은 붙이지 않는다.
    headers.delete('authorization')
    if (!headers.has('content-type')) headers.set('content-type', 'application/json')

    const refreshRes = await fetch(refreshUrl, {
      method: 'POST',
      headers,
      redirect: 'manual',
      cache: 'no-store',
    })

    const setCookies = collectSetCookies(refreshRes).map(rewriteSetCookie).filter(Boolean)
    const json = await refreshRes.json().catch(() => null)
    const accessToken = json?.result?.accessToken || null

    if (!refreshRes.ok || !accessToken) {
      return { ok: false, accessToken: null, setCookies }
    }
    return { ok: true, accessToken, setCookies }
  })()

  refreshInflight.set(tokenKey, task)
  try {
    return await task
  } finally {
    refreshInflight.delete(tokenKey)
  }
}

async function proxy(req, context = {}) {
  const params = await context?.params
  const backendHost = await getBackendHost()
  const accessToken = req.cookies.get('access_token')?.value || null
  const target = toBackendUrl(params?.path, req.nextUrl.search, backendHost)
  const headers = cloneRequestHeaders(req, accessToken)
  const backendPathname = target.pathname

  const init = {
    method: req.method,
    headers,
    redirect: 'manual',
    cache: 'no-store',
  }

  let rawBody = undefined
  if (!(req.method === 'GET' || req.method === 'HEAD')) {
    rawBody = await req.arrayBuffer()
    init.body = rawBody
  }

  let backendRes = await fetch(target, init)
  let refreshResult = { ok: false, accessToken: null, setCookies: [] }

  // 401이면 refresh 1회만 수행한 뒤 재시도한다(동시 탭/요청 경합은 singleflight로 흡수).
  if (backendRes.status === 401 && shouldAttemptRefresh(backendPathname)) {
    refreshResult = await refreshOnce(req, backendHost)
    if (refreshResult.ok && refreshResult.accessToken) {
      const retryHeaders = cloneRequestHeaders(req, refreshResult.accessToken)
      const retryInit = {
        method: req.method,
        headers: retryHeaders,
        redirect: 'manual',
        cache: 'no-store',
      }
      if (!(req.method === 'GET' || req.method === 'HEAD')) {
        retryInit.body = rawBody
      }
      backendRes = await fetch(target, retryInit)
    }
  }

  const responseHeaders = new Headers()
  backendRes.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return
    responseHeaders.append(key, value)
  })

  // refresh 결과의 Set-Cookie(회전/삭제)를 우선 반영한다.
  for (const cookie of refreshResult.setCookies || []) {
    responseHeaders.append('set-cookie', cookie)
  }

  for (const cookie of collectSetCookies(backendRes)) {
    const rewritten = rewriteSetCookie(cookie)
    if (rewritten) responseHeaders.append('set-cookie', rewritten)
  }

  return new NextResponse(backendRes.body, {
    status: backendRes.status,
    headers: responseHeaders,
  })
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
export const HEAD = proxy
export const OPTIONS = proxy
