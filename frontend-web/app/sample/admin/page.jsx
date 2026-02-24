/**
 * 파일명: demo/admin/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 공개 관리자 화면 샘플 페이지 엔트리
 */

import AdminDemoView from "./view";
import { PAGE_MODE, USER_ROW_LIST } from "./initData";

export const metadata = {
  title: "Admin Sample | MyWebTemplate",
  description: "공개 관리자 화면 샘플",
};

/**
 * @description 공개 관리자 화면 샘플 페이지를 렌더링한다.
 */
const AdminDemoPage = () => {
  return <AdminDemoView mode={PAGE_MODE} initRows={USER_ROW_LIST} />;
};

export default AdminDemoPage;
