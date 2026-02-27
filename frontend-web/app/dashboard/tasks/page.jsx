/**
 * 파일명: dashboard/tasks/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 업무 관리 페이지 엔트리(서버 컴포넌트)
 */

import TasksView from "./view";
import { normalizeTasksQuery } from "./initData";
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
 * @description URL 검색 파라미터를 정규화해 업무 목록 초기 필터로 전달한다.
 * @returns {Promise<JSX.Element>}
 */
const TasksPage = async ({ searchParams }) => {

  const resolvedSearchParams = await searchParams;
  const initialFilter = normalizeTasksQuery(resolvedSearchParams);
  return <TasksView initialFilter={initialFilter} />;
};

export default TasksPage;
