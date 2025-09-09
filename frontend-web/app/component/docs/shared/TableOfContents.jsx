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
            <li><a href="#input-mask" className="text-blue-600 hover:text-blue-800">- 마스크 입력</a></li>
            <li><a href="#input-filter" className="text-blue-600 hover:text-blue-800">- 필터 입력</a></li>
          </ul>
        </li>
        <li>
          <a href="#selects" className="text-blue-600 hover:text-blue-800">4. 선택 (Select)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#select-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용법</a></li>
            <li><a href="#select-states" className="text-blue-600 hover:text-blue-800">- 상태</a></li>
          </ul>
        </li>
        <li>
          <a href="#checkboxes" className="text-blue-600 hover:text-blue-800">5. 체크박스 (Checkbox)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#checkbox-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용법</a></li>
            <li><a href="#checkbox-variants" className="text-blue-600 hover:text-blue-800">- 색상 변형</a></li>
          </ul>
        </li>
        <li>
          <a href="#checkbuttons" className="text-blue-600 hover:text-blue-800">6. 체크버튼 (CheckButton)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#checkbutton-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용법</a></li>
            <li><a href="#checkbutton-variants" className="text-blue-600 hover:text-blue-800">- 색상 변형</a></li>
          </ul>
        </li>
        <li>
          <a href="#radioboxes" className="text-blue-600 hover:text-blue-800">7. 라디오박스 (Radiobox)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#radiobox-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용법</a></li>
            <li><a href="#radiobox-variants" className="text-blue-600 hover:text-blue-800">- 색상 변형</a></li>
          </ul>
        </li>
        <li>
          <a href="#radio-buttons" className="text-blue-600 hover:text-blue-800">8. 라디오버튼 (RadioButton)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#radio-button-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용법</a></li>
            <li><a href="#radio-button-variants" className="text-blue-600 hover:text-blue-800">- 색상 변형</a></li>
          </ul>
        </li>
        <li>
          <a href="#icons" className="text-blue-600 hover:text-blue-800">9. 아이콘 (Icon)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#icon-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용법</a></li>
          </ul>
        </li>
        <li>
          <a href="#loading" className="text-blue-600 hover:text-blue-800">10. 로딩 스피너 (Loading)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#loading-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용법</a></li>
          </ul>
        </li>
        <li>
          <a href="#alerts" className="text-blue-600 hover:text-blue-800">11. 알림 (Alert)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#alert-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용법</a></li>
            <li><a href="#alert-types" className="text-blue-600 hover:text-blue-800">- 알림 유형</a></li>
          </ul>
        </li>
        <li>
          <a href="#confirms" className="text-blue-600 hover:text-blue-800">12. 확인 (Confirm)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#confirm-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용법</a></li>
            <li><a href="#confirm-types" className="text-blue-600 hover:text-blue-800">- 타입 변형</a></li>
          </ul>
        </li>
        <li>
          <a href="#toasts" className="text-blue-600 hover:text-blue-800">13. 토스트 (Toast)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#toast-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용법</a></li>
            <li><a href="#toast-types" className="text-blue-600 hover:text-blue-800">- 유형</a></li>
            <li><a href="#toast-positions" className="text-blue-600 hover:text-blue-800">- 위치</a></li>
            <li><a href="#toast-duration" className="text-blue-600 hover:text-blue-800">- 지속시간</a></li>
          </ul>
        </li>
        <li>
          <a href="#modals" className="text-blue-600 hover:text-blue-800">14. 모달 (Modal)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#modal-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용법</a></li>
            <li><a href="#modal-sizes" className="text-blue-600 hover:text-blue-800">- 모달 크기</a></li>
            <li><a href="#modal-form" className="text-blue-600 hover:text-blue-800">- 폼 모달</a></li>
            <li><a href="#modal-drag" className="text-blue-600 hover:text-blue-800">- 드래그 가능한 모달</a></li>
            <li><a href="#modal-position" className="text-blue-600 hover:text-blue-800">- 모달 위치 지정</a></li>
          </ul>
        </li>
        <li>
          <a href="#tabs" className="text-blue-600 hover:text-blue-800">15. 탭 (Tab)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#tab-basic" className="text-blue-600 hover:text-blue-800">- 기본 사용법</a></li>
            <li><a href="#tab-controlled" className="text-blue-600 hover:text-blue-800">- 컨트롤드 컴포넌트</a></li>
            <li><a href="#tab-styled" className="text-blue-600 hover:text-blue-800">- 스타일링</a></li>
            <li><a href="#tab-icons" className="text-blue-600 hover:text-blue-800">- 아이콘</a></li>
          </ul>
        </li>
        <li>
          <a href="#switches" className="text-blue-600 hover:text-blue-800">16. 스위치 (Switch)</a>
        </li>
        <li>
          <a href="#textareas" className="text-blue-600 hover:text-blue-800">17. 텍스트영역 (Textarea)</a>
        </li>
        <li>
          <a href="#cards" className="text-blue-600 hover:text-blue-800">18. 카드 (Card)</a>
        </li>
        <li>
          <a href="#badges" className="text-blue-600 hover:text-blue-800">19. 배지/태그 (Badge/Tag)</a>
        </li>
      </ul>
    </section>
  );
};

export default TableOfContents;

