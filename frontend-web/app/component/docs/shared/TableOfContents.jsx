const TableOfContents = () => {
    return (
        <section className="bg-white">
            <h2 className="text-xl font-semibold mb-4">목차</h2>
            <div className="space-y-2">
                <li>
                    <a href="#dataclass" className="text-blue-600 hover:text-blue-800">
                        1. ?�이???�래??(Data Class)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#dataclass-easyobj" className="text-blue-600 hover:text-blue-800">
                                - EasyObj
                            </a>
                        </li>
                        <li>
                            <a href="#dataclass-easylist" className="text-blue-600 hover:text-blue-800">
                                - EasyList
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#buttons" className="text-blue-600 hover:text-blue-800">
                        2. 버튼 (Button)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#button-variants" className="text-blue-600 hover:text-blue-800">
                                - 버튼 종류
                            </a>
                        </li>
                        <li>
                            <a href="#button-sizes" className="text-blue-600 hover:text-blue-800">
                                - 버튼 ?�기
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#inputs" className="text-blue-600 hover:text-blue-800">
                        3. ?�력 (Input)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#input-basic" className="text-blue-600 hover:text-blue-800">
                                - 기본 ?�력
                            </a>
                        </li>
                        <li>
                            <a href="#input-mask" className="text-blue-600 hover:text-blue-800">
                                - 마스???�력
                            </a>
                        </li>
                        <li>
                            <a href="#input-filter" className="text-blue-600 hover:text-blue-800">
                                - ?�터 ?�력
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#selects" className="text-blue-600 hover:text-blue-800">
                        4. ?�택 (Select)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#select-basic" className="text-blue-600 hover:text-blue-800">
                                - 기본 ?�용�?
                            </a>
                        </li>
                        <li>
                            <a href="#select-states" className="text-blue-600 hover:text-blue-800">
                                - ?�태
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#checkboxes" className="text-blue-600 hover:text-blue-800">
                        5. 체크박스 (Checkbox)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#checkbox-basic" className="text-blue-600 hover:text-blue-800">
                                - 기본 ?�용�?
                            </a>
                        </li>
                        <li>
                            <a href="#checkbox-variants" className="text-blue-600 hover:text-blue-800">
                                - ?�상 변??
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#checkbuttons" className="text-blue-600 hover:text-blue-800">
                        6. 체크버튼 (CheckButton)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#checkbutton-basic" className="text-blue-600 hover:text-blue-800">
                                - 기본 ?�용�?
                            </a>
                        </li>
                        <li>
                            <a href="#checkbutton-variants" className="text-blue-600 hover:text-blue-800">
                                - ?�상 변??
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#radioboxes" className="text-blue-600 hover:text-blue-800">
                        7. ?�디?�박??(Radiobox)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#radiobox-basic" className="text-blue-600 hover:text-blue-800">
                                - 기본 ?�용�?
                            </a>
                        </li>
                        <li>
                            <a href="#radiobox-variants" className="text-blue-600 hover:text-blue-800">
                                - ?�상 변??
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#radiobuttons" className="text-blue-600 hover:text-blue-800">
                        8. ?�디?�버??(RadioButton)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#radiobutton-basic" className="text-blue-600 hover:text-blue-800">
                                - 기본 ?�용�?
                            </a>
                        </li>
                        <li>
                            <a href="#radiobutton-variants" className="text-blue-600 hover:text-blue-800">
                                - ?�상 변??
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#icons" className="text-blue-600 hover:text-blue-800">
                        9. ?�이�?(Icon)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#icon-basic" className="text-blue-600 hover:text-blue-800">
                                - 기본 ?�용�?
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#loading" className="text-blue-600 hover:text-blue-800">
                        10. 로딩 ?�피??(Loading)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#loading-basic" className="text-blue-600 hover:text-blue-800">
                                - 기본 ?�용�?
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#alerts" className="text-blue-600 hover:text-blue-800">
                        11. ?�림 (Alert)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#alert-basic" className="text-blue-600 hover:text-blue-800">
                                - 기본 ?�용�?
                            </a>
                        </li>
                        <li>
                            <a href="#alert-types" className="text-blue-600 hover:text-blue-800">
                                - ?�림 ?�형
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#confirms" className="text-blue-600 hover:text-blue-800">
                        12. ?�인 (Confirm)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#confirm-basic" className="text-blue-600 hover:text-blue-800">
                                - 기본 ?�용�?
                            </a>
                        </li>
                        <li>
                            <a href="#confirm-types" className="text-blue-600 hover:text-blue-800">
                                - ?�인 ?�?�상???�형
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#toasts" className="text-blue-600 hover:text-blue-800">
                        13. ?�스??(Toast)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#toast-basic" className="text-blue-600 hover:text-blue-800">
                                - 기본 ?�용�?
                            </a>
                        </li>
                        <li>
                            <a href="#toast-types" className="text-blue-600 hover:text-blue-800">
                                - ?�스???�형
                            </a>
                        </li>
                        <li>
                            <a href="#toast-positions" className="text-blue-600 hover:text-blue-800">
                                - ?�스???�치
                            </a>
                        </li>
                        <li>
                            <a href="#toast-duration" className="text-blue-600 hover:text-blue-800">
                                - ?�스??지???�간
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#modals" className="text-blue-600 hover:text-blue-800">
                        14. 모달 (Modal)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#modal-basic" className="text-blue-600 hover:text-blue-800">
                                - 기본 ?�용�?
                            </a>
                        </li>
                        <li>
                            <a href="#modal-sizes" className="text-blue-600 hover:text-blue-800">
                                - 모달 ?�기
                            </a>
                        </li>
                        <li>
                            <a href="#modal-form" className="text-blue-600 hover:text-blue-800">
                                - ?�이 ?�함??모달
                            </a>
                        </li>
                        <li>
                            <a href="#modal-drag" className="text-blue-600 hover:text-blue-800">
                                - ?�래�?가?�한 모달
                            </a>
                        </li>
                        <li>
                            <a href="#modal-position" className="text-blue-600 hover:text-blue-800">
                                - 모달 ?�치 지??
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#tabs" className="text-blue-600 hover:text-blue-800">
                        15. ??(Tab)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#tab-basic" className="text-blue-600 hover:text-blue-800">
                                - 기본 ?�용�?
                            </a>
                        </li>
                        <li>
                            <a href="#tab-controlled" className="text-blue-600 hover:text-blue-800">
                                - ?�어 컴포?�트
                            </a>
                        </li>
                        <li>
                            <a href="#tab-styled" className="text-blue-600 hover:text-blue-800">
                                - ?��??�링
                            </a>
                        </li>
                        <li>
                            <a href="#tab-icons" className="text-blue-600 hover:text-blue-800">
                                - ?�이�???
                            </a>
                        </li>
                    </ul>
                </li>
                {/* 추후 추�????�른 컴포?�트?�의 목차 */}
            </div>
        </section>
    );
};

export default TableOfContents; 
