/**
 * 파일명: sample/layout.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 공개 샘플 공통 레이아웃 엔트리
 */

import DemoLayoutClient from "./DemoLayoutClient";

/**
 * @description 공개 샘플 하위 페이지 공통 레이아웃을 렌더링한다.
 * @param {{ children: React.ReactNode }} props
 */
const DemoLayout = (props) => {
  const { children } = props;
  return <DemoLayoutClient>{children}</DemoLayoutClient>;
};

export default DemoLayout;
