/**
 * 파일명: dashboard/initData.jsx
 * 작성자: Codex
 * 갱신일: 2025-11-27
 * 설명: 대시보드 페이지 초기 설정
 */

export const PAGE_MODE = {
  MODE: "SSR",
  revalidate: 0,
  cache: "no-store",
  endPoints: {
    stats: "/api/v1/dashboard/stats",
    list: "/api/v1/dashboard/list",
  },
};
