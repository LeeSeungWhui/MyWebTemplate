/**
 * 파일명: getBackendHost.server.js
 * 작성자: LSH
 * 갱신일: 2026-02-24
 * 설명: 백엔드 호스트 주소를 로드/캐시한다.
 */

import { loadFrontendConfig } from './frontendConfig.server'

let cachedBackendHost = null

const DEFAULT_BACKEND = 'http://localhost:2000'

/**
 * @description getBackendHost 구성 데이터를 반환한다.
 * @updated 2026-02-24
 */
export async function getBackendHost() {
  if (cachedBackendHost) return cachedBackendHost
  try {
    const cfg = await loadFrontendConfig()
    const base = cfg?.API?.base
      ?? cfg?.APP?.backendHost
      ?? cfg?.APP?.api_base_url
      ?? cfg?.APP?.serverHost
    cachedBackendHost = typeof base === 'string' && base ? base : DEFAULT_BACKEND
  } catch {
    cachedBackendHost = DEFAULT_BACKEND
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.__APP_BACKEND_HOST__ = cachedBackendHost
  }
  if (typeof process !== 'undefined' && process?.env && !process.env.APP_BACKEND_HOST) {
    process.env.APP_BACKEND_HOST = cachedBackendHost
  }
  return cachedBackendHost
}
