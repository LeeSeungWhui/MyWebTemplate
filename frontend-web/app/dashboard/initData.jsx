/**
 * 파일명: dashboard/initData.jsx
 * 작성자: LSH
 * 갱신일: 2025-11-27
 * 설명: 대시보드 페이지 초기 설정
 */

export const PAGE_MODE = {
  MODE: "SSR",
  dynamic: "force-dynamic",
  runtime: "nodejs",
  revalidate: 0,
  fetchCache: "only-no-store",
  endPoints: {
    stats: "/api/v1/dashboard/stats",
    list: "/api/v1/dashboard",
  },
};

export const PAGE_CONFIG = {
  MODE: "SSR",
  API: {
    stats: "/api/v1/dashboard/stats",
    list: "/api/v1/dashboard",
  },
};
