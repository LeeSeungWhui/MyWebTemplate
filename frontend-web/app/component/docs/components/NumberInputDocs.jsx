import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { NumberInputExamples } from '../examples/NumberInputExamples';

const NumberInputDocs = () => {
  const examples = NumberInputExamples();
  return (
    <DocSection
      id="number-inputs"
      title="20. 숫자 입력 (Number)"
      description={<p>스텝 버튼이 있는 숫자 입력. EasyObj 바운드/컨트롤드 지원.</p>}
    >
      <div id="number-basic" className="mb-8">
        <h3 className="text-lg font-medium mb-4">기본</h3>
        <div>
          {examples[0]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[0]?.description}</div>
          <CodeBlock code={examples[0]?.code || ''} />
        </div>
      </div>

      <div id="number-range" className="mb-8">
        <h3 className="text-lg font-medium mb-4">범위/스텝</h3>
        <div>
          {examples[1]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[1]?.description}</div>
          <CodeBlock code={examples[1]?.code || ''} />
        </div>
      </div>

      <div id="number-unbound" className="mb-8">
        <h3 className="text-lg font-medium mb-4">언바운드</h3>
        <div>
          {examples[2]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[2]?.description}</div>
          <CodeBlock code={examples[2]?.code || ''} />
        </div>
      </div>
    </DocSection>
  );
};

export default NumberInputDocs;

