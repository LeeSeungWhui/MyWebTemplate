"use client"
/**
 * 파일명: view.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 로그인 페이지 뷰
 */

import { useState } from 'react'
import useSWR from 'swr'
import { csrJSON, postWithCsrf } from '@/app/lib/runtime/Csr'
import { SESSION_PATH } from './initData'

export default function Client({ mode, init }) {
  const [username, setUsername] = useState('demo')
  const [password, setPassword] = useState('password123')
  const [pending, setPending] = useState(false)
  const { data, mutate } = useSWR(mode === 'CSR' ? 'session' : null, () => csrJSON(SESSION_PATH), {
    fallbackData: init,
    revalidateOnFocus: false,
  })
  const authed = !!(data && data.result && data.result.authenticated)

  async function onSubmit(e) {
    e.preventDefault()
    setPending(true)
    try {
      const res = await postWithCsrf('/api/v1/auth/login', { username, password, rememberMe: true })
      if (res && res.status === 204) {
        await mutate()
        window.location.href = '/'
      } else {
        const j = await res.json().catch(() => ({}))
        alert(j?.message || 'login failed')
      }
    } catch (err) {
      console.error(err)
      alert('login error')
    } finally {
      setPending(false)
    }
  }

  if (authed) {
    if (typeof window !== 'undefined') window.location.replace('/')
    return null
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Login</h1>
        <input className="w-full border rounded px-3 py-2" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button disabled={pending} className="w-full bg-black text-white rounded px-3 py-2 disabled:opacity-50">{pending ? 'Signing in…' : 'Sign In'}</button>
      </form>
    </main>
  )
}

