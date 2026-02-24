/**
 * 파일명: app/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 루트 페이지 서버 엔트리
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { redirect } from "next/navigation";
import { apiJSON } from "@/app/lib/runtime/api";
import { HOME_INIT_DATA } from "@/app/initData";
import HomeView from "@/app/view";

/**
 * @description 인증 상태를 확인하고 랜딩 또는 대시보드로 분기한다.
 */
const HomePage = async () => {
  const sessionPayload = await apiJSON(HOME_INIT_DATA.sessionPath, {
    method: "GET",
  }).catch(() => null);
  const hasUserSession = Boolean(sessionPayload?.result?.username);
  if (hasUserSession) {
    redirect("/dashboard");
  }
  return <HomeView />;
};

export default HomePage;
