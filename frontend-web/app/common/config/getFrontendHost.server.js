import { loadFrontendConfig } from './frontendConfig.server'

export function getFrontendHost() {
  try {
    const cfg = loadFrontendConfig()
    const base = cfg?.APP?.frontendHost
    return typeof base === 'string' && base ? base.replace(/\/$/, '') : 'http://localhost:3000'
  } catch {
    return 'http://localhost:3000'
  }
}
