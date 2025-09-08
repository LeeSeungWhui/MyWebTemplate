export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

import Client from './view'
import { getSessionSSR } from './fetch'

export default async function Page() {
  const MODE = 'SSR'
  const init = await getSessionSSR()
  return <Client mode={MODE} init={init} />
}
