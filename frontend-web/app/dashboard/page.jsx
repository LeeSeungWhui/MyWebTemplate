/**
 * 파일명: dashboard/page.jsx
 * 작성자: Codex
 * 갱신일: 2025-11-27
 * 설명: 대시보드 페이지 엔트리(서버 컴포넌트)
 */

import DashboardView from "./view";
import { PAGE_MODE } from "./initData";
import { apiJSON } from "@/app/lib/runtime/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const fetchInitial = async () => {
  const endpoints = PAGE_MODE.endPoints || {};
  if (!endpoints.stats || !endpoints.list) {
    console.error("대시보드 엔드포인트가 설정되지 않았습니다.");
    return { statList: [], dataList: [], error: "ENDPOINT_MISSING" };
  }
  try {
    const [stats, list] = await Promise.all([
      apiJSON(endpoints.stats),
      apiJSON(endpoints.list),
    ]);
    return {
      statList: stats?.result?.byStatus || [],
      dataList: list?.result?.items || [],
      error: null,
    };
  } catch (error) {
    console.error("대시보드 초기 데이터 조회 실패", error);
    return { statList: [], dataList: [], error: "INIT_FETCH_FAILED" };
  }
};

const DashboardPage = async () => {
  const initialData = PAGE_MODE.MODE === "SSR" ? await fetchInitial() : { statList: [], dataList: [], error: null };
  return (
    <DashboardView
      statList={initialData.statList}
      dataList={initialData.dataList}
      initialError={initialData.error}
    />
  );
};

export default DashboardPage;
