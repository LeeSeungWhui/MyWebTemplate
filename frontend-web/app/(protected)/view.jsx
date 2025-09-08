"use client"

import useSWR from 'swr'
import { csrJSON } from '@/app/lib/runtime/Csr'
import { SESSION_PATH } from './initData'

export default function Home({ mode, init }) {
  const { data } = useSWR(mode === 'CSR' ? 'session' : null, () => csrJSON(SESSION_PATH), {
    fallbackData: init,
    revalidateOnFocus: false,
  })
  const authed = !!(data && data.result && data.result.authenticated)
  const name = authed ? (data.result.name || 'user') : null
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

