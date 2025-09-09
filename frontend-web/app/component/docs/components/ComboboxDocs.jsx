import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { ComboboxExamples } from '../examples/ComboboxExamples';

const ComboboxDocs = () => {
  const examples = ComboboxExamples();
  return (
    <DocSection
      id="comboboxes"
      title="22. 콤보박스 (Combobox)"
      description={<p>검색 가능한 단일 선택 입력. dataList(selected) 기반 선택 모델, 초성검색 지원.</p>}
    >
      <div id="combobox-basic" className="mb-8">
        <h3 className="text-lg font-medium mb-4">기본</h3>
        <div>
          {examples[0]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[0]?.description}</div>
          <CodeBlock code={examples[0]?.code || ''} />
        </div>
      </div>

      <div id="combobox-unbound" className="mb-8">
        <h3 className="text-lg font-medium mb-4">언바운드</h3>
        <div>
          {examples[1]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[1]?.description}</div>
          <CodeBlock code={examples[1]?.code || ''} />
        </div>
      </div>
    </DocSection>
  );
};

export default ComboboxDocs;
