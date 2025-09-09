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
      <div className="grid grid-cols-1 gap-8">
        {examples.map((ex, i) => (
          <div key={i}>
            {ex.component}
            <div className="mt-2 text-sm text-gray-600">{ex.description}</div>
            <CodeBlock code={ex.code} />
          </div>
        ))}
      </div>
    </DocSection>
  );
};

export default SwitchDocs;

