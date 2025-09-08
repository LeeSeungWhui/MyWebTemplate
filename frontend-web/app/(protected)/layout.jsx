export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

import { redirect } from 'next/navigation'
import SharedHydrator from '@/app/common/store/SharedHydrator'
import { ssrJSON } from '@/app/lib/runtime/Ssr'

const SESSION_PATH = '/api/v1/auth/session'

export default async function ProtectedLayout({ children }) {
  const init = await ssrJSON(SESSION_PATH).catch(() => null)
  const authed = !!(init && init.result && init.result.authenticated)
  if (!authed) {
    redirect('/login')
  }
  const userJson = init && init.result ? { userId: init.result.userId, name: init.result.name } : null
  return (
    <>
      <SharedHydrator userJson={userJson} />
      {children}
    </>
  )
}

