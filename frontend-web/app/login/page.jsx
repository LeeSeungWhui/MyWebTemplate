export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

import Client from './View'
import { ssrJSON } from '@/app/lib/runtime/ssr'
import { SESSION_PATH } from './initData'
import SharedHydrator from '@/app/common/store/SharedHydrator'

export default async function Page() {
  const MODE = 'SSR'
  const init = MODE === 'SSR' ? await ssrJSON(SESSION_PATH) : null
  const userJson = init && init.result && init.result.authenticated
    ? { userId: init.result.userId, name: init.result.name }
    : null
  return (
    <>
      {MODE === 'SSR' && <SharedHydrator userJson={userJson} />}
      <Client mode={MODE} init={init} />
    </>
  )
}
