/**
 * 파일명: demo/portfolio/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 공개 데모 경로용 포트폴리오 페이지 엔트리
 */

import PortfolioView from "./view";
import { PAGE_CONTENT } from "./initData";

export const metadata = {
  title: "Portfolio | MyWebTemplate",
  description:
    "프로젝트 요약, 역할, 신뢰 포인트를 한 페이지에서 보여주는 웹 포트폴리오",
};

/**
 * @description 공개 데모 경로에서 포트폴리오 페이지를 렌더링한다.
 */
const DemoPortfolioPage = () => {
  return <PortfolioView content={PAGE_CONTENT} />;
};

export default DemoPortfolioPage;
