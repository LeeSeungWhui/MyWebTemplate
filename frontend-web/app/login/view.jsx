"use client"
/**
 * 파일명: view.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 로그인 페이지 뷰
 */

import { useState } from 'react'
import useSWR from 'swr'
import { csrJSON, postWithCsrf } from '@/app/lib/runtime/csr'
import { SESSION_PATH } from './initData'

export default function Client({ mode, init, nextHint }) {
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
        const safe = (n) => {
          if (!n || typeof n !== 'string') return null
          if (!n.startsWith('/')) return null
          if (n.startsWith('//')) return null
          if (/^https?:/i.test(n)) return null
          return n
        }
        // Prefer server-provided hint from httpOnly cookie (passed via SSR)
        const target = safe(nextHint) || '/'
        window.location.assign(target)
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
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4" aria-describedby="login-help">
        <h1 className="text-2xl font-semibold">Login</h1>
        <label htmlFor="username" className="sr-only">Username</label>
        <input id="username" aria-label="username" className="w-full border rounded px-3 py-2" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <label htmlFor="password" className="sr-only">Password</label>
        <input id="password" aria-label="password" className="w-full border rounded px-3 py-2" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button disabled={pending} className="w-full bg-black text-white rounded px-3 py-2 disabled:opacity-50">{pending ? 'Signing in…' : 'Sign In'}</button>
        <p id="login-help" className="text-sm text-gray-500">Use demo/password123 for local demo.</p>
      </form>
    </main>
  )
}

