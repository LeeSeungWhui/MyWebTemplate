/**
 * 파일명: sample/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 공개 샘플 허브 페이지 정적 데이터
 */

import LANG_KO from "./lang.ko";

const { initData } = LANG_KO;

export const PAGE_MODE = {
  MODE: "STATIC",
  PUBLIC_PATH: "/sample",
};

export const DEMO_HUB_HEADER = {
  title: initData.header.title,
  subtitle: initData.header.subtitle,
};

export const DEMO_HUB_CARD_LIST = initData.cardList.map((item) => ({ ...item }));

export const DEMO_HUB_EXTRA_LINK_LIST = initData.extraLinkList.map((item) => ({ ...item }));

export const PAGE_CONFIG = {
  MODE: "CSR",
  API: {},
};
