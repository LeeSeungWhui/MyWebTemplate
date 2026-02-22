/**
 * 파일명: middleware.test.jsx
 * 작성자: Codex
 * 갱신일: 2026-01-17
 * 설명: Next middleware 인증 가드/리다이렉트 테스트
 */

import { describe, expect, it, vi } from 'vitest'
import { middleware } from '@/middleware.js'

function createJwtWithExp(expSeconds) {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({ exp: expSeconds })).toString('base64url')
  return `${header}.${payload}.`
}

function buildReq({ url, cookies = {}, headers = {} }) {
  const cookieJar = {
    get(name) {
      if (!Object.prototype.hasOwnProperty.call(cookies, name)) return undefined
      const value = cookies[name]
      if (value == null) return undefined
      return { name, value: String(value) }
    },
  }
  return {
    url,
    cookies: cookieJar,
    headers: new Headers(headers),
  }
}

function getSetCookies(res) {
  if (typeof res?.headers?.getSetCookie === 'function') return res.headers.getSetCookie()
  const single = res?.headers?.get?.('set-cookie')
  return single ? [single] : []
}

function findCookieValue(setCookies, name) {
  for (const line of setCookies) {
    if (typeof line !== 'string') continue
    const prefix = `${name}=`
    if (!line.startsWith(prefix)) continue
    return line.slice(prefix.length).split(';')[0]
  }
  return null
}

describe('middleware', () => {
  it('보호 경로 + 미인증이면 /login으로 리다이렉트하고 nx를 저장한다', async () => {
    const req = buildReq({ url: 'http://localhost:3000/dashboard?foo=bar' })
    const res = await middleware(req)
    expect(res.headers.get('location')).toBe('http://localhost:3000/login')

    const setCookies = getSetCookies(res)
    const nxValueRaw = findCookieValue(setCookies, 'nx')
    expect(nxValueRaw).toBeTruthy()
    expect(decodeURIComponent(nxValueRaw)).toBe('/dashboard?foo=bar')
  })

  it('보호 경로 + refresh_token만 있으면 /api/session/bootstrap으로 선회하고 nx를 저장한다', async () => {
    const req = buildReq({
      url: 'http://localhost:3000/dashboard?foo=bar',
      cookies: { refresh_token: 'rt' },
    })
    const res = await middleware(req)
    expect(res.headers.get('location')).toBe('http://localhost:3000/api/session/bootstrap')

    const setCookies = getSetCookies(res)
    const nxValueRaw = findCookieValue(setCookies, 'nx')
    expect(nxValueRaw).toBeTruthy()
    expect(decodeURIComponent(nxValueRaw)).toBe('/dashboard?foo=bar')
  })

  it('프리페치 요청은 리다이렉트하지 않는다', async () => {
    const req = buildReq({
      url: 'http://localhost:3000/dashboard',
      headers: { purpose: 'prefetch' },
    })
    const res = await middleware(req)
    expect(res.headers.get('location')).toBeNull()
  })

  it('/login?next=외부URL이면 nx는 /dashboard로 sanitize된다', async () => {
    const req = buildReq({ url: 'http://localhost:3000/login?next=https://evil.example/a' })
    const res = await middleware(req)
    expect(res.headers.get('location')).toBe('http://localhost:3000/login')

    const setCookies = getSetCookies(res)
    const nxValueRaw = findCookieValue(setCookies, 'nx')
    expect(decodeURIComponent(nxValueRaw)).toBe('/dashboard')
  })

  it('/login?next&reason이면 nx/auth_reason 쿠키로 정리하고 주소창은 /login으로 유지한다', async () => {
    const req = buildReq({
      url: 'http://localhost:3000/login?next=/settings/profile&reason=abcDEF_-123',
    })
    const res = await middleware(req)
    expect(res.headers.get('location')).toBe('http://localhost:3000/login')

    const setCookies = getSetCookies(res)
    const nxValueRaw = findCookieValue(setCookies, 'nx')
    expect(decodeURIComponent(nxValueRaw)).toBe('/settings/profile')

    const reasonValue = findCookieValue(setCookies, 'auth_reason')
    expect(reasonValue).toBe('abcDEF_-123')
  })

  it('유효한 access_token이면 /login에서 /dashboard로 보낸다(nx도 정리)', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 60 * 10
    const req = buildReq({
      url: 'http://localhost:3000/login',
      cookies: {
        refresh_token: 'rt',
        access_token: createJwtWithExp(futureExp),
        nx: '/dashboard',
      },
    })
    const res = await middleware(req)
    expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard')

    const setCookies = getSetCookies(res)
    const nxValueRaw = findCookieValue(setCookies, 'nx')
    expect(nxValueRaw).toBe('')
  })

  it('비정상 access_token이면 /login에서 /dashboard가 아니라 bootstrap으로 보낸다', async () => {
    const req = buildReq({
      url: 'http://localhost:3000/login',
      cookies: {
        refresh_token: 'rt',
        access_token: 'header.invalid*payload.signature',
      },
    })
    const res = await middleware(req)
    expect(res.headers.get('location')).toBe('http://localhost:3000/api/session/bootstrap')
  })

  it('/login에서 auth_reason이 있으면 페이지 표시 후 1회성으로 정리한다', async () => {
    const req = buildReq({
      url: 'http://localhost:3000/login',
      cookies: { auth_reason: 'abcDEF_-123' },
    })
    const res = await middleware(req)
    expect(res.headers.get('location')).toBeNull()

    const setCookies = getSetCookies(res)
    const reasonValue = findCookieValue(setCookies, 'auth_reason')
    expect(reasonValue).toBe('')
  })

  it('refresh_token만 있으면 /login에서 access 재발급 엔드포인트로 보낸다', async () => {
    const req = buildReq({
      url: 'http://localhost:3000/login',
      cookies: { refresh_token: 'rt' },
    })
    const res = await middleware(req)
    expect(res.headers.get('location')).toBe('http://localhost:3000/api/session/bootstrap')
  })

  it('공개 경로는 통과하고, 인증 상태에서 남은 nx는 정리한다', async () => {
    const req = buildReq({
      url: 'http://localhost:3000/component',
      cookies: { refresh_token: 'rt', nx: '/dashboard' },
    })
    const res = await middleware(req)
    expect(res.headers.get('location')).toBeNull()

    const setCookies = getSetCookies(res)
    const nxValueRaw = findCookieValue(setCookies, 'nx')
    expect(nxValueRaw).toBe('')
  })

  it('/portfolio는 미인증이어도 공개 경로로 통과한다', async () => {
    const req = buildReq({
      url: 'http://localhost:3000/portfolio',
    })
    const res = await middleware(req)
    expect(res.headers.get('location')).toBeNull()
  })

  it('미들웨어는 원격 호출(fetch)을 하지 않는다', async () => {
    const original = globalThis.fetch
    const fetchMock = vi.fn()
    globalThis.fetch = fetchMock
    try {
      const req = buildReq({ url: 'http://localhost:3000/dashboard' })
      await middleware(req)
      expect(fetchMock).not.toHaveBeenCalled()
    } finally {
      globalThis.fetch = original
    }
  })
})
