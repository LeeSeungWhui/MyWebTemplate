import { NextResponse } from 'next/server'

export function middleware(req) {
  const url = new URL(req.url)
  const path = url.pathname
  const isProtected = path === '/' || path.startsWith('/dashboard') || path.startsWith('/app')
  if (!isProtected) return NextResponse.next()
  const sid = req.cookies.get('sid')
  if (!sid) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('next', path)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/app/:path*'],
}

