import { ssrJSON } from '@/app/lib/runtime/ssr'
import { csrJSON, postWithCsrf } from '@/app/lib/runtime/csr'

export async function getSession(mode = 'SSR') {
  return mode === 'SSR' ? ssrJSON('/api/v1/auth/session') : csrJSON('/api/v1/auth/session')
}

export async function login(mode = 'CSR', payload) {
  // login is cookie-based; do on CSR by default
  if (mode === 'SSR') return ssrJSON('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(payload || {}), headers: { 'Content-Type': 'application/json' } })
  const res = await postWithCsrf('/api/v1/auth/login', payload || {})
  return res
}

export async function logout(mode = 'CSR') {
  if (mode === 'SSR') return ssrJSON('/api/v1/auth/logout', { method: 'POST' })
  return postWithCsrf('/api/v1/auth/logout')
}
