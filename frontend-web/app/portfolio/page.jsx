/**
 * 파일명: portfolio/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-24
 * 설명: 레거시 공개 경로(/portfolio) 포트폴리오 페이지 엔트리
 */

import PortfolioView from "./view";
import { PAGE_MODE } from "./initData";
import { PAGE_CONTENT } from "../sample/portfolio/initData";
import LANG_KO from "./lang.ko";

export const metadata = {
  title: "Portfolio | MyWebTemplate",
  description: LANG_KO.page.metadataDescription,
};

/**
 * @description 레거시 공개 경로에서 포트폴리오 콘텐츠를 재사용 뷰로 전달
 * @returns {JSX.Element}
 */
const PortfolioPage = () => {
  return <PortfolioView content={PAGE_CONTENT} publicPath={PAGE_MODE.PUBLIC_PATH} />;
};

export default PortfolioPage;
