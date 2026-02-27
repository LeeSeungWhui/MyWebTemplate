'use client'
/**
 * 파일명: SharedHydrator.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 공유 스토어 하이드레이터
 */

import { useEffect } from 'react'
import { useSharedStore } from './SharedStore'

// 한글설명: 설명 동작 설명
// 한글설명: 설명 동작 설명

/**
 * @description SSR에서 주입된 user/shared/config 값을 공용 store에 1회 하이드레이션
 * @param {Object} props
 * @param {any} [props.userJson]
 * @param {object} [props.sharedPatch]
 * @param {object} [props.config]
 * @returns {null}
 */
const SharedHydrator = ({ userJson, sharedPatch, config }) => {

  const { setUserJson, setUser, setShared, setConfig } = useSharedStore()
  useEffect(() => {
    if (typeof userJson !== 'undefined') {
      setUserJson(userJson || null)
      // 한글설명: 설명 동작 설명
      if (userJson && (userJson.userId || userJson.name)) {
        setUser({ userId: userJson.userId, name: userJson.name })
      } else {
        setUser(null)
      }
    }
    if (sharedPatch && typeof sharedPatch === 'object') {
      setShared(sharedPatch)
    }
    if (config && typeof config === 'object') {
      setConfig(config)
    }
  }, [userJson, sharedPatch, config, setUserJson, setUser, setShared, setConfig])
  return null
}

export default SharedHydrator
