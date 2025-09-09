const TableOfContents = () => {
    return (
        <section className="bg-white">
            <h2 className="text-xl font-semibold mb-4">Î™©Ï∞®</h2>
            <div className="space-y-2">
                <li>
                    <a href="#dataclass" className="text-blue-600 hover:text-blue-800">
                        1. ?∞Ïù¥???¥Îûò??(Data Class)
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
                        2. Î≤ÑÌäº (Button)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#button-variants" className="text-blue-600 hover:text-blue-800">
                                - Î≤ÑÌäº Ï¢ÖÎ•ò
                            </a>
                        </li>
                        <li>
                            <a href="#button-sizes" className="text-blue-600 hover:text-blue-800">
                                - Î≤ÑÌäº ?¨Í∏∞
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#inputs" className="text-blue-600 hover:text-blue-800">
                        3. ?ÖÎ†• (Input)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#input-basic" className="text-blue-600 hover:text-blue-800">
                                - Í∏∞Î≥∏ ?ÖÎ†•
                            </a>
                        </li>
                        <li>
                            <a href="#input-mask" className="text-blue-600 hover:text-blue-800">
                                - ÎßàÏä§???ÖÎ†•
                            </a>
                        </li>
                        <li>
                            <a href="#input-filter" className="text-blue-600 hover:text-blue-800">
                                - ?ÑÌÑ∞ ?ÖÎ†•
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#selects" className="text-blue-600 hover:text-blue-800">
                        4. ?†ÌÉù (Select)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#select-basic" className="text-blue-600 hover:text-blue-800">
                                - Í∏∞Î≥∏ ?¨Ïö©Î≤?
                            </a>
                        </li>
                        <li>
                            <a href="#select-states" className="text-blue-600 hover:text-blue-800">
                                - ?ÅÌÉú
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#checkboxes" className="text-blue-600 hover:text-blue-800">
                        5. Ï≤¥ÌÅ¨Î∞ïÏä§ (Checkbox)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#checkbox-basic" className="text-blue-600 hover:text-blue-800">
                                - Í∏∞Î≥∏ ?¨Ïö©Î≤?
                            </a>
                        </li>
                        <li>
                            <a href="#checkbox-variants" className="text-blue-600 hover:text-blue-800">
                                - ?âÏÉÅ Î≥Ä??
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#checkbuttons" className="text-blue-600 hover:text-blue-800">
                        6. Ï≤¥ÌÅ¨Î≤ÑÌäº (CheckButton)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#checkbutton-basic" className="text-blue-600 hover:text-blue-800">
                                - Í∏∞Î≥∏ ?¨Ïö©Î≤?
                            </a>
                        </li>
                        <li>
                            <a href="#checkbutton-variants" className="text-blue-600 hover:text-blue-800">
                                - ?âÏÉÅ Î≥Ä??
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#radioboxes" className="text-blue-600 hover:text-blue-800">
                        7. ?ºÎîî?§Î∞ï??(Radiobox)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#radiobox-basic" className="text-blue-600 hover:text-blue-800">
                                - Í∏∞Î≥∏ ?¨Ïö©Î≤?
                            </a>
                        </li>
                        <li>
                            <a href="#radiobox-variants" className="text-blue-600 hover:text-blue-800">
                                - ?âÏÉÅ Î≥Ä??
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#radiobuttons" className="text-blue-600 hover:text-blue-800">
                        8. ?ºÎîî?§Î≤Ñ??(RadioButton)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#radiobutton-basic" className="text-blue-600 hover:text-blue-800">
                                - Í∏∞Î≥∏ ?¨Ïö©Î≤?
                            </a>
                        </li>
                        <li>
                            <a href="#radiobutton-variants" className="text-blue-600 hover:text-blue-800">
                                - ?âÏÉÅ Î≥Ä??
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#icons" className="text-blue-600 hover:text-blue-800">
                        9. ?ÑÏù¥ÏΩ?(Icon)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#icon-basic" className="text-blue-600 hover:text-blue-800">
                                - Í∏∞Î≥∏ ?¨Ïö©Î≤?
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#loading" className="text-blue-600 hover:text-blue-800">
                        10. Î°úÎî© ?§Ìîº??(Loading)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#loading-basic" className="text-blue-600 hover:text-blue-800">
                                - Í∏∞Î≥∏ ?¨Ïö©Î≤?
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#alerts" className="text-blue-600 hover:text-blue-800">
                        11. ?åÎ¶º (Alert)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#alert-basic" className="text-blue-600 hover:text-blue-800">
                                - Í∏∞Î≥∏ ?¨Ïö©Î≤?
                            </a>
                        </li>
                        <li>
                            <a href="#alert-types" className="text-blue-600 hover:text-blue-800">
                                - ?åÎ¶º ?†Ìòï
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#confirms" className="text-blue-600 hover:text-blue-800">
                        12. ?ïÏù∏ (Confirm)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#confirm-basic" className="text-blue-600 hover:text-blue-800">
                                - Í∏∞Î≥∏ ?¨Ïö©Î≤?
                            </a>
                        </li>
                        <li>
                            <a href="#confirm-types" className="text-blue-600 hover:text-blue-800">
                                - ?ïÏù∏ ?Ä?îÏÉÅ???†Ìòï
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#toasts" className="text-blue-600 hover:text-blue-800">
                        13. ?†Ïä§??(Toast)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#toast-basic" className="text-blue-600 hover:text-blue-800">
                                - Í∏∞Î≥∏ ?¨Ïö©Î≤?
                            </a>
                        </li>
                        <li>
                            <a href="#toast-types" className="text-blue-600 hover:text-blue-800">
                                - ?†Ïä§???†Ìòï
                            </a>
                        </li>
                        <li>
                            <a href="#toast-positions" className="text-blue-600 hover:text-blue-800">
                                - ?†Ïä§???ÑÏπò
                            </a>
                        </li>
                        <li>
                            <a href="#toast-duration" className="text-blue-600 hover:text-blue-800">
                                - ?†Ïä§??ÏßÄ???úÍ∞Ñ
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#modals" className="text-blue-600 hover:text-blue-800">
                        14. Î™®Îã¨ (Modal)
                    </a>
                    <ul className="ml-4 mt-1 space-y-1">
                        <li>
                            <a href="#modal-basic" className="text-blue-600 hover:text-blue-800">
                                - Í∏∞Î≥∏ ?¨Ïö©Î≤?
                            </a>
                        </li>
                        <li>
                            <a href="#modal-sizes" className="text-blue-600 hover:text-blue-800">
                                - Î™®Îã¨ ?¨Í∏∞
                            </a>
                        </li>
                        <li>
                            <a href="#modal-form" className="text-blue-600 hover:text-blue-800">
                                - ?ºÏù¥ ?¨Ìï®??Î™®Îã¨
                            </a>
                        </li>
                        <li>
                            <a href="#modal-drag" className="text-blue-600 hover:text-blue-800">
                                - ?úÎûòÍ∑?Í∞Ä?•Ìïú Î™®Îã¨
                            </a>
                        </li>
                        <li>
                            <a href="#modal-position" className="text-blue-600 hover:text-blue-800">
                                - Î™®Îã¨ ?ÑÏπò ÏßÄ??
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
                                - Í∏∞Î≥∏ ?¨Ïö©Î≤?
                            </a>
                        </li>
                        <li>
                            <a href="#tab-controlled" className="text-blue-600 hover:text-blue-800">
                                - ?úÏñ¥ Ïª¥Ìè¨?åÌä∏
                            </a>
                        </li>
                        <li>
                            <a href="#tab-styled" className="text-blue-600 hover:text-blue-800">
                                - ?§Ì??ºÎßÅ
                            </a>
                        </li>
                        <li>
                            <a href="#tab-icons" className="text-blue-600 hover:text-blue-800">
                                - ?ÑÏù¥ÏΩ???
                            </a>
                        </li>
                    </ul>
                </li>
                {/* Ï∂îÌõÑ Ï∂îÍ????§Î•∏ Ïª¥Ìè¨?åÌä∏?§Ïùò Î™©Ï∞® */}
            </div>
        </section>
    );
};

export default TableOfContents; 
