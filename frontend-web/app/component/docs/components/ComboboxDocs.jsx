import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { ComboboxExamples } from '../examples/ComboboxExamples';

const ComboboxDocs = () => {
  const ex = ComboboxExamples();
  return (
    <DocSection
      id="comboboxes"
      title="22. 콤보박스 (Combobox)"
      description={<p>검색 가능한 단일/다중 선택 입력. dataList(selected) 기반 선택 모델, 초성검색 지원.</p>}
    >
      <div id="combobox-basic" className="mb-8">
        <h3 className="text-lg font-medium mb-4">기본</h3>
        <div>
          {ex[0]?.component}
          <div className="mt-2 text-sm text-gray-600">{ex[0]?.description}</div>
          <CodeBlock code={ex[0]?.code || ''} />
        </div>
      </div>

      <div id="combobox-bound" className="mb-8">
        <h3 className="text-lg font-medium mb-4">바운드</h3>
        <div>
          {ex[1]?.component}
          <div className="mt-2 text-sm text-gray-600">{ex[1]?.description}</div>
          <CodeBlock code={ex[1]?.code || ''} />
        </div>
      </div>

      <div id="combobox-multi" className="mb-8">
        <h3 className="text-lg font-medium mb-4">다중 선택</h3>
        <div>
          {ex[2]?.component}
          <div className="mt-2 text-sm text-gray-600">{ex[2]?.description}</div>
          <CodeBlock code={ex[2]?.code || ''} />
        </div>
      </div>

      <div id="combobox-multi-advanced" className="mb-8">
        <h3 className="text-lg font-medium mb-4">요약/전체 선택</h3>
        <div>
          {ex[3]?.component}
          <div className="mt-2 text-sm text-gray-600">{ex[3]?.description}</div>
          <CodeBlock code={ex[3]?.code || ''} />
        </div>
      </div>
    </DocSection>
  );
};

export default ComboboxDocs;
