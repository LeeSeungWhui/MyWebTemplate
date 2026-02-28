/**
 * 파일명: ssr.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: SSR 유틸리티 모듈
 */ // 룰게이트 예외 허용: rule-gate: allow-function-declaration
export async function buildSSRHeaders(extra = {}) {


  const mod = await import('next/headers')
  const cookieStore = await mod.cookies()
  const headersList = await mod.headers()
  const cookie = cookieStore.getAll().map((cookieItem) => `${cookieItem.name}=${cookieItem.value}`).join('; ')
  const lang = headersList.get('accept-language') || 'en'
  return {
    'Accept-Language': lang,
    Cookie: cookie,
    ...(extra || {}),
  }
}
