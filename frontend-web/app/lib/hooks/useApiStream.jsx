"use client"
/**
 * 파일명: useApiStream.jsx
 * 작성자: Codex
 * 갱신일: 2025-11-05
 * 설명: SWR 기반 스트리밍/자동 재검증 API 훅 (선택적)
 */
import useSWR from 'swr'
import { apiJSON } from '@/app/lib/runtime/api'

export function useApiStream(key, path, { method = 'GET', body, fetchInit = {}, swr = {} } = {}) {
  const fetcher = () => apiJSON(path, { method, body, ...fetchInit })
  return useSWR(key, fetcher, { revalidateOnFocus: false, ...swr })
}

export default useApiStream
