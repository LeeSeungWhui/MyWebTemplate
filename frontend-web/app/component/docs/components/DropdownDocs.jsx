/**
 * 파일명: DropdownDocs.jsx
 * 설명: Dropdown 문서 (EasyList 기반)
 */
import { DropdownExamples } from '../examples/DropdownExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const DropdownDocs = () => {
  const examples = DropdownExamples();

  return (
    <DocSection id="dropdowns" title="29. 드롭다운 (Dropdown)" description={<p>EasyList(dataList) 기반. 선택 상태는 dataList.selected에 반영되므로 별도 useState가 필요 없습니다. 키보드(↑/↓/Enter/ESC)와 외부 클릭 닫힘 지원.</p>}>
      <div id="dropdown-basic" className="mb-8">
        <h3 className="text-lg font-medium mb-4">기본</h3>
        <div>
          {examples[0]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[0]?.description}</div>
          <CodeBlock code={examples[0]?.code || ''} />
        </div>
      </div>
      <div id="dropdown-styles" className="mb-8">
        <h3 className="text-lg font-medium mb-4">스타일 변형</h3>
        <div>
          {examples[1]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[1]?.description}</div>
          <CodeBlock code={examples[1]?.code || ''} />
        </div>
      </div>
      <div id="dropdown-custom-trigger" className="mb-8">
        <h3 className="text-lg font-medium mb-4">커스텀 트리거</h3>
        <div>
          {examples[2]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[2]?.description}</div>
          <CodeBlock code={examples[2]?.code || ''} />
        </div>
      </div>
      <div id="dropdown-placement" className="mb-8">
        <h3 className="text-lg font-medium mb-4">위치/정렬</h3>
        <div>
          {examples[3]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[3]?.description}</div>
          <CodeBlock code={examples[3]?.code || ''} />
        </div>
      </div>
      <div id="dropdown-preselected" className="mb-8">
        <h3 className="text-lg font-medium mb-4">사전 선택</h3>
        <div>
          {examples[4]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[4]?.description}</div>
          <CodeBlock code={examples[4]?.code || ''} />
        </div>
      </div>
    </DocSection>
  );
};

export default DropdownDocs;
