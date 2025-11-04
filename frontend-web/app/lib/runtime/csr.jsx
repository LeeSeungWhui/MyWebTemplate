'use client'
/**
 * ?뚯씪紐? csr.jsx
 * ?묒꽦?? LSH
 * 媛깆떊?? 2025-09-13
 * ?ㅻ챸: CSR ?뚮뜑留??좏떥
 */

import { getBackendHost } from '@/app/common/config/getBackendHost'

export async function csrJSON(path, init = {}) {
  const headers = {
    'Accept-Language': (typeof navigator !== 'undefined' && navigator.language) || 'en',
    ...(init.headers || {}),
  }
  const res = await fetch(getBackendHost() + path, { credentials: 'include', ...init, headers })
  return res.json()
}

export async function postWithCsrf(path, body) {
  const r = await fetch(getBackendHost() + '/api/v1/auth/csrf', { credentials: 'include' })
  const j = await r.json()
  const csrf = j?.result?.csrf
  return fetch(getBackendHost() + path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
    body: JSON.stringify(body || {}),
  })
}



