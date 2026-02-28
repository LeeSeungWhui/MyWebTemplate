/**
 * 파일명: sample/crud/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 공개 CRUD 샘플 페이지 정적 데이터
 */

import LANG_KO from "./lang.ko";

const { initData } = LANG_KO;

export const PAGE_MODE = {
  MODE: "CSR",
  PUBLIC_PATH: "/sample/crud",
};

export const STATUS_FILTER_LIST = initData.statusFilterList.map((item) => ({ ...item }));
export const DEMO_DATA_LIST = initData.rowList.map((item) => ({ ...item }));

export const PAGE_CONFIG = {
  MODE: "CSR",
  API: {},
};
