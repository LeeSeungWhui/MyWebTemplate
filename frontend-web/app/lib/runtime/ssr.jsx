/**
 * 파일명: ssr.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: SSR 유틸리티 모듈
 */
import { getBackendHost } from '@/app/common/config/getBackendHost.server'

export async function buildSSRHeaders(extra = {}) {
  // Next.js 15 dynamic APIs must be awaited
  const mod = await import('next/headers')
  const cookieStore = await mod.cookies()
  const headersList = await mod.headers()
  const cookie = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ')
  const lang = headersList.get('accept-language') || 'en'
  return {
    'Accept-Language': lang,
    Cookie: cookie,
    ...(extra || {}),
  }
}

export async function ssrJSON(path, init = {}) {
  const headers = await buildSSRHeaders(init.headers)
  const res = await fetch(getBackendHost() + path, { cache: 'no-store', ...init, headers })
  return res.json()
}

