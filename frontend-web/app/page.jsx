/**
 * 파일명: app/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 루트 페이지 서버 엔트리
 */

import HomeView from "@/app/view";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

/**
 * @description  공개 랜딩 화면을 렌더링한다. 입력/출력 계약을 함께 명시
 * @note 인증 분기는 middleware.js에서 단일 처리한다.
 * @returns {JSX.Element}
 */
const HomePage = () => {
  return <HomeView />;
};

export default HomePage;
