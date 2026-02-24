/**
 * 파일명: portfolio/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-24
 * 설명: 레거시 공개 경로(/portfolio) 포트폴리오 페이지 엔트리
 */

import PortfolioView from "./view";
import { PAGE_MODE } from "./initData";
import { PAGE_CONTENT } from "../demo/portfolio/initData";

export const metadata = {
  title: "Portfolio | MyWebTemplate",
  description:
    "프로젝트 요약, 역할, 신뢰 포인트를 한 페이지에서 보여주는 웹 포트폴리오",
};

const PortfolioPage = () => {
  return <PortfolioView content={PAGE_CONTENT} publicPath={PAGE_MODE.PUBLIC_PATH} />;
};

export default PortfolioPage;
