"use client"
/**
 * 파일명: useApi.jsx
 * 작성자: Codex
 * 갱신일: 2025-11-05
 * 설명: SWR 기반 공통 API 훅
 */
import useSWR from 'swr'
import { apiJSON } from '@/app/lib/runtime/api'

export function useApi(key, path, { method = 'GET', body, fetchInit = {}, swr = {} } = {}) {
  const fetcher = () => apiJSON(path, { method, body, ...fetchInit })
  return useSWR(key, fetcher, { revalidateOnFocus: false, ...swr })
}

export default useApi

