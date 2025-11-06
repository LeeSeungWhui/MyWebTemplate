/**
 * 파일명: page.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 로그인 페이지 컴포넌트
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

import Client from './view'
import { apiJSON } from '@/app/lib/runtime/api'
import { SESSION_PATH } from './initData'
import SharedHydrator from '@/app/common/store/SharedHydrator'
import { cookies } from 'next/headers'

const Page = async () => {
  const init = await apiJSON(SESSION_PATH, { method: 'GET' }).catch(() => null)
  // Read next-hint from httpOnly cookie set by middleware (hidden from URL)
  const cookieStore = await cookies()
  const rawNext = cookieStore.get('nx')?.value || null
  const sanitize = (n) => {
    if (!n || typeof n !== 'string') return null
    if (!n.startsWith('/')) return null
    if (n.startsWith('//')) return null
    if (/^https?:/i.test(n)) return null
    return n
  }
  const nextHint = sanitize(rawNext)
  const userJson = init && init.result && init.result.authenticated
    ? { userId: init.result.userId, name: init.result.name }
    : null
  return (
    <>
      <SharedHydrator userJson={userJson} />
      <Client mode="SSR" init={init} nextHint={nextHint} />
    </>
  )
}

export default Page
