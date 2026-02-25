/**
 * 파일명: sample/form/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 공개 복합 폼 샘플 페이지 정적 데이터
 */

export const PAGE_MODE = {
  MODE: "CSR",
  PUBLIC_PATH: "/sample/form",
};

export const CATEGORY_OPTION_LIST = [
  { value: "", text: "분류 선택" },
  { value: "web", text: "웹개발" },
  { value: "app", text: "앱개발" },
  { value: "api", text: "API개발" },
  { value: "etc", text: "기타" },
];

export const FEATURE_CHECK_LIST = [
  { key: "login", label: "로그인" },
  { key: "board", label: "게시판" },
  { key: "payment", label: "결제" },
  { key: "chart", label: "차트" },
  { key: "admin", label: "관리자" },
];

/**
 * @description createDefaultForm 구성 데이터를 반환한다.
 * @updated 2026-02-24
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
