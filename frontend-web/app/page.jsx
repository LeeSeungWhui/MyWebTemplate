"use client"
/**
 * 파일명: page.jsx
 * 작성자: Codex
 * 갱신일: 2025-11-05
 * 설명: 홈 페이지(미들웨어 단일 가드 전제, 클라이언트 렌더)
 */

import { useEffect, useState } from 'react'
import { apiJSON } from '@/app/lib/runtime/api'
import { SESSION_PATH } from '@/app/login/initData'

const HomePage = () => {
  const [session, setSession] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const payload = await apiJSON(SESSION_PATH, { method: 'GET' })
        if (!alive) return
        setSession(payload)
      } catch (error) {
        console.error('세션 조회 실패:', error)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const authed = !!(session && session.result && session.result.authenticated)
  const name = authed ? (session.result.name || 'user') : null
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
