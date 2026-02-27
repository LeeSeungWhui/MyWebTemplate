/**
 * 파일명: dashboard/settings/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 설정 페이지 엔트리(서버 컴포넌트)
 */

import SettingsView from "./view";
import LANG_KO from "./lang.ko";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
export const fetchCache = "only-no-store";
export const metadata = {
  title: LANG_KO.page.metadataTitle,
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * @description 설정 화면 서버 엔트리에서 SettingsView를 반환한다.
 * @returns {Promise<JSX.Element>}
 */
const SettingsPage = async () => {
  return <SettingsView />;
};

export default SettingsPage;
