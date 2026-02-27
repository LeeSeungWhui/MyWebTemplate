/**
 * 파일명: sample/form/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 공개 복합 폼 샘플 페이지 정적 데이터
 */

import LANG_KO from "./lang.ko";

const { initData } = LANG_KO;

export const PAGE_MODE = {
  MODE: "CSR",
  PUBLIC_PATH: "/sample/form",
};

export const CATEGORY_OPTION_LIST = initData.categoryOptions.map((item) => ({ ...item }));

export const FEATURE_CHECK_LIST = initData.featureOptions.map((item) => ({ ...item }));

/**
 * @description createDefaultForm 구성 데이터를 반환. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 입력값과 상태를 검증해 UI/데이터 흐름을 안전하게 유지한다.
 */
export const createDefaultForm = () => ({
  name: "",
  email: "",
  phone: "",
  category: "",
  startDate: "",
  endDate: "",
  budgetRange: "",
  requirement: "",
  referenceUrl: "",
  attachmentName: "",
  selectedFeatures: [],
});
