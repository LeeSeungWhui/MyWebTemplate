/**
 * ?뚯씪紐? TableOfContents.jsx
 * ?묒꽦?? LSH
 * 媛깆떊?? 2025-09-13
 * ?ㅻ챸: 而댄룷?뚰듃 臾몄꽌 紐⑹감
 */
/**
 * 臾몄꽌 紐⑹감 ?뱀뀡
 * @date 2025-09-13
 */
const TableOfContents = () => {
  return (
    <section className="bg-white">
      <h2 className="text-xl font-semibold mb-4">紐⑹감</h2>
      <ul className="space-y-2">
        <li>
          <a href="#dataclass" className="text-blue-600 hover:text-blue-800">1. ?곗씠???대옒??(Data Class)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#dataclass-easyobj" className="text-blue-600 hover:text-blue-800">- EasyObj</a></li>
            <li><a href="#dataclass-easylist" className="text-blue-600 hover:text-blue-800">- EasyList</a></li>
          </ul>
        </li>
        <li>
          <a href="#buttons" className="text-blue-600 hover:text-blue-800">2. 踰꾪듉 (Button)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#button-variants" className="text-blue-600 hover:text-blue-800">- 踰꾪듉 醫낅쪟</a></li>
            <li><a href="#button-sizes" className="text-blue-600 hover:text-blue-800">- 踰꾪듉 ?ш린</a></li>
          </ul>
        </li>
        <li>
          <a href="#inputs" className="text-blue-600 hover:text-blue-800">3. ?낅젰 (Input)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#input-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯 ?낅젰</a></li>
            <li><a href="#input-mask" className="text-blue-600 hover:text-blue-800">- 留덉뒪???낅젰</a></li>
            <li><a href="#input-filter" className="text-blue-600 hover:text-blue-800">- ?꾪꽣 ?낅젰</a></li>
          </ul>
        </li>
        <li>
          <a href="#selects" className="text-blue-600 hover:text-blue-800">4. ?좏깮 (Select)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#select-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯 ?ъ슜</a></li>
            <li><a href="#select-states" className="text-blue-600 hover:text-blue-800">- ?곹깭</a></li>
          </ul>
        </li>
        <li>
          <a href="#checkboxes" className="text-blue-600 hover:text-blue-800">5. 泥댄겕諛뺤뒪 (Checkbox)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#checkbox-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯 ?ъ슜</a></li>
            <li><a href="#checkbox-variants" className="text-blue-600 hover:text-blue-800">- 紐⑥뼇 蹂??/a></li>
          </ul>
        </li>
        <li>
          <a href="#checkbuttons" className="text-blue-600 hover:text-blue-800">6. 泥댄겕踰꾪듉 (CheckButton)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#checkbutton-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯 ?ъ슜</a></li>
            <li><a href="#checkbutton-variants" className="text-blue-600 hover:text-blue-800">- 紐⑥뼇 蹂??/a></li>
          </ul>
        </li>
        <li>
          <a href="#radioboxes" className="text-blue-600 hover:text-blue-800">7. ?쇰뵒?ㅻ컯??(Radiobox)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#radiobox-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯 ?ъ슜</a></li>
            <li><a href="#radiobox-variants" className="text-blue-600 hover:text-blue-800">- 紐⑥뼇 蹂??/a></li>
          </ul>
        </li>
        <li>
          <a href="#radio-buttons" className="text-blue-600 hover:text-blue-800">8. ?쇰뵒?ㅻ쾭??(RadioButton)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#radio-button-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯 ?ъ슜</a></li>
            <li><a href="#radio-button-variants" className="text-blue-600 hover:text-blue-800">- 紐⑥뼇 蹂??/a></li>
          </ul>
        </li>
        <li>
          <a href="#icons" className="text-blue-600 hover:text-blue-800">9. ?꾩씠肄?(Icon)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#icon-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯 ?ъ슜</a></li>
          </ul>
        </li>
        <li>
          <a href="#loading" className="text-blue-600 hover:text-blue-800">10. 濡쒕뵫 (Loading)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#loading-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯 ?ъ슜</a></li>
          </ul>
        </li>
        <li>
          <a href="#alerts" className="text-blue-600 hover:text-blue-800">11. ?뚮┝ (Alert)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#alert-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯 ?ъ슜</a></li>
            <li><a href="#alert-types" className="text-blue-600 hover:text-blue-800">- ?뚮┝ ?좏삎</a></li>
          </ul>
        </li>
        <li>
          <a href="#confirms" className="text-blue-600 hover:text-blue-800">12. ?뺤씤 (Confirm)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#confirm-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯 ?ъ슜</a></li>
            <li><a href="#confirm-types" className="text-blue-600 hover:text-blue-800">- ?좏삎 蹂??/a></li>
          </ul>
        </li>
        <li>
          <a href="#toasts" className="text-blue-600 hover:text-blue-800">13. ?좎뒪??(Toast)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#toast-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯 ?ъ슜</a></li>
            <li><a href="#toast-types" className="text-blue-600 hover:text-blue-800">- ?좏삎</a></li>
            <li><a href="#toast-positions" className="text-blue-600 hover:text-blue-800">- ?꾩튂</a></li>
            <li><a href="#toast-duration" className="text-blue-600 hover:text-blue-800">- 吏?띿떆媛?/a></li>
          </ul>
        </li>
        <li>
          <a href="#modals" className="text-blue-600 hover:text-blue-800">14. 紐⑤떖 (Modal)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#modal-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯 ?ъ슜</a></li>
            <li><a href="#modal-sizes" className="text-blue-600 hover:text-blue-800">- 紐⑤떖 ?ш린</a></li>
            <li><a href="#modal-form" className="text-blue-600 hover:text-blue-800">- ??紐⑤떖</a></li>
            <li><a href="#modal-drag" className="text-blue-600 hover:text-blue-800">- ?쒕옒洹?媛?ν븳 紐⑤떖</a></li>
            <li><a href="#modal-position" className="text-blue-600 hover:text-blue-800">- 紐⑤떖 ?꾩튂 吏??/a></li>
          </ul>
        </li>
        <li>
          <a href="#tabs" className="text-blue-600 hover:text-blue-800">15. ??(Tab)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#tab-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯 ?ъ슜</a></li>
            <li><a href="#tab-controlled" className="text-blue-600 hover:text-blue-800">- 而⑦듃濡ㅻ뱶 而댄룷?뚰듃</a></li>
            <li><a href="#tab-styled" className="text-blue-600 hover:text-blue-800">- ?ㅽ??쇰쭅</a></li>
            <li><a href="#tab-icons" className="text-blue-600 hover:text-blue-800">- ?꾩씠肄?/a></li>
          </ul>
        </li>
        <li>
          <a href="#switches" className="text-blue-600 hover:text-blue-800">16. ?ㅼ쐞移?(Switch)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#switch-bound" className="text-blue-600 hover:text-blue-800">- 諛붿슫??紐⑤뱶</a></li>
            <li><a href="#switch-controlled" className="text-blue-600 hover:text-blue-800">- 而⑦듃濡ㅻ뱶 紐⑤뱶</a></li>
            <li><a href="#switch-disabled" className="text-blue-600 hover:text-blue-800">- 鍮꾪솢??湲곕낯媛?/a></li>
            <li><a href="#switch-a11y" className="text-blue-600 hover:text-blue-800">- ?묎렐??/a></li>
          </ul>
        </li>
        <li>
          <a href="#textareas" className="text-blue-600 hover:text-blue-800">17. ?띿뒪?몄쁺??(Textarea)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#textarea-bound" className="text-blue-600 hover:text-blue-800">- 諛붿슫??紐⑤뱶</a></li>
            <li><a href="#textarea-controlled" className="text-blue-600 hover:text-blue-800">- 而⑦듃濡ㅻ뱶 紐⑤뱶</a></li>
            <li><a href="#textarea-error" className="text-blue-600 hover:text-blue-800">- 寃利??먮윭 ?곹깭</a></li>
            <li><a href="#textarea-states" className="text-blue-600 hover:text-blue-800">- ?쎄린 ?꾩슜/鍮꾪솢??/a></li>
          </ul>
        </li>
        <li>
          <a href="#cards" className="text-blue-600 hover:text-blue-800">18. 移대뱶 (Card)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#card-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯 Card</a></li>
            <li><a href="#card-actions" className="text-blue-600 hover:text-blue-800">- ?≪뀡/?명꽣</a></li>
            <li><a href="#card-plain" className="text-blue-600 hover:text-blue-800">- 蹂몃Ц ?꾩슜</a></li>
            <li><a href="#card-composed" className="text-blue-600 hover:text-blue-800">- 議고빀 ?덉떆</a></li>
          </ul>
        </li>
        <li>
          <a href="#badges" className="text-blue-600 hover:text-blue-800">19. 諛곗?/?쒓렇 (Badge/Tag)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#badge-variants" className="text-blue-600 hover:text-blue-800">- ?됱긽 Variants</a></li>
            <li><a href="#badge-outline-pill" className="text-blue-600 hover:text-blue-800">- Outline / Pill</a></li>
            <li><a href="#badge-sizes" className="text-blue-600 hover:text-blue-800">- ?ш린</a></li>
            <li><a href="#badge-icons" className="text-blue-600 hover:text-blue-800">- ?꾩씠肄??ы븿</a></li>
          </ul>
        </li>
        <li>
          <a href="#number-inputs" className="text-blue-600 hover:text-blue-800">20. ?レ옄 ?낅젰 (Number)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#number-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯</a></li>
            <li><a href="#number-range" className="text-blue-600 hover:text-blue-800">- 踰붿쐞/?ㅽ뀦</a></li>
            <li><a href="#number-unbound" className="text-blue-600 hover:text-blue-800">- ?몃컮?대뱶</a></li>
          </ul>
        </li>
        <li>
          <a href="#datetime-inputs" className="text-blue-600 hover:text-blue-800">21. ?좎쭨/?쒓컙 (Date/Time)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#date-basic" className="text-blue-600 hover:text-blue-800">- ?좎쭨</a></li>
            <li><a href="#time-basic" className="text-blue-600 hover:text-blue-800">- ?쒓컙</a></li>
          </ul>
        </li>
        <li>
          <a href="#comboboxes" className="text-blue-600 hover:text-blue-800">22. 肄ㅻ낫諛뺤뒪 (Combobox)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#combobox-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯</a></li>
            <li><a href="#combobox-unbound" className="text-blue-600 hover:text-blue-800">- ?몃컮?대뱶</a></li>
          </ul>
        </li>
        <li>
          <a href="#tooltips" className="text-blue-600 hover:text-blue-800">23. ?댄똻 (Tooltip)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#tooltip-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯</a></li>
            <li><a href="#tooltip-placement" className="text-blue-600 hover:text-blue-800">- 諛⑺뼢</a></li>
            <li><a href="#tooltip-trigger" className="text-blue-600 hover:text-blue-800">- ?몃━嫄?/a></li>
          </ul>
        </li>
        <li>
          <a href="#drawers" className="text-blue-600 hover:text-blue-800">24. ?щ씪?대뜑 (Slider)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#drawer-right" className="text-blue-600 hover:text-blue-800">- ?ㅻⅨ履?/a></li>
            <li><a href="#drawer-left" className="text-blue-600 hover:text-blue-800">- ?쇱そ</a></li>
            <li><a href="#drawer-top" className="text-blue-600 hover:text-blue-800">- ?꾩そ</a></li>
            <li><a href="#drawer-bottom" className="text-blue-600 hover:text-blue-800">- ?꾨옒履?/a></li>
            <li><a href="#drawer-card" className="text-blue-600 hover:text-blue-800">- 移대뱶 ?섑뵆</a></li>
            <li><a href="#drawer-menu" className="text-blue-600 hover:text-blue-800">- 硫붾돱 ?섑뵆</a></li>
          </ul>
        </li>
        <li>
          <a href="#skeletons" className="text-blue-600 hover:text-blue-800">25. ?ㅼ펷?덊넠 (Skeleton)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#skeleton-text" className="text-blue-600 hover:text-blue-800">- ?띿뒪??/a></li>
            <li><a href="#skeleton-composed" className="text-blue-600 hover:text-blue-800">- 議고빀</a></li>
            <li><a href="#skeleton-card" className="text-blue-600 hover:text-blue-800">- 移대뱶</a></li>
          </ul>
        </li>
        <li>
          <a href="#empties" className="text-blue-600 hover:text-blue-800">26. ?좏떚 (Empty)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#empty-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯</a></li>
            <li><a href="#empty-action" className="text-blue-600 hover:text-blue-800">- ?ㅻ챸/?≪뀡</a></li>
          </ul>
        </li>
        <li>
          <a href="#tables" className="text-blue-600 hover:text-blue-800">27. ?뚯씠釉?(Table)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#table-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯</a></li>
            <li><a href="#table-controlled" className="text-blue-600 hover:text-blue-800">- ?쒖뼱??/a></li>
            <li><a href="#table-card" className="text-blue-600 hover:text-blue-800">- 移대뱶</a></li>
            <li><a href="#table-empty" className="text-blue-600 hover:text-blue-800">- 鍮??곹깭</a></li>
          </ul>
        </li>
        <li>
          <a href="#pagination" className="text-blue-600 hover:text-blue-800">28. ?섏씠吏?ㅼ씠??(Pagination)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#pagination-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯</a></li>
            <li><a href="#pagination-advanced" className="text-blue-600 hover:text-blue-800">- ??⑸웾/踰꾪듉 ?쒗븳</a></li>
          </ul>
        </li>
        <li>
          <a href="#dropdowns" className="text-blue-600 hover:text-blue-800">29. ?쒕∼?ㅼ슫 (Dropdown)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#dropdown-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯</a></li>
            <li><a href="#dropdown-custom-style" className="text-blue-600 hover:text-blue-800">- 而ㅼ뒪? ?ㅽ???/a></li>
            <li><a href="#dropdown-styles" className="text-blue-600 hover:text-blue-800">- ?ㅽ???蹂??/a></li>
            <li><a href="#dropdown-custom-trigger" className="text-blue-600 hover:text-blue-800">- 而ㅼ뒪? ?몃━嫄?/a></li>
            <li><a href="#dropdown-placement" className="text-blue-600 hover:text-blue-800">- ?꾩튂/?뺣젹</a></li>
            <li><a href="#dropdown-preselected" className="text-blue-600 hover:text-blue-800">- ?ъ쟾 ?좏깮</a></li>
          </ul>
        </li>
        <li>
          <a href="#stats" className="text-blue-600 hover:text-blue-800">30. 吏??移대뱶 (Stat)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#stat-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯</a></li>
            <li><a href="#stat-more" className="text-blue-600 hover:text-blue-800">- 異붽? ?덉떆</a></li>
          </ul>
        </li>
        <li>
          <a href="#editors" className="text-blue-600 hover:text-blue-800">31. 由ъ튂 ?먮뵒??(EasyEditor)</a>
          <ul className="ml-4 mt-1 space-y-1">
            <li><a href="#editor-basic" className="text-blue-600 hover:text-blue-800">- 湲곕낯 ?ъ슜</a></li>
            <li><a href="#editor-bound" className="text-blue-600 hover:text-blue-800">- EasyObj ?ㅽ???/a></li>
            <li><a href="#editor-controlled" className="text-blue-600 hover:text-blue-800">- 而⑦듃濡ㅻ뱶 / HTML 吏곷젹??/a></li>
          </ul>
        </li>
      </ul>
    </section>
  );
};

export default TableOfContents;

\n        <li>\n          <a href="#pdfviewer" className="text-blue-600 hover:text-blue-800">32. PDF 뷰어 (PdfViewer)</a>\n          <ul className="ml-4 mt-1 space-y-1">\n            <li><a href="#pdf-basic" className="text-blue-600 hover:text-blue-800">- 기본</a></li>\n            <li><a href="#pdf-local" className="text-blue-600 hover:text-blue-800">- 로컬 파일</a></li>\n            <li><a href="#pdf-remote" className="text-blue-600 hover:text-blue-800">- 원격 URL</a></li>\n          </ul>\n        </li>
