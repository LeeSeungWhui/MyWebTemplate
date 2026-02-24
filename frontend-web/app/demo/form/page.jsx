/**
 * 파일명: demo/form/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 공개 복합 폼 데모 페이지 엔트리
 */

import FormDemoView from "./view";
import { PAGE_MODE } from "./initData";

export const metadata = {
  title: "Form Demo | MyWebTemplate",
  description: "공개 복합 폼 데모 화면",
};

/**
 * @description 공개 복합 폼 데모 페이지를 렌더링한다.
 */
const FormDemoPage = () => {
  return <FormDemoView mode={PAGE_MODE} />;
};

export default FormDemoPage;
