const TableOfContents = () => {
    return (
        <section className="mb-12 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">목차</h2>
            <ul className="space-y-2">
                <li>
                    <a href="#buttons" className="text-blue-600 hover:text-blue-800">
                        1. 버튼 (Button)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#button-variants" className="text-blue-600 hover:text-blue-800">
                                - 버튼 종류
                            </a>
                        </li>
                        <li>
                            <a href="#button-sizes" className="text-blue-600 hover:text-blue-800">
                                - 버튼 크기
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#inputs" className="text-blue-600 hover:text-blue-800">
                        2. 입력 (Input)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#input-basic" className="text-blue-600 hover:text-blue-800">
                                - 기본 입력
                            </a>
                        </li>
                        <li>
                            <a href="#input-mask" className="text-blue-600 hover:text-blue-800">
                                - 마스크 입력
                            </a>
                        </li>
                        <li>
                            <a href="#input-filter" className="text-blue-600 hover:text-blue-800">
                                - 필터 입력
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#selects" className="text-blue-600 hover:text-blue-800">
                        3. 선택 (Select)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#select-basic" className="text-blue-600 hover:text-blue-800">
                                - 기본 사용법
                            </a>
                        </li>
                        <li>
                            <a href="#select-states" className="text-blue-600 hover:text-blue-800">
                                - 상태
                            </a>
                        </li>
                    </ul>
                </li>
                {/* 추후 추가될 다른 컴포넌트들의 목차 */}
            </ul>
        </section>
    );
};

export default TableOfContents; 