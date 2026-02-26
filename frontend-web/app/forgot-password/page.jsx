/**
 * 파일명: forgot-password/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 비밀번호 찾기 페이지 엔트리
 */

import ForgotPasswordView from "./view";
import LANG_KO from "./lang.ko";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = {
  title: LANG_KO.page.metadataTitle,
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * @description ForgotPasswordPage export를 노출한다.
 */
const ForgotPasswordPage = async () => {
  return <ForgotPasswordView />;
};

export default ForgotPasswordPage;
