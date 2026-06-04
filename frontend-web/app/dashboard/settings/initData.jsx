/**
 * 파일명: dashboard/settings/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: 설정 페이지 모드/API(초기적재) 설정
 */

export const PAGE_CONFIG = {
  MODE: "CSR",
  INIT_API: {
    profileMe: {
      path: "/api/v1/profile/me",
      method: "GET",
    },
  },
  API: {
    profileMe: {
      path: "/api/v1/profile/me",
      method: "GET",
    },
    settingsUpdate: {
      path: "/api/v1/sample/admin/settings",
      method: "PUT",
    },
  },
};
