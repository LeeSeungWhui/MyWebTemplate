'use client'
/**
 * 파일명: csr.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: CSR 렌더링 유틸
 */

const BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

export async function csrJSON(path, init = {}) {
  const headers = {
    'Accept-Language': (typeof navigator !== 'undefined' && navigator.language) || 'en',
    ...(init.headers || {}),
  }
  const res = await fetch(BASE + path, { credentials: 'include', ...init, headers })
  return res.json()
}

export async function postWithCsrf(path, body) {
  const r = await fetch(BASE + '/api/v1/auth/csrf', { credentials: 'include' })
  const j = await r.json()
  const csrf = j?.result?.csrf
  return fetch(BASE + path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
    body: JSON.stringify(body || {}),
  })
}

