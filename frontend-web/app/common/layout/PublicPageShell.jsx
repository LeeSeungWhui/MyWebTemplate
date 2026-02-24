/**
 * 파일명: common/layout/PublicPageShell.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 공개 페이지 공통 레이아웃 셸(GNB + 컨텐츠 + 푸터)
 */

import PublicGnb from "@/app/common/layout/PublicGnb";
import PublicFooter from "@/app/common/layout/PublicFooter";

/**
 * @description 공개 페이지 공통 셸을 렌더링한다.
 * @param {{ children: React.ReactNode, contentClassName?: string }} props
 */
const PublicPageShell = (props) => {
  const { children, contentClassName = "" } = props;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <PublicGnb />
      <main className={contentClassName}>{children}</main>
      <PublicFooter />
    </div>
  );
};

export default PublicPageShell;
