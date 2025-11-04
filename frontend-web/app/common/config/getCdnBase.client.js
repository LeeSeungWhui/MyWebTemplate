// Client-side CDN base resolver from hydrated store
import { useSharedStore } from '@/app/common/store/SharedStore'

export function getCdnBase() {
  const cfg = useSharedStore.getState()?.config || {}
  const base = cfg?.ASSET?.cdn_base
    ?? cfg?.WEB?.cdn_base
    ?? cfg?.APP?.cdn_base_url
  // return empty string if not set to keep relative paths
  return typeof base === 'string' ? base.replace(/\/$/, '') : ''
}
