/**
 * 파일명: DropdownDocs.jsx
 * 설명: Dropdown 문서 (간단 메뉴/리스트 UX 가이드)
 */
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const DropdownDocs = () => {
  return (
    <DocSection id="dropdowns" title="29. 드롭다운 (Dropdown)" description={<p>간단한 메뉴/리스트는 Button + absolute 패턴과 키보드 접근성(aria-expanded, role=menu)을 권장합니다.</p>}>
      <div id="dropdown-basic" className="mb-8">
        <h3 className="text-lg font-medium mb-4">기본</h3>
        <div>
          <CodeBlock code={`<div className="relative">
  <button aria-haspopup="menu" aria-expanded={open}>메뉴</button>
  {open && (
    <ul role="menu" className="absolute mt-2 bg-white shadow rounded">
      <li role="menuitem"><button>항목 1</button></li>
      <li role="menuitem"><button>항목 2</button></li>
    </ul>
  )}
</div>`} />
        </div>
      </div>
    </DocSection>
  );
};

export default DropdownDocs;

