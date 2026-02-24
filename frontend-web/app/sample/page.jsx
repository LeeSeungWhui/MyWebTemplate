/**
 * 파일명: demo/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 공개 샘플 허브 페이지 엔트리
 */

import DemoHubView from "./view";
import { PAGE_MODE } from "./initData";

export const metadata = {
  title: "Sample Hub | MyWebTemplate",
  description: "공개 샘플 허브",
};

export const dynamic = "force-static";
export const runtime = "nodejs";
export const revalidate = 0;

/**
 * @description 공개 샘플 허브 페이지를 렌더링한다.
 */
const DemoHubPage = () => {
  return <DemoHubView mode={PAGE_MODE} />;
};

export default DemoHubPage;
