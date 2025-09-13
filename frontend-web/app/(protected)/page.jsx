/**
 * 파일명: page.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 보호된 페이지 컴포넌트
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

import Home from './view'
import { ssrJSON } from '@/app/lib/runtime/ssr'
import SharedHydrator from '@/app/common/store/SharedHydrator'
import { SESSION_PATH } from './initData'

export default async function Page() {
  const MODE = 'SSR'
  const init = MODE === 'SSR' ? await ssrJSON(SESSION_PATH).catch(() => null) : null
  const userJson = init && init.result && init.result.authenticated
    ? { userId: init.result.userId, name: init.result.name }
    : null
  return (
    <>
      {MODE === 'SSR' && <SharedHydrator userJson={userJson} />}
      <Home mode={MODE} init={init} />
    </>
  )
}

