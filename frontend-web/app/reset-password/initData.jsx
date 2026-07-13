/**
 * 파일명: reset-password/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-07-13
 * 설명: 비밀번호 재설정 완료 페이지 초기 설정
 */

export const PAGE_CONFIG = {
  MODE: "CSR",
  INIT_API: {},
  API: {
    completePasswordReset: {
      path: "/api/v1/auth/passwordResetComplete",
      method: "POST",
      authless: true,
    },
  },
};
