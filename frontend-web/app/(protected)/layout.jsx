export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

import { ssrJSON } from '@/app/lib/runtime/ssr'
import { SESSION_PATH } from './endpoints'
import { redirect } from 'next/navigation'

export default async function ProtectedLayout({ children }) {
  const s = await ssrJSON(SESSION_PATH)
  const authed = !!(s && s.result && s.result.authenticated)
  if (!authed) redirect('/login')
  return <>{children}</>
}
