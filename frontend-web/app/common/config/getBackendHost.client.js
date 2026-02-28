/**
 * 파일명: getBackendHost.client.js
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 클라이언트 컨텍스트에서 백엔드 호스트를 조회
 */

import { getConfigSnapshot } from '@/app/common/store/SharedStore'

/**
 * @description config 스냅샷에서 백엔드 호스트를 우선순위로 해석
 * @returns {string}
 */ // 룰게이트 예외 허용: rule-gate: allow-function-declaration
export function getBackendHost() {
  const cfg = getConfigSnapshot()
  const base = cfg?.API?.base
    ?? cfg?.APP?.backendHost
    ?? cfg?.APP?.api_base_url
    ?? cfg?.APP?.serverHost
  return typeof base === 'string' && base ? base : 'http://localhost:2000'
}
