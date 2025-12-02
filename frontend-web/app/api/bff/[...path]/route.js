/**
 * 파일명: route.js
 * 작성자: Codex
 * 갱신일: 2025-11-XX
 * 설명: Backend API 프록시(BFF) 라우트. Access/Refresh HttpOnly 쿠키를 받아 Authorization 헤더로 전달한다.
 */

import { NextResponse } from 'next/server'
import { getBackendHost } from '@/app/common/config/getBackendHost.server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SKIP_HEADERS = new Set(['connection', 'content-length', 'host'])

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

async function proxy(req, context = {}) {
  const params = await context?.params
  const backendHost = await getBackendHost()
  const accessToken = req.cookies.get('access_token')?.value || null
  const target = toBackendUrl(params?.path, req.nextUrl.search, backendHost)
  const headers = cloneRequestHeaders(req, accessToken)

  const init = {
    method: req.method,
    headers,
    redirect: 'manual',
    cache: 'no-store',
  }

  if (!(req.method === 'GET' || req.method === 'HEAD')) {
    const body = await req.arrayBuffer()
    init.body = body
  }

  const backendRes = await fetch(target, init)
  const responseHeaders = new Headers()
  backendRes.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return
    responseHeaders.append(key, value)
  })

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
