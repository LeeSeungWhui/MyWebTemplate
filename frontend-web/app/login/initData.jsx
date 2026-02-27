/**
 * 파일명: initData.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 로그인 초기 데이터 엔드포인트
 */
// 한글설명: Endpoints for initial (SEO-friendly) data fetch on login
export const SESSION_PATH = '/api/v1/auth/me'

/**
 * @description createLoginFormModel 구성 데이터를 반환한다.
 * @updated 2026-02-24
 */
export const createLoginFormModel = () => ({
  email: '',
  password: '',
  rememberMe: false,
  errors: {
    email: '',
    password: '',
  },
})

// 한글설명: Default client-side configuration (CSR)
export const CLIENT_ONLY_MODE = {
  MODE: 'CSR',
  init: null,
  nextHint: null,
}
