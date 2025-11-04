/**
 * 파일명: layout.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 보호된 페이지 레이아웃
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

import SharedHydrator from '@/app/common/store/SharedHydrator'
export default async function ProtectedLayout({ children }) {
  // 인증 검사는 전부 middleware에서 수행한다. 서버 컴포넌트에서는 재검사하지 않는다.
  // 필요 시 클라이언트에서 세션을 가져가도록 하고, SSR 시엔 별도 유저 주입을 하지 않는다.
  return (
    <>
      <SharedHydrator />
      {children}
    </>
  )
}
