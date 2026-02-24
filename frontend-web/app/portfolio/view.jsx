"use client";
/**
 * 파일명: portfolio/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-24
 * 설명: 레거시 포트폴리오 경로에서 공개 포트폴리오 뷰를 재사용한다.
 */

import DemoPortfolioView from "../sample/portfolio/view";

const PortfolioView = ({ content, publicPath }) => {
  return (
    <div data-public-path={publicPath}>
      <DemoPortfolioView content={content} />
    </div>
  );
};

export default PortfolioView;
