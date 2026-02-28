/**
 * 파일명: dashboard/tasks/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-28
 * 설명: 업무 관리 페이지 모드/API 설정
 */

export const PAGE_CONFIG = {
  MODE: "CSR",
  API: {
    list: "/api/v1/dashboard",
    detail: "/api/v1/dashboard/:id",
    create: "/api/v1/dashboard",
    update: "/api/v1/dashboard/:id",
    remove: "/api/v1/dashboard/:id",
  },
};
