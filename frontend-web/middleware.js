/**
 * 파일명: middleware.js
 * 작성자: Codex
 * 갱신일: 2025-12-02
 * 설명: Next 미들웨어 인증 가드 및 리다이렉트 로직
 */

import { NextResponse } from 'next/server'
import { isPublicPath } from '@/app/common/config/publicRoutes'

function sanitizeNext(next) {
  // allow only same-origin absolute-path beginning with single '/'
  if (!next || typeof next !== 'string') return '/dashboard'
  if (!next.startsWith('/')) return '/dashboard'
  if (next.startsWith('//')) return '/dashboard'
  if (/^https?:/i.test(next)) return '/dashboard'
  return next
}

function decodeBase64Url(input) {
  if (!input || typeof input !== 'string') return null
  try {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '==='.slice((base64.length + 3) % 4)
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return null
  }
}

function getJwtExpSeconds(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length < 2) return null
  const payloadText = decodeBase64Url(parts[1])
  if (!payloadText) return null
  try {
    const payload = JSON.parse(payloadText)
    const exp = payload?.exp
    return typeof exp === 'number' ? exp : null
  } catch {
    return null
  }
}

function isJwtNotExpired(token, leewaySeconds = 30) {
  const exp = getJwtExpSeconds(token)
  if (!exp) return false
  const now = Math.floor(Date.now() / 1000)
  return exp > now + Math.max(0, Number(leewaySeconds) || 0)
}

export async function middleware(req) {
  const url = new URL(req.url)
  const path = url.pathname
  // refresh_token이 있어야 인증 상태로 간주한다(access_token 단독/없는 경우는 재인증 유도)
  const hasAuthCookie = Boolean(req.cookies.get('refresh_token'))
  const accessToken = req.cookies.get('access_token')?.value || null
  const hasValidAccessToken = accessToken ? isJwtNotExpired(accessToken, 30) : false
  const purpose = (req.headers.get('purpose') || req.headers.get('sec-purpose') || '').toLowerCase()
  if (purpose.includes('prefetch')) return NextResponse.next()

  // If already authenticated and visiting /login or root, bounce to home
  if (path.startsWith('/login')) {
    // access_token이 유효한 경우에만 /login에서 대시보드로 보낸다(스테일 refresh_token 루프 방지)
    if (hasValidAccessToken) {
      const res = NextResponse.redirect(new URL('/dashboard', req.url))
      res.cookies.set('nx', '', { path: '/', maxAge: 0 })
      return res
    }
    // If next query exists, convert to cookie then redirect to clean /login (no query)
    const nextParam = url.searchParams.get('next')
    if (nextParam) {
      const res = NextResponse.redirect(new URL('/login', req.url))
      res.cookies.set('nx', sanitizeNext(nextParam), { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 300 })
      return res
    }
    return NextResponse.next()
  }

  // Allow public routes to pass without auth
  if (isPublicPath(path)) {
    if (hasAuthCookie && req.cookies.get('nx')) {
      const res = NextResponse.next()
      res.cookies.set('nx', '', { path: '/', maxAge: 0 })
      return res
    }
    return NextResponse.next()
  }

  if (!hasAuthCookie) {
    const res = NextResponse.redirect(new URL('/login', req.url))
    const nextValue = sanitizeNext(path + (url.search || ''))
    // Stash desired path in httpOnly cookie (hidden from address bar and client JS)
    res.cookies.set('nx', nextValue, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 300 })
    return res
  }

  // 인증 상태로 / 접근 시 대시보드로 보낸다.
  if (path === '/') {
    const res = NextResponse.redirect(new URL('/dashboard', req.url))
    res.cookies.set('nx', '', { path: '/', maxAge: 0 })
    return res
  }
  const res = NextResponse.next()
  if (req.cookies.get('nx')) {
    res.cookies.set('nx', '', { path: '/', maxAge: 0 })
  }
  return res
}

export const config = {
  // 모든 페이지에 적용하되 Next 내부/정적/파비콘 등은 제외
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
}
