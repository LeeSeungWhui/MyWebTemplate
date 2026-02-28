/**
 * 파일명: getFrontendHost.server.js
 * 작성자: LSH
 * 갱신일: 2026-02-24
 * 설명: 프론트엔드 호스트 주소를 로드/캐시
 */

import { loadFrontendConfig } from './frontendConfig.server'

let cachedFrontendHost = null

const DEFAULT_FRONTEND = 'http://localhost:3000'

/**
 * @description getFrontendHost 구성 데이터를 반환. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 입력값과 상태를 검증해 UI/데이터 흐름을 안전하게 유지한다.
 */ // 룰게이트 예외 허용: rule-gate: allow-function-declaration
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
