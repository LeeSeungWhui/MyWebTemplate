/**
 * 파일명: dashboard/tasks/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 업무 관리 페이지 초기 설정
 */

import LANG_KO from "./lang.ko";

const { initData } = LANG_KO;

export const PAGE_MODE = {
  MODE: "CSR",
  dynamic: "force-dynamic",
  runtime: "nodejs",
  revalidate: 0,
  fetchCache: "only-no-store",
  endPoints: {
    list: "/api/v1/dashboard",
    detail: "/api/v1/dashboard/:id",
    create: "/api/v1/dashboard",
    update: "/api/v1/dashboard/:id",
    remove: "/api/v1/dashboard/:id",
  },
};

export const STATUS_FILTER_LIST = initData.statusFilterList.map((item) => ({ ...item }));

export const SORT_FILTER_LIST = initData.sortFilterList.map((item) => ({ ...item }));

export const DEFAULT_SORT = "reg_dt_desc";

const ALLOWED_STATUS = new Set(
  STATUS_FILTER_LIST.map((item) => item.value).filter(Boolean)
);
const ALLOWED_SORT = new Set(SORT_FILTER_LIST.map((item) => item.value));

/**
 * @description 쿼리 파라미터 원본 값을 문자열로 정규화한다.
 * @param {unknown} rawValue
 * @returns {string} 첫 값 기준 문자열
 * @updated 2026-02-27
 */
const pickQueryValue = (rawValue) => {
  if (Array.isArray(rawValue)) return String(rawValue[0] || "");
  if (typeof rawValue === "string") return rawValue;
  if (rawValue == null) return "";
  return String(rawValue);
};

/**
 * @description 페이지 번호처럼 양의 정수만 허용하고 실패 시 기본값으로 보정한다.
 * @param {unknown} rawValue
 * @param {number} [defaultValue=1]
 * @returns {number} 1 이상 정수
 * @updated 2026-02-27
 */
const toPositiveInt = (rawValue, defaultValue = 1) => {
  const parsed = Number.parseInt(String(rawValue || ""), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return defaultValue;
  return parsed;
};

/**
 * @description URL 검색 파라미터를 업무 목록 필터 모델(keyword/status/sort/page)로 정규화한다.
 * 처리 규칙: 허용 목록 밖 status/sort는 기본값("", DEFAULT_SORT)으로 보정한다.
 * @returns {{ keyword: string, status: string, sort: string, page: number }} 목록 조회 필터 모델
 * @updated 2026-02-27
 */
export const normalizeTasksQuery = (searchParams) => {
  const params = searchParams || {};
  const keyword = pickQueryValue(params.q).trim();

  const statusCandidate = pickQueryValue(params.status).trim().toLowerCase();
  const status = ALLOWED_STATUS.has(statusCandidate) ? statusCandidate : "";

  const sortCandidate = pickQueryValue(params.sort).trim().toLowerCase();
  const sort = ALLOWED_SORT.has(sortCandidate) ? sortCandidate : DEFAULT_SORT;

  const page = toPositiveInt(pickQueryValue(params.page), 1);

  return {
    keyword,
    status,
    sort,
    page,
  };
};

/**
 * @description 업무 목록 필터 모델을 URL query string으로 직렬화한다.
 * 처리 규칙: 기본값과 동일한 sort/page는 query에서 생략해 URL 노이즈를 줄인다.
 * @returns {string} 목록 조회에 사용할 query string
 * @updated 2026-02-27
 */
export const buildTasksQueryString = (options = {}) => {
  const {
    keyword = "",
    status = "",
    sort = DEFAULT_SORT,
    page = 1,
  } = options;
  const params = new URLSearchParams();
  const keywordText = String(keyword || "").trim();
  const statusText = String(status || "").trim().toLowerCase();
  const sortText = String(sort || DEFAULT_SORT).trim().toLowerCase();
  const pageValue = toPositiveInt(page, 1);

  if (keywordText) params.set("q", keywordText);
  if (ALLOWED_STATUS.has(statusText)) params.set("status", statusText);
  if (ALLOWED_SORT.has(sortText) && sortText !== DEFAULT_SORT) {
    params.set("sort", sortText);
  }
  if (pageValue > 1) params.set("page", String(pageValue));
  return params.toString();
};
