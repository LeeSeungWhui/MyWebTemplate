'use client'
/**
 * 파일명: SharedHydrator.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 공유 스토어 하이드레이터
 */

import { useEffect } from 'react'
import { useSharedStore } from './SharedStore'

// Hydrates shared store from SSR-provided initial data.
// Pass userJson (e.g., { userId, name }) and/or sharedPatch (partial shared object).
export default function SharedHydrator({ userJson, sharedPatch }) {
  const { setUserJson, setUser, setShared } = useSharedStore()
  useEffect(() => {
    if (typeof userJson !== 'undefined') {
      setUserJson(userJson || null)
      // maintain derived lightweight user for convenience
      if (userJson && (userJson.userId || userJson.name)) {
        setUser({ userId: userJson.userId, name: userJson.name })
      } else {
        setUser(null)
      }
    }
    if (sharedPatch && typeof sharedPatch === 'object') {
      setShared(sharedPatch)
    }
  }, [userJson, sharedPatch, setUserJson, setUser, setShared])
  return null
}
