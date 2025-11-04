// Client-side resolver: read API base from hydrated store
import { useSharedStore } from '@/app/common/store/SharedStore'

export function getApiBase() {
  const cfg = useSharedStore.getState()?.config || {}; const base = cfg?.API?.base ?? cfg?.APP?.api_base_url
  return typeof base === 'string' && base ? base : 'http://localhost:8000'
}


