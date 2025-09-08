export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

import Client from './view'
import { getSession } from '@/app/lib/runtime/fetch'

export default async function Page() {
  const MODE = 'SSR'
  const init = await getSession('SSR')
  return <Client mode={MODE} init={init} />
}
