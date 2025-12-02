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

export function middleware(req) {
  const url = new URL(req.url)
  const path = url.pathname
  const sidCookie = req.cookies.get('sid') || req.cookies.get('access_token')

  // If already authenticated and visiting /login or root, bounce to home/dashboard
  if (path.startsWith('/login')) {
    // If authed, clear any leftover next-hint cookie and redirect home
    if (sidCookie) {
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

  if (path === '/' && sidCookie) {
    const res = NextResponse.redirect(new URL('/dashboard', req.url))
    return res
  }

  // Allow public routes to pass without auth
  if (isPublicPath(path)) return NextResponse.next()

  if (!sidCookie) {
    const res = NextResponse.redirect(new URL('/login', req.url))
    const nextValue = sanitizeNext(path + (url.search || ''))
    // Stash desired path in httpOnly cookie (hidden from address bar and client JS)
    res.cookies.set('nx', nextValue, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 300 })
    return res
  }
  return NextResponse.next()
}

export const config = {
  // 모든 페이지에 적용하되 Next 내부/정적/파비콘 등은 제외
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
}
