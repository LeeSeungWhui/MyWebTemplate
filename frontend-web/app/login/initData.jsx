/**
 * 파일명: initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-03
 * 설명: 로그인 페이지 모드/API(초기적재) 설정
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
