/**
 * 파일명: sample/form/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 공개 복합 폼 샘플 페이지 엔트리
 */

import FormDemoView from "./view";
import { PAGE_MODE } from "./initData";
import LANG_KO from "./lang.ko";

export const metadata = {
  title: "Form Sample | MyWebTemplate",
  description: LANG_KO.page.metadataDescription,
};

/**
 * @description  공개 복합 폼 샘플 페이지를 렌더링한다. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const FormDemoPage = () => {
  return <FormDemoView mode={PAGE_MODE} />;
};

export default FormDemoPage;
