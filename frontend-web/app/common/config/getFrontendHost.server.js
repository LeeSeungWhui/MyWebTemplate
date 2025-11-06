import { loadFrontendConfig } from './frontendConfig.server'

let cachedFrontendHost = null

const DEFAULT_FRONTEND = 'http://localhost:3000'

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
