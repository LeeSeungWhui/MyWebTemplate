import { useSharedStore } from '@/app/common/store/SharedStore'

export function getFrontendHost() {
  const cfg = useSharedStore.getState()?.config || {}
  const base = cfg?.APP?.frontendHost
  if (typeof base === 'string' && base) return base.replace(/\/$/, '')
  // best-effort fallback in browser
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return 'http://localhost:3000'
}
