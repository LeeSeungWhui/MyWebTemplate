"use client";
/**
 * 파일명: portfolio/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-24
 * 설명: 레거시 포트폴리오 경로에서 공개 포트폴리오 뷰를 재사용
 */

import DemoPortfolioView from "../sample/portfolio/view";
import { usePageData } from "@/app/lib/hooks/usePageData";
import { PAGE_CONFIG } from "./initData";

/**
 * @description 샘플 포트폴리오 뷰를 래핑하고 공개 경로 식별용 data 속성을 주입
 * @returns {JSX.Element}
 */
const PortfolioView = ({ initialDataObj = {}, initialErrorObj = {} }) => {
  usePageData({
    pageConfig: PAGE_CONFIG,
    initialDataObj,
    initialErrorObj,
    auto: false,
  });

  return (
    <div data-public-path="/portfolio">
      <DemoPortfolioView />
    </div>
  );
};

export default PortfolioView;
