export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

import { getSession } from '@/app/lib/runtime/fetch'
import { redirect } from 'next/navigation'

export default async function ProtectedLayout({ children }) {
  const s = await getSession('SSR')
  const authed = !!(s && s.result && s.result.authenticated)
  if (!authed) redirect('/login')
  return <>{children}</>
}
