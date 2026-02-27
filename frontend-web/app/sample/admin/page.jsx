/**
 * 파일명: sample/admin/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 공개 관리자 화면 샘플 페이지 엔트리
 */

import AdminDemoView from "./view";
import { PAGE_MODE, USER_ROW_LIST } from "./initData";
import LANG_KO from "./lang.ko";

export const metadata = {
  title: "Admin Sample | MyWebTemplate",
  description: LANG_KO.page.metadataDescription,
};

/**
 * @description 공개 관리자 화면 샘플 페이지를 렌더링한다.
 * @returns {JSX.Element}
 */
const AdminDemoPage = () => {
  return <AdminDemoView mode={PAGE_MODE} initRows={USER_ROW_LIST} />;
};

export default AdminDemoPage;
