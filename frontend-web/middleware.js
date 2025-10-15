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
    if (sid) return NextResponse.redirect(new URL('/', req.url))
    return NextResponse.next()
  }

  if (!isProtected) return NextResponse.next()

  if (!sid) {
    const loginUrl = new URL('/login', req.url)
    const nextValue = sanitizeNext(path + (url.search || ''))
    loginUrl.searchParams.set('next', nextValue)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/app/:path*', '/settings/:path*', '/login'],
}
