export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

import Client from './view'
import { ssrJSON } from '@/app/lib/runtime/ssr'

export default async function Page() {
  const MODE = 'SSR'
  const init = await ssrJSON('/api/v1/auth/session')
  return <Client mode={MODE} init={init} />
}
