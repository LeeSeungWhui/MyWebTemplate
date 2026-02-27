/**
 * 파일명: sample/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 공개 샘플 허브 페이지 엔트리
 */

import DemoHubView from "./view";
import { PAGE_MODE } from "./initData";
import LANG_KO from "./lang.ko";

export const metadata = {
  title: "Sample Hub | MyWebTemplate",
  description: LANG_KO.page.metadataDescription,
};

export const dynamic = "force-static";
export const runtime = "nodejs";
export const revalidate = 0;

/**
 * @description 공개 샘플 허브 페이지를 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const DemoHubPage = () => {
  return <DemoHubView mode={PAGE_MODE} />;
};

export default DemoHubPage;
