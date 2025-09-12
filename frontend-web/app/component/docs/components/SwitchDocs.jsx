import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { SwitchExamples } from '../examples/SwitchExamples';
import Switch from '../../lib/component/Switch';

const SwitchDocs = () => {
  const examples = SwitchExamples();
  return (
    <DocSection
      id="switches"
      title="16. 스위치 (Switch)"
      component={Switch} description={
        <div>
          <p>접근성을 준수하기 위해 role="switch"와 aria-checked를 사용합니다. dataObj와 dataKey 또는 제어 모드를 지원합니다.</p>
          <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
            <li><code>checked?</code>: 선택 상태 제어</li>
            <li><code>defaultChecked?</code>: 초기 선택 상태</li>
            <li><code>dataObj?/dataKey?</code>: 바운드 상태 객체와 키</li>
            <li><code>disabled?</code>: 비활성화 여부</li>
            <li><code>label?</code>: 스위치 라벨</li>
          </ul>
        </div>
      }
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
