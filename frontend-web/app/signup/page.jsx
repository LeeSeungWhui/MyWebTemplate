/**
 * 파일명: signup/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 회원가입 페이지 엔트리
 */

import SignupView from "./view";
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
 * @description SignupPage export를 노출한다.
 */
const SignupPage = async () => {
  return <SignupView />;
};

export default SignupPage;
