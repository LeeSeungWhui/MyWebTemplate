// Server-side resolver: read API base from config.ini
import { loadFrontendConfig } from './frontendConfig.server'

export function getApiBase() {
  try {
    const cfg = loadFrontendConfig()
    const base = cfg?.API?.base
    return typeof base === 'string' && base ? base : 'http://localhost:8000'
  } catch {
    return 'http://localhost:8000'
  }
}

