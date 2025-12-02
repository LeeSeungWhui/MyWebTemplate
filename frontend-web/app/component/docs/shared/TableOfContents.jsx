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
            <li><a href="#input-advanced" className="text-blue-600 hover:text-blue-800">- 고급 입력</a></li>
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
            <li><a href="#checkbox-variants" className="text-blue-600 hover:text-blue-800">- 변형</a></li>
          </ul>
        </li>

        <li>
          <a href="#checkbuttons" className="text-blue-600 hover:text-blue-800">6. 체크버튼 (CheckButton)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#checkbutton-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용</a></li>
            <li><a href="#checkbutton-variants" className="text-blue-600 hover:text-blue-800">- 변형</a></li>
          </ul>
        </li>

        <li>
          <a href="#radioboxes" className="text-blue-600 hover:text-blue-800">7. 라디오박스 (Radiobox)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#radiobox-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용</a></li>
            <li><a href="#radiobox-variants" className="text-blue-600 hover:text-blue-800">- 변형</a></li>
          </ul>
        </li>

        <li>
          <a href="#radiobuttons" className="text-blue-600 hover:text-blue-800">8. 라디오버튼 (RadioButton)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#radiobutton-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용</a></li>
            <li><a href="#radiobutton-variants" className="text-blue-600 hover:text-blue-800">- 변형</a></li>
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
            <li><a href="#alert-types" className="text-blue-600 hover:text-blue-800">- 유형</a></li>
            <li><a href="#alert-callback" className="text-blue-600 hover:text-blue-800">- 콜백</a></li>
            <li><a href="#alert-focus" className="text-blue-600 hover:text-blue-800">- 포커스</a></li>
          </ul>
        </li>

        <li>
          <a href="#confirms" className="text-blue-600 hover:text-blue-800">12. 확인 (Confirm)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#confirm-basic" className="text-blue-600 hover:text-blue-800">- 기본</a></li>
            <li><a href="#confirm-types" className="text-blue-600 hover:text-blue-800">- 유형</a></li>
            <li><a href="#confirm-callback" className="text-blue-600 hover:text-blue-800">- 콜백</a></li>
            <li><a href="#confirm-focus" className="text-blue-600 hover:text-blue-800">- 포커스</a></li>
          </ul>
        </li>

        <li>
          <a href="#toasts" className="text-blue-600 hover:text-blue-800">13. 토스트 (Toast)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#toast-basic" className="text-blue-600 hover:text-blue-800">- 기본</a></li>
            <li><a href="#toast-types" className="text-blue-600 hover:text-blue-800">- 유형</a></li>
            <li><a href="#toast-positions" className="text-blue-600 hover:text-blue-800">- 위치</a></li>
            <li><a href="#toast-duration" className="text-blue-600 hover:text-blue-800">- 지속시간</a></li>
          </ul>
        </li>

        <li>
          <a href="#modals" className="text-blue-600 hover:text-blue-800">14. 모달 (Modal)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#modal-basic" className="text-blue-600 hover:text-blue-800">- 기본</a></li>
            <li><a href="#modal-sizes" className="text-blue-600 hover:text-blue-800">- 크기</a></li>
            <li><a href="#modal-form" className="text-blue-600 hover:text-blue-800">- 폼</a></li>
            <li><a href="#modal-drag" className="text-blue-600 hover:text-blue-800">- 드래그</a></li>
            <li><a href="#modal-position" className="text-blue-600 hover:text-blue-800">- 위치 지정</a></li>
          </ul>
        </li>

        <li>
          <a href="#tabs" className="text-blue-600 hover:text-blue-800">15. 탭 (Tab)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#tab-basic" className="text-blue-600 hover:text-blue-800">- 기본</a></li>
            <li><a href="#tab-controlled" className="text-blue-600 hover:text-blue-800">- 컨트롤드</a></li>
            <li><a href="#tab-styled" className="text-blue-600 hover:text-blue-800">- 스타일</a></li>
            <li><a href="#tab-icons" className="text-blue-600 hover:text-blue-800">- 아이콘</a></li>
          </ul>
        </li>

        <li>
          <a href="#switches" className="text-blue-600 hover:text-blue-800">16. 스위치 (Switch)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#switch-bound" className="text-blue-600 hover:text-blue-800">- 바운드</a></li>
            <li><a href="#switch-controlled" className="text-blue-600 hover:text-blue-800">- 컨트롤드</a></li>
            <li><a href="#switch-disabled" className="text-blue-600 hover:text-blue-800">- 비활성</a></li>
            <li><a href="#switch-a11y" className="text-blue-600 hover:text-blue-800">- 접근성</a></li>
          </ul>
        </li>

        <li>
          <a href="#textareas" className="text-blue-600 hover:text-blue-800">17. 텍스트영역 (Textarea)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#textarea-bound" className="text-blue-600 hover:text-blue-800">- 바운드</a></li>
            <li><a href="#textarea-controlled" className="text-blue-600 hover:text-blue-800">- 컨트롤드</a></li>
            <li><a href="#textarea-error" className="text-blue-600 hover:text-blue-800">- 오류</a></li>
            <li><a href="#textarea-states" className="text-blue-600 hover:text-blue-800">- 상태</a></li>
          </ul>
        </li>

        <li>
          <a href="#cards" className="text-blue-600 hover:text-blue-800">18. 카드 (Card)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#card-basic" className="text-blue-600 hover:text-blue-800">- 기본</a></li>
            <li><a href="#card-actions" className="text-blue-600 hover:text-blue-800">- 액션</a></li>
            <li><a href="#card-plain" className="text-blue-600 hover:text-blue-800">- Plain</a></li>
            <li><a href="#card-composed" className="text-blue-600 hover:text-blue-800">- Composed</a></li>
          </ul>
        </li>

        <li>
          <a href="#badges" className="text-blue-600 hover:text-blue-800">19. 배지 (Badge)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#badge-variants" className="text-blue-600 hover:text-blue-800">- 변형</a></li>
            <li><a href="#badge-outline-pill" className="text-blue-600 hover:text-blue-800">- 아웃라인/필</a></li>
            <li><a href="#badge-sizes" className="text-blue-600 hover:text-blue-800">- 크기</a></li>
            <li><a href="#badge-icons" className="text-blue-600 hover:text-blue-800">- 아이콘</a></li>
          </ul>
        </li>

        <li>
          <a href="#number-inputs" className="text-blue-600 hover:text-blue-800">20. 숫자 입력 (NumberInput)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#number-basic" className="text-blue-600 hover:text-blue-800">- 기본</a></li>
            <li><a href="#number-range" className="text-blue-600 hover:text-blue-800">- 범위</a></li>
            <li><a href="#number-unbound" className="text-blue-600 hover:text-blue-800">- 언바운드</a></li>
          </ul>
        </li>

        <li>
          <a href="#datetime-inputs" className="text-blue-600 hover:text-blue-800">21. 날짜/시간 (Date/Time)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#date-basic" className="text-blue-600 hover:text-blue-800">- 날짜 기본</a></li>
            <li><a href="#time-basic" className="text-blue-600 hover:text-blue-800">- 시간 기본</a></li>
          </ul>
        </li>

        <li>
          <a href="#comboboxes" className="text-blue-600 hover:text-blue-800">22. 콤보박스 (Combobox)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#combobox-basic" className="text-blue-600 hover:text-blue-800">- 기본</a></li>
            <li><a href="#combobox-bound" className="text-blue-600 hover:text-blue-800">- 바운드</a></li>
            <li><a href="#combobox-multi" className="text-blue-600 hover:text-blue-800">- 멀티</a></li>
            <li><a href="#combobox-multi-advanced" className="text-blue-600 hover:text-blue-800">- 멀티 고급</a></li>
          </ul>
        </li>

        <li>
          <a href="#tooltips" className="text-blue-600 hover:text-blue-800">23. 툴팁 (Tooltip)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#tooltip-basic" className="text-blue-600 hover:text-blue-800">- 기본</a></li>
            <li><a href="#tooltip-placement" className="text-blue-600 hover:text-blue-800">- 위치</a></li>
            <li><a href="#tooltip-trigger" className="text-blue-600 hover:text-blue-800">- 트리거</a></li>
          </ul>
        </li>

        <li>
          <a href="#drawers" className="text-blue-600 hover:text-blue-800">24. 드로어 (Drawer)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#drawer-right" className="text-blue-600 hover:text-blue-800">- 오른쪽</a></li>
            <li><a href="#drawer-right-sized" className="text-blue-600 hover:text-blue-800">- 오른쪽(크기)</a></li>
            <li><a href="#drawer-left" className="text-blue-600 hover:text-blue-800">- 왼쪽</a></li>
            <li><a href="#drawer-top" className="text-blue-600 hover:text-blue-800">- 상단</a></li>
            <li><a href="#drawer-bottom" className="text-blue-600 hover:text-blue-800">- 하단</a></li>
            <li><a href="#drawer-card" className="text-blue-600 hover:text-blue-800">- 카드 조합</a></li>
            <li><a href="#drawer-menu" className="text-blue-600 hover:text-blue-800">- 메뉴</a></li>
          </ul>
        </li>

        <li>
          <a href="#skeletons" className="text-blue-600 hover:text-blue-800">25. 스켈레톤 (Skeleton)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#skeleton-text" className="text-blue-600 hover:text-blue-800">- 텍스트</a></li>
            <li><a href="#skeleton-composed" className="text-blue-600 hover:text-blue-800">- 조합</a></li>
            <li><a href="#skeleton-card" className="text-blue-600 hover:text-blue-800">- 카드</a></li>
          </ul>
        </li>

        <li>
          <a href="#empties" className="text-blue-600 hover:text-blue-800">26. 빈 상태 (Empty)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#empty-basic" className="text-blue-600 hover:text-blue-800">- 기본</a></li>
            <li><a href="#empty-action" className="text-blue-600 hover:text-blue-800">- 액션</a></li>
          </ul>
        </li>

        <li>
          <a href="#tables" className="text-blue-600 hover:text-blue-800">27. 테이블 (Table)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#table-basic" className="text-blue-600 hover:text-blue-800">- 기본</a></li>
            <li><a href="#table-controlled" className="text-blue-600 hover:text-blue-800">- 컨트롤드</a></li>
            <li><a href="#table-card" className="text-blue-600 hover:text-blue-800">- 카드 스타일</a></li>
            <li><a href="#table-styled" className="text-blue-600 hover:text-blue-800">- 스타일</a></li>
            <li><a href="#table-empty" className="text-blue-600 hover:text-blue-800">- 빈 상태</a></li>
          </ul>
        </li>

        <li>
          <a href="#pagination" className="text-blue-600 hover:text-blue-800">28. 페이지네이션 (Pagination)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#pagination-basic" className="text-blue-600 hover:text-blue-800">- 기본</a></li>
            <li><a href="#pagination-advanced" className="text-blue-600 hover:text-blue-800">- 고급</a></li>
          </ul>
        </li>

        <li>
          <a href="#dropdowns" className="text-blue-600 hover:text-blue-800">29. 드롭다운 (Dropdown)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#dropdown-basic" className="text-blue-600 hover:text-blue-800">- 기본</a></li>
            <li><a href="#dropdown-custom-style" className="text-blue-600 hover:text-blue-800">- 커스텀 스타일</a></li>
            <li><a href="#dropdown-styles" className="text-blue-600 hover:text-blue-800">- 스타일 모음</a></li>
            <li><a href="#dropdown-custom-trigger" className="text-blue-600 hover:text-blue-800">- 커스텀 트리거</a></li>
            <li><a href="#dropdown-placement" className="text-blue-600 hover:text-blue-800">- 위치</a></li>
            <li><a href="#dropdown-preselected" className="text-blue-600 hover:text-blue-800">- 사전선택</a></li>
          </ul>
        </li>

        <li>
          <a href="#stats" className="text-blue-600 hover:text-blue-800">30. 통계 (Stat)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#stat-basic" className="text-blue-600 hover:text-blue-800">- 기본</a></li>
            <li><a href="#stat-more" className="text-blue-600 hover:text-blue-800">- 더보기</a></li>
          </ul>
        </li>

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
          <a href="#easychart" className="text-blue-600 hover:text-blue-800">32. 차트 (EasyChart)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#easychart-line" className="text-blue-600 hover:text-blue-800">- 라인</a></li>
            <li><a href="#easychart-bar" className="text-blue-600 hover:text-blue-800">- 바</a></li>
            <li><a href="#easychart-mixed" className="text-blue-600 hover:text-blue-800">- 혼합</a></li>
            <li><a href="#easychart-pie" className="text-blue-600 hover:text-blue-800">- 파이</a></li>
            <li><a href="#easychart-donut" className="text-blue-600 hover:text-blue-800">- 도넛</a></li>
            <li><a href="#easychart-loading" className="text-blue-600 hover:text-blue-800">- 로딩</a></li>
            <li><a href="#easychart-empty" className="text-blue-600 hover:text-blue-800">- 빈 상태</a></li>
            <li><a href="#easychart-error" className="text-blue-600 hover:text-blue-800">- 에러</a></li>
          </ul>
        </li>

        <li>
          <a href="#pdfviewer" className="text-blue-600 hover:text-blue-800">33. PDF 뷰어 (PdfViewer)</a>
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
