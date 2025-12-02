"use client"
/**
 * 파일명: page.jsx
 * 작성자: Codex
 * 갱신일: 2025-11-05
 * 설명: 홈 페이지(미들웨어 단일 가드 전제, 클라이언트 렌더)
 */

import useSwr from '@/app/lib/hooks/useSwr'
import { SESSION_PATH } from '@/app/login/initData'

const HomePage = () => {
  const { data, isLoading } = useSwr('session', SESSION_PATH)
  const authed = !!(data && data.result && data.result.username)
  const name = authed ? (data.result.username || 'user') : null
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Home</h1>
      {authed ? (
        <p className="mt-2">Welcome, {name}</p>
      ) : (
        <p className="mt-2">Not authenticated</p>
      )}
    </main>
  )
}

export default HomePage
