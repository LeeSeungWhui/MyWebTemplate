/**
 * 문서 목차 TableOfContents.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 컴포넌트 문서 목차
 */

const TableOfContents = () => {
  return (
    <section className="bg-white">
      <h2 className="text-xl font-semibold mb-4">목차</h2>
      <ul className="space-y-2">
        <li>
          <a href="#dataclass" className="text-blue-600 hover:text-blue-800">1. 데이터 클래스 (Data Class)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#dataclass-easyobj" className="text-blue-600 hover:text-blue-800">- EasyObj</a></li>
            <li><a href="#dataclass-easylist" className="text-blue-600 hover:text-blue-800">- EasyList</a></li>
          </ul>
        </li>

        <li>
          <a href="#buttons" className="text-blue-600 hover:text-blue-800">2. 버튼 (Button)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#button-variants" className="text-blue-600 hover:text-blue-800">- 버튼 종류</a></li>
            <li><a href="#button-sizes" className="text-blue-600 hover:text-blue-800">- 버튼 크기</a></li>
          </ul>
        </li>

        <li>
          <a href="#inputs" className="text-blue-600 hover:text-blue-800">3. 입력 (Input)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#input-basic" className="text-blue-600 hover:text-blue-800">- 기본 입력</a></li>
            <li><a href="#input-mask" className="text-blue-600 hover:text-blue-800">- 마스킹 입력</a></li>
            <li><a href="#input-filter" className="text-blue-600 hover:text-blue-800">- 필터 입력</a></li>
          </ul>
        </li>

        <li>
          <a href="#selects" className="text-blue-600 hover:text-blue-800">4. 선택 (Select)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#select-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용</a></li>
            <li><a href="#select-states" className="text-blue-600 hover:text-blue-800">- 상태</a></li>
          </ul>
        </li>

        <li>
          <a href="#checkboxes" className="text-blue-600 hover:text-blue-800">5. 체크박스 (Checkbox)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#checkbox-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용</a></li>
            <li><a href="#checkbox-variants" className="text-blue-600 hover:text-blue-800">- 모양 변형</a></li>
          </ul>
        </li>

        <li>
          <a href="#checkbuttons" className="text-blue-600 hover:text-blue-800">6. 체크버튼 (CheckButton)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#checkbutton-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용</a></li>
            <li><a href="#checkbutton-variants" className="text-blue-600 hover:text-blue-800">- 모양 변형</a></li>
          </ul>
        </li>

        <li>
          <a href="#radioboxes" className="text-blue-600 hover:text-blue-800">7. 라디오박스 (Radiobox)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#radiobox-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용</a></li>
            <li><a href="#radiobox-variants" className="text-blue-600 hover:text-blue-800">- 모양 변형</a></li>
          </ul>
        </li>

        <li>
          <a href="#radio-buttons" className="text-blue-600 hover:text-blue-800">8. 라디오버튼 (RadioButton)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#radio-button-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용</a></li>
            <li><a href="#radio-button-variants" className="text-blue-600 hover:text-blue-800">- 모양 변형</a></li>
          </ul>
        </li>

        <li>
          <a href="#icons" className="text-blue-600 hover:text-blue-800">9. 아이콘 (Icon)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#icon-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용</a></li>
          </ul>
        </li>

        <li>
          <a href="#loading" className="text-blue-600 hover:text-blue-800">10. 로딩 (Loading)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#loading-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용</a></li>
          </ul>
        </li>

        <li>
          <a href="#alerts" className="text-blue-600 hover:text-blue-800">11. 알림 (Alert)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#alert-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용</a></li>
            <li><a href="#alert-types" className="text-blue-600 hover:text-blue-800">- 알림 유형</a></li>
          </ul>
        </li>

        <li>
          <a href="#editors" className="text-blue-600 hover:text-blue-800">31. 리치 에디터 (EasyEditor)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#editor-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용</a></li>
            <li><a href="#editor-bound" className="text-blue-600 hover:text-blue-800">- EasyObj 바인딩</a></li>
            <li><a href="#editor-controlled" className="text-blue-600 hover:text-blue-800">- 컨트롤드 / HTML 직렬화</a></li>
          </ul>
        </li>

        <li>
          <a href="#pdfviewer" className="text-blue-600 hover:text-blue-800">32. PDF 뷰어 (PdfViewer)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#pdf-basic" className="text-blue-600 hover:text-blue-800">- 기본</a></li>
            <li><a href="#pdf-local" className="text-blue-600 hover:text-blue-800">- 로컬 파일</a></li>
            <li><a href="#pdf-remote" className="text-blue-600 hover:text-blue-800">- 원격 URL</a></li>
          </ul>
        </li>
      </ul>
    </section>
  );
};

export default TableOfContents;

