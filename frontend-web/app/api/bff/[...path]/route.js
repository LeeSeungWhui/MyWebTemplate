/**
 * 파일명: route.js
 * 작성자: Codex
 * 갱신일: 2025-11-05
 * 설명: Backend API 프록시(BFF) 라우트. 쿠키를 재작성하여 미들웨어 가드와 일관성을 유지한다.
 */

import { NextResponse } from 'next/server'
import { getBackendHost } from '@/app/common/config/getBackendHost.server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SKIP_HEADERS = new Set(['connection', 'content-length', 'host'])

function toBackendUrl(pathSegments = [], search = '') {
  const normalizedPath = Array.isArray(pathSegments) && pathSegments.length
    ? `/${pathSegments.join('/')}`
    : '/'
  const backend = getBackendHost()
  return new URL(`${normalizedPath}${search}`, backend)
}

function cloneRequestHeaders(req) {
  const headers = new Headers()
  req.headers.forEach((value, key) => {
    if (SKIP_HEADERS.has(key.toLowerCase())) return
    headers.set(key, value)
  })
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
  // Path 명시 보장
  const hasPath = rewritten.some((seg) => seg.toLowerCase().startsWith('path='))
  if (!hasPath) rewritten.push('Path=/')
  return rewritten.join('; ')
}

async function proxy(req, { params }) {
  try {
    const target = toBackendUrl(params?.path, req.nextUrl.search)
    const headers = cloneRequestHeaders(req)
    // 세션 쿠키가 프론트 도메인에만 존재하므로, 받은 Cookie 헤더를 그대로 전달하면 충분하다.
    // 필요 시 추가 쿠키 재작성 가능.

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

    let setCookies = backendRes.headers.getSetCookie?.() || []
    if (!setCookies.length) {
      const single = backendRes.headers.get('set-cookie')
      if (single) setCookies = [single]
    }
    for (const cookie of setCookies) {
      const rewritten = rewriteSetCookie(cookie)
      if (rewritten) responseHeaders.append('set-cookie', rewritten)
    }

    return new NextResponse(backendRes.body, {
      status: backendRes.status,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('[bff] proxy error', error)
    return NextResponse.json(
      {
        status: false,
        message: 'Backend proxy failed',
        result: null,
        code: 'BFF_PROXY_ERROR',
        requestId: '',
      },
      { status: 502 },
    )
  }
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
export const HEAD = proxy
export const OPTIONS = proxy
