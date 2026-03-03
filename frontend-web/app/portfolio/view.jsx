"use client";
/**
 * 파일명: portfolio/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-03
 * 설명: 공개 포트폴리오 경로에서 샘플 포트폴리오 뷰를 재사용
 */

import DemoPortfolioView from "../sample/portfolio/view";
import { PAGE_CONFIG } from "./initData";
import { normalizePageConfig } from "@/app/lib/runtime/pageData";
import { usePageData } from "@/app/lib/hooks/usePageData";

/**
 * @description 샘플 포트폴리오 뷰를 래핑하고 공개 경로 식별용 data 속성을 주입
 * @returns {JSX.Element}
 */
const PortfolioView = ({ initialDataObj, initialErrorObj }) => {
  const pageMode = normalizePageConfig(PAGE_CONFIG).MODE;
  usePageData({
    pageConfig: PAGE_CONFIG,
    initialDataObj,
    initialErrorObj,
  });

  return (
    <div data-public-path="/portfolio" data-page-mode={pageMode}>
      <DemoPortfolioView />
    </div>
  );
};

export default PortfolioView;
