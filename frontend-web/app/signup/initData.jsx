/**
 * 파일명: signup/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 회원가입 페이지 초기 설정
 */

export const SIGNUP_PATH = "/api/v1/auth/signup";

export const createSignupFormModel = () => ({
  name: "",
  email: "",
  password: "",
  passwordConfirm: "",
  agreeTerms: false,
  errors: {
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    agreeTerms: "",
  },
});

