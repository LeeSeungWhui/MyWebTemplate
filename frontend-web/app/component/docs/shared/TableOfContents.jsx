/**
 * 파일명: TableOfContents.jsx
 * 작성자: LSH
 * 갱신일: 2025-12-04
 * 설명: 컴포넌트 문서 목차 (경량 버전)
 */

const tocItems = [
  {
    id: "dataclass",
    label: "1. 데이터 클래스 (Data Class)",
    children: [
      { id: "dataclass-easyobj", label: "- EasyObj" },
      { id: "dataclass-easylist", label: "- EasyList" },
    ],
  },
  {
    id: "buttons",
    label: "2. 버튼 (Button)",
    children: [
      { id: "button-variants", label: "- 버튼 종류" },
      { id: "button-sizes", label: "- 버튼 크기" },
    ],
  },
  {
    id: "icons",
    label: "3. 아이콘 (Icon)",
    children: [{ id: "icon-basic", label: "- 기본 사용" }],
  },
  {
    id: "inputs",
    label: "4. 입력 (Input)",
    children: [
      { id: "input-basic", label: "- 기본 입력" },
      { id: "input-mask", label: "- 마스킹 입력" },
      { id: "input-filter", label: "- 필터 입력" },
      { id: "input-advanced", label: "- 고급 입력" },
    ],
  },
  {
    id: "textareas",
    label: "5. 멀티라인 입력 (Textarea)",
    children: [
      { id: "textarea-basic", label: "- 기본" },
      { id: "textarea-states", label: "- 상태" },
    ],
  },
  {
    id: "selects",
    label: "6. 선택 (Select)",
    children: [
      { id: "select-basic", label: "- 기본 사용" },
      { id: "select-states", label: "- 상태" },
    ],
  },
  {
    id: "checkboxes",
    label: "7. 체크박스 (Checkbox)",
    children: [
      { id: "checkbox-basic", label: "- 기본 사용" },
      { id: "checkbox-variants", label: "- 변형" },
    ],
  },
  {
    id: "checkbuttons",
    label: "8. 체크버튼 (CheckButton)",
    children: [
      { id: "checkbutton-basic", label: "- 기본 사용" },
      { id: "checkbutton-variants", label: "- 변형" },
    ],
  },
  {
    id: "radioboxes",
    label: "9. 라디오박스 (Radiobox)",
    children: [
      { id: "radiobox-basic", label: "- 기본 사용" },
      { id: "radiobox-variants", label: "- 변형" },
    ],
  },
  {
    id: "radiobuttons",
    label: "10. 라디오버튼 (RadioButton)",
    children: [
      { id: "radiobutton-basic", label: "- 기본 사용" },
      { id: "radiobutton-variants", label: "- 변형" },
    ],
  },
  {
    id: "switches",
    label: "11. 스위치 (Switch)",
    children: [
      { id: "switch-basic", label: "- 기본 사용" },
      { id: "switch-states", label: "- 상태" },
    ],
  },
  {
    id: "number-inputs",
    label: "12. 숫자 입력 (NumberInput)",
    children: [
      { id: "number-basic", label: "- 기본" },
      { id: "number-range", label: "- 범위" },
      { id: "number-unbound", label: "- 언바운드" },
    ],
  },
  {
    id: "datetime-inputs",
    label: "13. 날짜/시간 (Date/Time)",
    children: [
      { id: "date-basic", label: "- 날짜 기본" },
      { id: "time-basic", label: "- 시간 기본" },
    ],
  },
  {
    id: "comboboxes",
    label: "14. 콤보박스 (Combobox)",
    children: [
      { id: "combobox-basic", label: "- 기본" },
      { id: "combobox-bound", label: "- 바운드" },
      { id: "combobox-multi", label: "- 멀티" },
    ],
  },
  {
    id: "dropdowns",
    label: "15. 드롭다운 (Dropdown)",
    children: [
      { id: "dropdown-basic", label: "- 기본" },
      { id: "dropdown-styles", label: "- 스타일" },
    ],
  },
  {
    id: "loading",
    label: "16. 로딩 (Loading)",
    children: [{ id: "loading-basic", label: "- 기본 사용" }],
  },
  {
    id: "alerts",
    label: "17. 알림 (Alert)",
    children: [
      { id: "alert-basic", label: "- 기본" },
      { id: "alert-types", label: "- 유형" },
    ],
  },
  {
    id: "confirms",
    label: "18. 확인 (Confirm)",
    children: [{ id: "confirm-basic", label: "- 기본" }],
  },
  {
    id: "toasts",
    label: "19. 토스트 (Toast)",
    children: [{ id: "toast-basic", label: "- 기본" }],
  },
  {
    id: "tooltips",
    label: "20. 툴팁 (Tooltip)",
    children: [
      { id: "tooltip-basic", label: "- 기본" },
      { id: "tooltip-placement", label: "- 위치" },
    ],
  },
  {
    id: "badges",
    label: "21. 배지 (Badge)",
    children: [
      { id: "badge-basic", label: "- 기본" },
      { id: "badge-variants", label: "- 변형" },
    ],
  },
  {
    id: "stats",
    label: "22. 통계 (Stat)",
    children: [{ id: "stat-basic", label: "- 기본" }],
  },
  {
    id: "skeletons",
    label: "23. 스켈레톤 (Skeleton)",
    children: [
      { id: "skeleton-text", label: "- 텍스트" },
      { id: "skeleton-card", label: "- 카드" },
    ],
  },
  {
    id: "empties",
    label: "24. 빈 상태 (Empty)",
    children: [
      { id: "empty-basic", label: "- 기본" },
      { id: "empty-action", label: "- 액션" },
    ],
  },
  {
    id: "cards",
    label: "25. 카드 (Card)",
    children: [
      { id: "card-basic", label: "- 기본" },
      { id: "card-layouts", label: "- 레이아웃" },
    ],
  },
  {
    id: "tables",
    label: "26. 테이블 (Table)",
    children: [
      { id: "table-basic", label: "- 기본" },
      { id: "table-controlled", label: "- 컨트롤드" },
    ],
  },
  {
    id: "pagination",
    label: "27. 페이지네이션 (Pagination)",
    children: [
      { id: "pagination-basic", label: "- 기본" },
      { id: "pagination-advanced", label: "- 고급" },
    ],
  },
  {
    id: "tabs",
    label: "28. 탭 (Tab)",
    children: [
      { id: "tab-basic", label: "- 기본" },
      { id: "tab-variants", label: "- 변형" },
    ],
  },
  {
    id: "drawers",
    label: "29. 드로어 (Drawer)",
    children: [
      { id: "drawer-right", label: "- 오른쪽" },
      { id: "drawer-left", label: "- 왼쪽" },
    ],
  },
  {
    id: "modals",
    label: "30. 모달 (Modal)",
    children: [
      { id: "modal-basic", label: "- 기본" },
      { id: "modal-sizes", label: "- 크기" },
    ],
  },
  {
    id: "editors",
    label: "31. 리치 에디터 (EasyEditor)",
    children: [
      { id: "editor-basic", label: "- 기본" },
      { id: "editor-bound", label: "- 바운드" },
    ],
  },
  {
    id: "easychart",
    label: "32. 차트 (EasyChart)",
    children: [
      { id: "easychart-line", label: "- 라인" },
      { id: "easychart-bar", label: "- 바" },
    ],
  },
  {
    id: "pdfviewer",
    label: "33. PDF 뷰어 (PdfViewer)",
    children: [
      { id: "pdf-basic", label: "- 기본" },
      { id: "pdf-remote", label: "- 원격" },
    ],
  },
];

/**
 * @description 컴포넌트 문서 목차 트리를 렌더링하고 섹션 앵커 링크를 제공한다.
 * @returns {JSX.Element}
 */
const TableOfContents = () => {
  return (
    <section className="bg-white">
      <h2 className="text-xl font-semibold mb-4">목차</h2>
      <ul className="space-y-2">
        {tocItems.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-blue-600 hover:text-blue-800"
            >
              {item.label}
            </a>
            {item.children && item.children.length > 0 && (
              <ul className="ml-4 mt-1 space-y-1">
                {item.children.map((child) => (
                  <li key={child.id}>
                    <a
                      href={`#${child.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {child.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TableOfContents;
