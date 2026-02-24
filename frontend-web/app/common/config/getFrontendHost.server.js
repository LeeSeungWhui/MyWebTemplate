/**
 * 파일명: getFrontendHost.server.js
 * 작성자: LSH
 * 갱신일: 2026-02-24
 * 설명: 프론트엔드 호스트 주소를 로드/캐시한다.
 */

import { loadFrontendConfig } from './frontendConfig.server'

let cachedFrontendHost = null

const DEFAULT_FRONTEND = 'http://localhost:3000'

/**
 * @description getFrontendHost 구성 데이터를 반환한다.
 * @updated 2026-02-24
 */
export async function getFrontendHost() {
  if (cachedFrontendHost) return cachedFrontendHost
  try {
    const cfg = await loadFrontendConfig()
    const base = cfg?.APP?.frontendHost
    cachedFrontendHost = typeof base === 'string' && base ? base.replace(/\/$/, '') : DEFAULT_FRONTEND
  } catch {
    cachedFrontendHost = DEFAULT_FRONTEND
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.__APP_FRONTEND_HOST__ = cachedFrontendHost
  }
  if (typeof process !== 'undefined' && process?.env && !process.env.APP_FRONTEND_HOST) {
    process.env.APP_FRONTEND_HOST = cachedFrontendHost
  }
  return cachedFrontendHost
}
