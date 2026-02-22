/**
 * 파일명: portfolio/page.jsx
 * 작성자: Codex
 * 갱신일: 2026-02-22
 * 설명: 공개 포트폴리오 페이지 엔트리
 */

import PortfolioView from './view'
import { PAGE_CONTENT, PAGE_MODE } from './initData'

export const metadata = {
  title: 'Portfolio | MyWebTemplate',
  description: '프로젝트 요약, 역할, 신뢰 포인트를 한 페이지에서 보여주는 웹 포트폴리오',
}

const PortfolioPage = () => {
  return <PortfolioView mode={PAGE_MODE} content={PAGE_CONTENT} />
}

export default PortfolioPage
