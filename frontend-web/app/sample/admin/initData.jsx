/**
 * 파일명: sample/admin/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 공개 관리자 화면 샘플 페이지 정적 데이터
 */

import LANG_KO from "./lang.ko";

const { initData } = LANG_KO;

export const PAGE_MODE = {
  MODE: "CSR",
  PUBLIC_PATH: "/sample/admin",
};

export const TAB_LIST = initData.tabList.map((item) => ({ ...item }));

export const ROLE_OPTION_LIST = initData.roleOptions.map((item) => ({ ...item }));

export const STATUS_OPTION_LIST = initData.statusOptions.map((item) => ({ ...item }));

export const USER_ROW_LIST = initData.userRows.map((item) => ({ ...item }));
