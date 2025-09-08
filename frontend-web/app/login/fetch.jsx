import { ssrJSON } from '@/app/lib/runtime/ssr'
import { csrJSON, postWithCsrf } from '@/app/lib/runtime/csr'

export async function getSessionSSR() {
  return ssrJSON('/api/v1/auth/session')
}

export async function getSessionCSR() {
  return csrJSON('/api/v1/auth/session')
}

export async function loginCSR(payload) {
  return postWithCsrf('/api/v1/auth/login', payload || {})
}

export async function logoutCSR() {
  return postWithCsrf('/api/v1/auth/logout')
}

