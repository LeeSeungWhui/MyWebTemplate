/**
 * 파일명: page.jsx
 * 작성자: LSH
 * 갱신일: 2026-01-18
 * 설명: 로그인 페이지 컴포넌트
 */
import Client from './view'
import { apiJSON } from '@/app/lib/runtime/api'
import { SESSION_PATH } from './initData'
import SharedHydrator from '@/app/common/store/SharedHydrator'
import { cookies } from 'next/headers'
import { AUTH_REASON_COOKIE, NX_COOKIE, parseAuthReason, safeDecodeURIComponent, sanitizeInternalPath } from '@/app/lib/runtime/authRedirect'
import LANG_KO from './lang.ko'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

export const metadata = {
  title: LANG_KO.page.metadataTitle,
  robots: {
    index: false,
    follow: false,
  },
}

/**
 * @description 세션/쿠키 기반 초기값을 읽어 로그인 클라이언트 뷰에 전달한다.
 * @returns {Promise<JSX.Element>}
 */
const Page = async () => {
  const init = await apiJSON(SESSION_PATH, { method: 'GET' }).catch(() => null)
  // 미들웨어가 저장한 httpOnly 쿠키(next-hint)를 읽어 복귀 경로에 사용한다(URL에는 노출되지 않음).
  const cookieStore = await cookies()
  const rawNext = cookieStore.get(NX_COOKIE)?.value || null
  const rawAuthReason = cookieStore.get(AUTH_REASON_COOKIE)?.value || null
  const nextHint = sanitizeInternalPath(safeDecodeURIComponent(rawNext), null)
  const authReason = parseAuthReason(rawAuthReason)
  const userJson = init && init.result && init.result.username
    ? { userId: init.result.username, name: init.result.username }
    : null
  return (
    <>
      <SharedHydrator userJson={userJson} />
      <Client mode="SSR" init={init} nextHint={nextHint} authReason={authReason} />
    </>
  )
}

export default Page
