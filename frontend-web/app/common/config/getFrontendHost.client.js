/**
 * 파일명: getFrontendHost.client.js
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 클라이언트 컨텍스트에서 프론트엔드 호스트를 조회
 */

import { getConfigSnapshot } from '@/app/common/store/SharedStore'

/**
 * @description config 스냅샷 기반으로 프론트 호스트를 해석하고 기본값을 반환. 입력/출력 계약을 함께 명시
 * @returns {string}
 */
export function getFrontendHost() {
  const cfg = getConfigSnapshot()
  const base = cfg?.APP?.frontendHost
  if (typeof base === 'string' && base) return base.replace(/\/$/, '')

  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return 'http://localhost:3000'
}
