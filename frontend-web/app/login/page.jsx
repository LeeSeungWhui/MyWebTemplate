export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

import Client from './view'
import { ssrJSON } from '@/app/lib/runtime/ssr'
import { SESSION_PATH } from './init.api'

export default async function Page() {
  const MODE = 'SSR'
  const init = MODE === 'SSR' ? await ssrJSON(SESSION_PATH) : null
  return <Client mode={MODE} init={init} />
}
