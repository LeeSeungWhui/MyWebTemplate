import { NextResponse } from 'next/server'
import { isPublicPath } from '@/app/common/config/publicRoutes'

function sanitizeNext(next) {
  // allow only same-origin absolute-path beginning with single '/'
  if (!next || typeof next !== 'string') return '/'
  if (!next.startsWith('/')) return '/'
  if (next.startsWith('//')) return '/'
  if (/^https?:/i.test(next)) return '/'
  return next
}

function collectSetCookies(res) {
  if (!res) return []
  if (typeof res.headers.getSetCookie === 'function') {
    return res.headers.getSetCookie()
  }
  const single = res.headers.get('set-cookie')
  return single ? [single] : []
}

async function probeAuth(req) {
  const cookieHeader = req.headers.get('cookie') || ''
  if (!cookieHeader) return { ok: false, cookies: [] }

  const origin = req.nextUrl.origin
  const probeUrl = new URL('/api/bff/api/v1/auth/me', origin)
  const refreshUrl = new URL('/api/bff/api/v1/auth/refresh', origin)
  const fetchOpts = {
    headers: { cookie: cookieHeader },
    cache: 'no-store',
  }

  try {
    const meRes = await fetch(probeUrl, fetchOpts)
    if (meRes.ok) {
      return { ok: true, cookies: collectSetCookies(meRes) }
    }
    if (meRes.status === 401) {
      const refreshRes = await fetch(refreshUrl, { ...fetchOpts, method: 'POST' })
      if (refreshRes.ok) {
        return { ok: true, cookies: collectSetCookies(refreshRes) }
      }
    }
  } catch (err) {
    // 실패 시 인증 불가로 처리하고 다음 단계에서 로그인으로 유도
  }
  return { ok: false, cookies: [] }
}

function applyCookies(res, cookies = []) {
  cookies.forEach((cookie) => {
    res.headers.append('set-cookie', cookie)
  })
}

export async function middleware(req) {
  const url = new URL(req.url)
  const path = url.pathname
  const hasAuthCookie = Boolean(
    req.cookies.get('sid') ||
    req.cookies.get('access_token') ||
    req.cookies.get('refresh_token'),
  )
  const purpose = (req.headers.get('purpose') || req.headers.get('sec-purpose') || '').toLowerCase()
  if (purpose.includes('prefetch')) return NextResponse.next()

  // If already authenticated and visiting /login or root, bounce to home
  if (path.startsWith('/login')) {
    // If authed, clear any leftover next-hint cookie and redirect home
    if (hasAuthCookie) {
      const authResult = await probeAuth(req)
      const res = NextResponse.redirect(new URL('/dashboard', req.url))
      applyCookies(res, authResult.cookies)
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

  const authResult = await probeAuth(req)
  if (!authResult.ok) {
    const res = NextResponse.redirect(new URL('/login', req.url))
    const nextValue = sanitizeNext(path + (url.search || ''))
    res.cookies.set('nx', nextValue, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 300 })
    res.cookies.set('access_token', '', { path: '/', maxAge: 0 })
    res.cookies.set('refresh_token', '', { path: '/', maxAge: 0 })
    return res
  }
  // 인증 상태로 / 접근 시 대시보드로 보낸다.
  if (path === '/') {
    const res = NextResponse.redirect(new URL('/dashboard', req.url))
    applyCookies(res, authResult.cookies)
    res.cookies.set('nx', '', { path: '/', maxAge: 0 })
    return res
  }
  const res = NextResponse.next()
  applyCookies(res, authResult.cookies)
  if (req.cookies.get('nx')) {
    res.cookies.set('nx', '', { path: '/', maxAge: 0 })
  }
  return res
}

export const config = {
  // 모든 페이지에 적용하되 Next 내부/정적/파비콘 등은 제외
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
}
