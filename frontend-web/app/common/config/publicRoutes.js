/**
 * 파일명: publicRoutes.js
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 인증 불필요(공개) 경로 목록과 판별 유틸
 */

// 공개 경로 패턴 목록
// 규칙:
// - 정확 경로: '/login'
// - 서브트리 포함: '/docs/:path*' (Next matcher 스타일 지원)
// - 공개 퍼널은 '/' + '/sample/*'를 기본으로 유지한다.
export const publicRoutes = [
  "/",
  "/sample",
  "/login",
  "/signup",
  "/forgot-password",
  "/sample/:path*",
  "/component",
];

/**
 * 설명: Next matcher 스타일 패턴을 RegExp로 변환
 * 지원: '/path', '/path/:path*', '/path/:path+' (접미부 전용)
 */
function compilePattern(pat) {
  if (pat === "/") return /^\/$/;
  // 한글설명: escape regex specials
  const esc = pat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // 한글설명: handle :path* or :path+
  if (esc.endsWith("\/:path\\*")) {
    const base = esc.slice(0, -"\/:path\\*".length);
    return new RegExp("^" + base + "(?:\/.*)?$");
  }
  if (esc.endsWith("\/:path\\+")) {
    const base = esc.slice(0, -"\/:path\\+".length);
    return new RegExp("^" + base + "\/.+$");
  }
  return new RegExp("^" + esc + "$");
}

const compiled = publicRoutes.map(compilePattern);

/**
 * 설명: 주어진 pathname이 공개 경로인지 판별한다.
 * 처리 규칙: 문자열이 아니면 false를 반환하고, 등록된 정규식 패턴 중 하나라도 일치하면 true를 반환한다.
 * 반환값: 공개 경로 여부(boolean)
 */
export function isPublicPath(pathname) {
  if (!pathname || typeof pathname !== "string") return false;
  for (const re of compiled) {
    if (re.test(pathname)) return true;
  }
  return false;
}
