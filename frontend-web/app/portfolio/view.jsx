"use client";
/**
 * 파일명: portfolio/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-24
 * 설명: 레거시 포트폴리오 경로에서 공개 포트폴리오 뷰를 재사용한다.
 */

import DemoPortfolioView from "../sample/portfolio/view";

/**
 * @description 샘플 포트폴리오 뷰를 래핑하고 공개 경로 식별용 data 속성을 주입한다.
 * @param {{ content: any, publicPath?: string }} props
 * @returns {JSX.Element}
 */
const PortfolioView = ({ content, publicPath }) => {

  return (
    <div data-public-path={publicPath}>
      <DemoPortfolioView content={content} />
    </div>
  );
};

export default PortfolioView;
