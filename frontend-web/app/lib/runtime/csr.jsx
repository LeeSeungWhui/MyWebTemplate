'use client'
/**
 * 파일명: csr.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: CSR 유틸리티 모듈
 */

import { getBackendHost } from '@/app/common/config/getBackendHost'

/**
 * 설명: 현재 경로를 기준으로 로그인 페이지로 이동한다.
 * 갱신일: 2025-11-05
 */
function redirectToLoginFromClient() {
  if (typeof window === 'undefined') return
  const { pathname, search } = window.location
  // 로그인 페이지에서 재호출되면 루프 방지
  if (pathname.startsWith('/login')) return
  const next = pathname + (search || '')
  const target = `/login?next=${encodeURIComponent(next)}`
  window.location.assign(target)
}

export async function csrJSON(path, init = {}) {
  const headers = {
    'Accept-Language': (typeof navigator !== 'undefined' && navigator.language) || 'en',
    ...(init.headers || {}),
  }
  const res = await fetch(getBackendHost() + path, { credentials: 'include', ...init, headers })
  if (res && res.status === 401) {
    redirectToLoginFromClient()
    throw new Error('UNAUTHORIZED')
  }
  return res.json()
}

export async function postWithCsrf(path, body) {
  const r = await fetch(getBackendHost() + '/api/v1/auth/csrf', { credentials: 'include' })
  const j = await r.json()
  const csrf = j?.result?.csrf
  const res = await fetch(getBackendHost() + path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
    body: JSON.stringify(body || {}),
  })
  if (res && res.status === 401) {
    redirectToLoginFromClient()
  }
  return res
}

