/**
 * 파일명: reset-password/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-07-13
 * 설명: 비밀번호 재설정 완료 페이지 엔트리
 */

import ResetPasswordView from "./view";
import LANG_KO from "./lang.ko";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = {
  title: LANG_KO.page.metadataTitle,
  robots: {
    index: false,
    follow: false,
  },
  referrer: "no-referrer",
};

/**
 * @description query token을 클라이언트 메모리에서 처리하는 재설정 화면을 반환
 * @returns {JSX.Element}
 */
const ResetPasswordPage = () => <ResetPasswordView />;

export default ResetPasswordPage;
