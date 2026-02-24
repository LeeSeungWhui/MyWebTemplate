/**
 * 파일명: dashboard/settings/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 설정 페이지 엔트리(서버 컴포넌트)
 */

import SettingsView from "./view";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
export const fetchCache = "only-no-store";
export const metadata = {
  title: "Dashboard Settings | MyWebTemplate",
  robots: {
    index: false,
    follow: false,
  },
};

const SettingsPage = async () => {
  return <SettingsView />;
};

export default SettingsPage;
