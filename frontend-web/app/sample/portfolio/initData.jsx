/**
 * 파일명: sample/portfolio/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-24
 * 설명: 공개 샘플 포트폴리오 페이지 정적 데이터
 */

import LANG_KO from "./lang.ko";

export const PAGE_MODE = {
  MODE: "STATIC",
  PUBLIC_PATH: "/sample/portfolio",
};

export const PAGE_CONTENT = { ...LANG_KO.initData.content };
