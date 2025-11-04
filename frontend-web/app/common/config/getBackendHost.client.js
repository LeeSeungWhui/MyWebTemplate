import { useSharedStore } from '@/app/common/store/SharedStore'

export function getBackendHost() {
  const cfg = useSharedStore.getState()?.config || {}
  const base = cfg?.API?.base
    ?? cfg?.APP?.backendHost
    ?? cfg?.APP?.api_base_url
    ?? cfg?.APP?.serverHost
  return typeof base === 'string' && base ? base : 'http://localhost:8000'
}
