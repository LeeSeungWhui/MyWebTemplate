/**
 * 파일명: sample/dashboard/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 공개 샘플 대시보드 페이지 엔트리
 */

import DemoDashboardView from "./view";
import {
  CTA_LINK_LIST,
  PAGE_MODE,
} from "./initData";
import { DEMO_DATA_LIST } from "@/app/sample/crud/initData";
import LANG_KO from "./lang.ko";

export const metadata = {
  title: "Sample Dashboard | MyWebTemplate",
  description: LANG_KO.page.metadataDescription,
};

/**
 * @description 공개 샘플 대시보드 페이지를 렌더링한다.
 * @returns {JSX.Element}
 */
const DemoDashboardPage = () => {
  return (
    <DemoDashboardView
      mode={PAGE_MODE}
      initRows={DEMO_DATA_LIST}
      ctaList={CTA_LINK_LIST}
    />
  );
};

export default DemoDashboardPage;
