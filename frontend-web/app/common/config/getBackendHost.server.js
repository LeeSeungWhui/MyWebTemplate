import { loadFrontendConfig } from './frontendConfig.server'

export function getBackendHost() {
  try {
    const cfg = loadFrontendConfig()
    const base = cfg?.API?.base
      ?? cfg?.APP?.backendHost
      ?? cfg?.APP?.api_base_url
      ?? cfg?.APP?.serverHost
    return typeof base === 'string' && base ? base : 'http://localhost:8000'
  } catch {
    return 'http://localhost:8000'
  }
}
