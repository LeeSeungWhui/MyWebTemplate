/**
 * 파일명: component/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-24
 * 설명: 컴포넌트 문서 페이지 엔트리(서버 컴포넌트)
 */
import ComponentsView from "./view";
import { PAGE_MODE } from "./initData";

/**
 * @description 컴포넌트 문서 화면을 서버 엔트리에서 반환. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const ComponentsPage = () => {
  return <ComponentsView pageMode={PAGE_MODE.MODE} />;
};

export default ComponentsPage
