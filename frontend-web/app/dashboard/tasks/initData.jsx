/**
 * 파일명: dashboard/tasks/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: 업무 관리 페이지 모드/API(초기적재) 설정
 */

export const PAGE_CONFIG = {
  MODE: "CSR",
  INIT_API: {},
  API: {
    list: {
      path: "/api/v1/dashboard",
      method: "GET",
    },
    detail: {
      path: "/api/v1/dashboard/:id",
      method: "GET",
    },
  },
};
