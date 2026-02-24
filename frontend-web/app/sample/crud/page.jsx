/**
 * 파일명: demo/crud/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 공개 CRUD 샘플 페이지 엔트리
 */

import CrudDemoView from "./view";
import { DEMO_DATA_LIST, PAGE_MODE } from "./initData";

export const metadata = {
  title: "CRUD Sample | MyWebTemplate",
  description: "공개 CRUD 샘플 화면",
};

/**
 * @description 공개 CRUD 샘플 페이지를 렌더링한다.
 */
const CrudDemoPage = () => {
  return <CrudDemoView mode={PAGE_MODE} initRows={DEMO_DATA_LIST} />;
};

export default CrudDemoPage;
