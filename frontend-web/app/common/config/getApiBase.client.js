// Client-side resolver: read API base from hydrated store
import { useSharedStore } from '@/app/common/store/SharedStore'

export function getApiBase() {
  const base = useSharedStore.getState()?.config?.API?.base
  return typeof base === 'string' && base ? base : 'http://localhost:8000'
}

