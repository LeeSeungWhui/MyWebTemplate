/**
 * 파일명: dashboard/dataStrategy.js
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 대시보드 페이지 MODE 기반 초기 데이터 전략 유틸
 */

export const DASHBOARD_ERROR_KEY = {
  ENDPOINT_MISSING: "ENDPOINT_MISSING",
  INIT_FETCH_FAILED: "INIT_FETCH_FAILED",
};

/**
 * @description 페이지 MODE 문자열이 SSR인지 판별
 * @param {string} mode
 * @returns {boolean}
 */
export function isSsrMode(mode) {
  return String(mode || "").toUpperCase() === "SSR";
}

/**
 * @description 에러 객체를 공통 에러 상태 포맷으로 정규화. 입력/출력 계약을 함께 명시
 * @param {Error|Object|null} err
 * @param {string} key
 * @returns {{ key: string, code: (string | undefined), requestId: (string | undefined) }}
 */
export function toErrorState(err, key) {
  if (!err) return { key };
  return {
    key,
    code: err.code,
    requestId: err.requestId,
  };
}

/**
 * @description MODE/엔드포인트 규칙에 따라 대시보드 초기 데이터를 생성. 입력/출력 계약을 함께 명시
 * @param {Object} params
 * @param {string} params.mode
 * @param {Object} params.endPoints
 * @param {Function} params.fetcher
 * @returns {Promise<{statList:Array, dataList:Array, error:Object|null}>}
 */
export async function buildDashboardInitialData({
  mode,
  endPoints,
  fetcher,
}) {

  const endpoints = endPoints || {};
  const hasRequiredEndpoints = Boolean(endpoints.stats && endpoints.list);
  if (!hasRequiredEndpoints) {
    return {
      statList: [],
      dataList: [],
      error: toErrorState(null, DASHBOARD_ERROR_KEY.ENDPOINT_MISSING),
    };
  }

  if (!isSsrMode(mode)) {
    return {
      statList: [],
      dataList: [],
      error: null,
    };
  }

  try {
    const [stats, list] = await Promise.all([
      fetcher(endpoints.stats),
      fetcher(endpoints.list),
    ]);
    const listResult = list?.result;
    const normalizedList = Array.isArray(listResult)
      ? listResult
      : Array.isArray(listResult?.items)
        ? listResult.items
        : [];
    return {
      statList: stats?.result?.byStatus || [],
      dataList: normalizedList,
      error: null,
    };
  } catch (error) {
    return {
      statList: [],
      dataList: [],
      error: toErrorState(error, DASHBOARD_ERROR_KEY.INIT_FETCH_FAILED),
    };
  }
}
