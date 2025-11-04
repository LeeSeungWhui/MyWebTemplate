/**
 * 파일명: TableOfContents.jsx
 * 작성자: Codex
 * 갱신일: 2025-11-04
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
        </li>

        <li>
          <a href="#checkbuttons" className="text-blue-600 hover:text-blue-800">6. 체크버튼 (CheckButton)</a>
        </li>

        <li>
          <a href="#radioboxes" className="text-blue-600 hover:text-blue-800">7. 라디오박스 (Radiobox)</a>
        </li>

        <li>
          <a href="#radio-buttons" className="text-blue-600 hover:text-blue-800">8. 라디오버튼 (RadioButton)</a>
        </li>

        <li>
          <a href="#icons" className="text-blue-600 hover:text-blue-800">9. 아이콘 (Icon)</a>
        </li>

        <li>
          <a href="#loading" className="text-blue-600 hover:text-blue-800">10. 로딩 (Loading)</a>
        </li>

        <li>
          <a href="#alerts" className="text-blue-600 hover:text-blue-800">11. 알림 (Alert)</a>
        </li>

        <li><a href="#confirms" className="text-blue-600 hover:text-blue-800">12. 확인 (Confirm)</a></li>
        <li><a href="#toasts" className="text-blue-600 hover:text-blue-800">13. 토스트 (Toast)</a></li>
        <li><a href="#modals" className="text-blue-600 hover:text-blue-800">14. 모달 (Modal)</a></li>
        <li><a href="#tabs" className="text-blue-600 hover:text-blue-800">15. 탭 (Tab)</a></li>
        <li><a href="#switches" className="text-blue-600 hover:text-blue-800">16. 스위치 (Switch)</a></li>
        <li><a href="#textareas" className="text-blue-600 hover:text-blue-800">17. 텍스트영역 (Textarea)</a></li>
        <li><a href="#cards" className="text-blue-600 hover:text-blue-800">18. 카드 (Card)</a></li>
        <li><a href="#badges" className="text-blue-600 hover:text-blue-800">19. 배지 (Badge)</a></li>
        <li><a href="#number-inputs" className="text-blue-600 hover:text-blue-800">20. 숫자 입력 (NumberInput)</a></li>
        <li><a href="#datetime-inputs" className="text-blue-600 hover:text-blue-800">21. 날짜/시간 (Date/Time)</a></li>
        <li><a href="#comboboxes" className="text-blue-600 hover:text-blue-800">22. 콤보박스 (Combobox)</a></li>
        <li><a href="#tooltips" className="text-blue-600 hover:text-blue-800">23. 툴팁 (Tooltip)</a></li>
        <li><a href="#drawers" className="text-blue-600 hover:text-blue-800">24. 드로어 (Drawer)</a></li>
        <li><a href="#skeletons" className="text-blue-600 hover:text-blue-800">25. 스켈레톤 (Skeleton)</a></li>
        <li><a href="#empties" className="text-blue-600 hover:text-blue-800">26. 빈 상태 (Empty)</a></li>
        <li><a href="#tables" className="text-blue-600 hover:text-blue-800">27. 테이블 (Table)</a></li>
        <li><a href="#pagination" className="text-blue-600 hover:text-blue-800">28. 페이지네이션 (Pagination)</a></li>
        <li><a href="#dropdowns" className="text-blue-600 hover:text-blue-800">29. 드롭다운 (Dropdown)</a></li>
        <li><a href="#stats" className="text-blue-600 hover:text-blue-800">30. 통계 (Stat)</a></li>

        <li>
          <a href="#editors" className="text-blue-600 hover:text-blue-800">31. 리치 에디터 (EasyEditor)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#editor-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용</a></li>
            <li><a href="#editor-bound" className="text-blue-600 hover:text-blue-800">- EasyObj 바인딩</a></li>
            <li><a href="#editor-controlled" className="text-blue-600 hover:text-blue-800">- 컨트롤드 / HTML 직렬화</a></li>
            <li><a href="#editor-states" className="text-blue-600 hover:text-blue-800">- 상태 매트릭스</a></li>
          </ul>
        </li>

        <li>
          <a href="#pdfviewer" className="text-blue-600 hover:text-blue-800">32. PDF 뷰어 (PdfViewer)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#pdf-basic" className="text-blue-600 hover:text-blue-800">- 기본</a></li>
            <li><a href="#pdf-local" className="text-blue-600 hover:text-blue-800">- 로컬 파일</a></li>
            <li><a href="#pdf-remote" className="text-blue-600 hover:text-blue-800">- 원격 URL</a></li>
            <li><a href="#pdf-no-toolbar" className="text-blue-600 hover:text-blue-800">- 툴바 비활성화</a></li>
            <li><a href="#pdf-error" className="text-blue-600 hover:text-blue-800">- 오류 상태</a></li>
          </ul>
        </li>
      </ul>
    </section>
  );
};

export default TableOfContents;
