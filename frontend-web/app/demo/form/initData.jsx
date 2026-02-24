/**
 * 파일명: demo/form/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 공개 복합 폼 데모 페이지 정적 데이터
 */

export const PAGE_MODE = {
  MODE: "CSR",
  PUBLIC_PATH: "/demo/form",
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
