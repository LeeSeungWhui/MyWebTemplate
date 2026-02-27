/**
 * 파일명: sample/portfolio/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 공개 샘플 경로용 포트폴리오 페이지 엔트리
 */

import PortfolioView from "./view";
import { PAGE_CONTENT } from "./initData";
import LANG_KO from "./lang.ko";

export const metadata = {
  title: "Portfolio | MyWebTemplate",
  description: LANG_KO.page.metadataDescription,
};

/**
 * @description  공개 샘플 경로에서 포트폴리오 페이지를 렌더링한다. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const DemoPortfolioPage = () => {
  return <PortfolioView content={PAGE_CONTENT} />;
};

export default DemoPortfolioPage;
