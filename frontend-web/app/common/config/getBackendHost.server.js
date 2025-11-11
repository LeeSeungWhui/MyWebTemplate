import { loadFrontendConfig } from './frontendConfig.server'

let cachedBackendHost = null

const DEFAULT_BACKEND = 'http://localhost:2000'

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
