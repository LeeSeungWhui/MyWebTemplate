"use client";
/**
 * 파일명: useSwr.jsx
 * 작성자: LSH
 * 갱신일: 2025-11-05
 * 설명: apiJSON을 fetcher로 사용하는 SWR 래퍼 훅(선택적)
 */
import useSwrLib from "swr";
import { apiJSON } from "@/app/lib/runtime/api";

/**
 * @description apiJSON 기반 SWR fetcher를 구성한다.
 * @param {string|string[]|null} key
 * @param {string} path
 * @param {Object} [options]
 * @returns {any}
 */
export function useSwr(
  key,
  path,
  { method = "GET", body, fetchInit = {}, swr = {} } = {},
) {
  const fetcher = () => apiJSON(path, { method, body, ...fetchInit });
  return useSwrLib(key, fetcher, { revalidateOnFocus: false, ...swr });
}

/**
 * @description useSwr export를 노출한다.
 */
export default useSwr;
