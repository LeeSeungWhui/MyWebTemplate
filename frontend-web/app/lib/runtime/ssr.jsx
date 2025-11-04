/**
 * ?뚯씪紐? ssr.jsx
 * ?묒꽦?? LSH
 * 媛깆떊?? 2025-09-13
 * ?ㅻ챸: SSR ?뚮뜑留??좏떥
 */
import { getBackendHost } from \"@/app/common/config/getBackendHost\"

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



