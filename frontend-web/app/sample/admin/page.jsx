/**
 * 파일명: sample/admin/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 공개 관리자 화면 샘플 페이지 엔트리
 */

import AdminDemoView from "./view";
import { PAGE_CONFIG } from "./initData";
import { loadServerPageData } from "@/app/lib/runtime/pageData";
import LANG_KO from "./lang.ko";

export const metadata = {
  title: "Admin Sample | MyWebTemplate",
  description: LANG_KO.page.metadataDescription,
};

/**
 * @description 공개 관리자 화면 샘플 페이지를 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const AdminDemoPage = async () => {
  const { dataObj: initialDataObj, errorObj: initialErrorObj } = await loadServerPageData({
    pageConfig: PAGE_CONFIG,
  });
  return (
    <AdminDemoView
      initialDataObj={initialDataObj}
      initialErrorObj={initialErrorObj}
    />
  );
};

export default AdminDemoPage;
