const BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

export function buildSSRHeaders(extra = {}) {
  // next/headers must be imported lazily inside server runtime
  // to avoid including it in client bundles
  return (async () => {
    const mod = await import('next/headers')
    const cookie = mod.cookies().getAll().map((c) => `${c.name}=${c.value}`).join('; ')
    const lang = mod.headers().get('accept-language') || 'en'
    return {
      'Accept-Language': lang,
      Cookie: cookie,
      ...extra,
    }
  })()
}

export async function ssrJSON(path, init = {}) {
  const headers = await buildSSRHeaders(init.headers)
  const res = await fetch(BASE + path, { cache: 'no-store', ...init, headers })
  return res.json()
}

