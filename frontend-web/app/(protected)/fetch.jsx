import { ssrJSON } from '@/app/lib/runtime/ssr'

export async function getSessionSSR() {
  return ssrJSON('/api/v1/auth/session')
}

