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

const pickQueryValue = (rawValue) => {
  if (Array.isArray(rawValue)) return String(rawValue[0] || "");
  if (typeof rawValue === "string") return rawValue;
  if (rawValue == null) return "";
  return String(rawValue);
};

const toPositiveInt = (rawValue, defaultValue = 1) => {
  const parsed = Number.parseInt(String(rawValue || ""), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return defaultValue;
  return parsed;
};

/**
 * @description normalizeTasksQuery 구성 데이터를 반환한다.
 * @updated 2026-02-24
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

export const buildTasksQueryString = ({
  keyword = "",
  status = "",
  sort = DEFAULT_SORT,
  page = 1,
} = {}) => {
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
