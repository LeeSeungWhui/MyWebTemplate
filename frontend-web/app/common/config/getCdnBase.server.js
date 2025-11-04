// Server-side CDN base resolver from config.ini
import { loadFrontendConfig } from './frontendConfig.server'

export function getCdnBase() {
  try {
    const cfg = loadFrontendConfig()
    const base = cfg?.ASSET?.cdn_base
      ?? cfg?.WEB?.cdn_base
      ?? cfg?.APP?.cdn_base_url
    return typeof base === 'string' ? base.replace(/\/$/, '') : ''
  } catch {
    return ''
  }
}
