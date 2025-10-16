import { NextResponse } from 'next/server'

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
  const isProtected = path === '/' || path.startsWith('/dashboard') || path.startsWith('/app') || path.startsWith('/settings')
  const sid = req.cookies.get('sid')

  // If already authenticated and visiting /login, bounce to home
  if (path.startsWith('/login')) {
    // If authed, clear any leftover next-hint cookie and redirect home
    if (sid) {
      const res = NextResponse.redirect(new URL('/', req.url))
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

  if (!isProtected) return NextResponse.next()

  if (!sid) {
    const res = NextResponse.redirect(new URL('/login', req.url))
    const nextValue = sanitizeNext(path + (url.search || ''))
    // Stash desired path in httpOnly cookie (hidden from address bar and client JS)
    res.cookies.set('nx', nextValue, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 300 })
    return res
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/app/:path*', '/settings/:path*', '/login'],
}
