/**
 * 파일명: initData.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 로그인 초기 데이터 엔드포인트
 */
// 한글설명: 설명 Endpoints for initial (SEO-friendly) data fetch on login
export const SESSION_PATH = '/api/v1/auth/me'

// 한글설명: 설명 Default client-side configuration (CSR)
export const CLIENT_ONLY_MODE = {
  MODE: 'CSR',
  init: null,
  nextHint: null,
}
