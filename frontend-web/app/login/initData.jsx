/**
 * 파일명: initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-28
 * 설명: 로그인 페이지 모드/API 설정
 */

export const PAGE_CONFIG = {
  MODE: "SSR",
  API: {
    session: {
      path: "/api/v1/auth/me",
      method: "GET",
      authless: true,
    },
  },
};
