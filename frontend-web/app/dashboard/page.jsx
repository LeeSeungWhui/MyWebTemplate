/**
 * 파일명: dashboard/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 대시보드 페이지 엔트리(서버 컴포넌트)
 */

import DashboardView from "./view";
import { PAGE_MODE } from "./initData";
import {
  buildDashboardInitialData,
  DASHBOARD_ERROR_KEY,
} from "./dataStrategy";
import { apiJSON } from "@/app/lib/runtime/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;
export const fetchCache = "only-no-store";
export const metadata = {
  title: "Dashboard | MyWebTemplate",
  robots: {
    index: false,
    follow: false,
  },
};

const DashboardPage = async () => {
  const initialData = await buildDashboardInitialData({
    mode: PAGE_MODE.MODE,
    endPoints: PAGE_MODE.endPoints,
    fetcher: apiJSON,
  });
  if (initialData?.error?.key === DASHBOARD_ERROR_KEY.ENDPOINT_MISSING) {
    console.error("대시보드 엔드포인트가 설정되지 않았습니다.");
  }
  if (initialData?.error?.key === DASHBOARD_ERROR_KEY.INIT_FETCH_FAILED) {
    console.error("대시보드 초기 데이터 조회 실패", initialData.error);
  }
  return (
    <DashboardView
      statList={initialData.statList}
      dataList={initialData.dataList}
      initialError={initialData.error}
    />
  );
};

export default DashboardPage;
