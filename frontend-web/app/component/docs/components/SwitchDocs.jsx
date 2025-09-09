import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { SwitchExamples } from '../examples/SwitchExamples';

const SwitchDocs = () => {
  const examples = SwitchExamples();
  return (
    <DocSection
      id="switches"
      title="16. 스위치 (Switch)"
      description={<p>접근성 준수: role="switch"/aria-checked 사용. dataObj+dataKey 또는 controlled 지원</p>}
    >
      <div id="switch-bound" className="mb-8">
        <h3 className="text-lg font-medium mb-4">바운드 모드</h3>
        <div>
          {examples[0]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[0]?.description}</div>
          <CodeBlock code={examples[0]?.code || ''} />
        </div>
      </div>

      <div id="switch-controlled" className="mb-8">
        <h3 className="text-lg font-medium mb-4">컨트롤드 모드</h3>
        <div>
          {examples[1]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[1]?.description}</div>
          <CodeBlock code={examples[1]?.code || ''} />
        </div>
      </div>

      <div id="switch-disabled" className="mb-8">
        <h3 className="text-lg font-medium mb-4">비활성/기본값</h3>
        <div>
          {examples[2]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[2]?.description}</div>
          <CodeBlock code={examples[2]?.code || ''} />
        </div>
      </div>

      <div id="switch-a11y" className="mb-8">
        <h3 className="text-lg font-medium mb-4">접근성</h3>
        <div>
          {examples[3]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[3]?.description}</div>
          <CodeBlock code={examples[3]?.code || ''} />
        </div>
      </div>
    </DocSection>
  );
};

export default SwitchDocs;
