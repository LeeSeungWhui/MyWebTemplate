'use client'

import { useEffect } from 'react'
import { useSharedStore } from '@/app/store/shared'

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

