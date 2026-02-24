/**
 * 파일명: app/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 루트 페이지 서버 엔트리
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import HomeView from "@/app/view";

/**
 * @description 공개 랜딩 화면을 렌더링한다.
 * @note 인증 분기는 middleware.js에서 단일 처리한다.
 */
const HomePage = () => {
  return <HomeView />;
};

export default HomePage;
