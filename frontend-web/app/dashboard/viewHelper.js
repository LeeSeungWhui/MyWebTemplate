/**
 * 파일명: dashboard/viewHelper.js
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: dashboard view 전용 계산/정규화 헬퍼 모음
 */

export const CHART_HEIGHT = 180;
export const DONUT_HEIGHT = 180;
export const STATUS_ORDER = ["ready", "pending", "running", "done", "failed"];
export const DASHBOARD_ERROR_KEY = {
  ENDPOINT_MISSING: "ENDPOINT_MISSING",
  INIT_FETCH_FAILED: "INIT_FETCH_FAILED",
};

/**
 * @description stats payload에서 상태별 집계 리스트를 추출
 * @param {Object} payload
 * @returns {Array}
 * @updated 2026-03-03
 */
export const normalizeStatusList = (payload) =>
  (payload?.result?.byStatus || []);

/**
 * @description list payload에서 업무 목록 배열을 추출
 * @param {Object} payload
 * @returns {Array}
 * @updated 2026-03-03
 */
export const normalizeDashboardItems = (payload) => {
  const result = payload?.result;
  return result?.items || [];
};

/**
 * @description 날짜 문자열에서 월 라벨(`n월`)을 계산
 * 실패 동작: 비어 있거나 파싱 실패한 입력은 unknown 라벨을 반환한다.
 * @updated 2026-03-03
 */
export const monthKey = (iso, viewLang) => {
  if (!iso) return viewLang.unknown;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return viewLang.unknown;
  const month = date.getMonth() + 1;
  return `${month}${viewLang.monthSuffix}`;
};

/**
 * @description 숫자 값을 로케일 기준 문자열로 포맷
 * 반환값: NaN 입력은 0 텍스트를 반환하고, 정상 입력은 locale 문자열을 반환한다.
 * @updated 2026-03-03
 */
export const formatNumber = (value, numberLang) => {
  const num = Number(value || 0);
  if (Number.isNaN(num)) return numberLang.zeroText;
  return num.toLocaleString(numberLang.locale);
};

/**
 * @description 금액 숫자를 통계 카드용 문자열로 포맷
 * 처리 규칙: 현재는 formatNumber 정책을 동일하게 재사용한다.
 * @updated 2026-03-03
 */
export const formatCurrency = (value, numberLang) => formatNumber(value, numberLang);

/**
 * @description 에러 키를 사용자 노출 메시지로 매핑
 * 반환값: 매핑된 메시지 또는 null.
 * @updated 2026-03-03
 */
export const resolveErrorText = (errorKey, errorLang, errorKeyMap) => {
  if (errorKey === errorKeyMap.ENDPOINT_MISSING) {
    return errorLang.endpointMissing;
  }
  if (errorKey === errorKeyMap.INIT_FETCH_FAILED) {
    return errorLang.fetchFailed;
  }
  return null;
};

/**
 * @description 상태 필터를 포함한 `/dashboard/tasks` 이동 경로를 생성
 * 반환값: status query 포함 여부가 반영된 href 문자열.
 * @updated 2026-03-03
 */
export const createTasksPath = ({ status, statusLabelMap }) => {
  const params = new URLSearchParams();
  if (status && statusLabelMap[status]) params.set("status", status);
  return params.toString()
    ? `/dashboard/tasks?${params.toString()}`
    : "/dashboard/tasks";
};

/**
 * @description 다양한 에러 표현(string/object/null)을 공통 shape로 정규화
 * 반환값: `{key, code, requestId}` 구조 또는 null.
 * @updated 2026-03-03
 */
export const normalizeErrorState = (value, errorKeyMap) => {
  if (!value) return null;
  if (typeof value === "string") return { key: value };
  if (typeof value === "object") {
    const candidateKey = String(value.key || value.message || "").toUpperCase();
    const key = candidateKey === errorKeyMap.ENDPOINT_MISSING
      ? errorKeyMap.ENDPOINT_MISSING
      : errorKeyMap.INIT_FETCH_FAILED;
    return {
      key,
      code: value.code,
      requestId: value.requestId,
    };
  }
  return { key: errorKeyMap.INIT_FETCH_FAILED };
};
