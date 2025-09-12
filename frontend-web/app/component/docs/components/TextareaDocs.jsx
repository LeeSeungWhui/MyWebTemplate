import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { TextareaExamples } from '../examples/TextareaExamples';
import Textarea from '@/lib/component/Textarea';

const TextareaDocs = () => {
  const examples = TextareaExamples();
  return (
    <DocSection
      id="textareas"
      title="17. 텍스트영역 (Textarea)"
      component={Textarea} description={
        <div>
          <p>바운드와 컨트롤드 모드를 지원하며 줄바꿈을 보존하고 aria-invalid를 사용합니다.</p>
          <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
            <li><code>rows?</code>: 기본 줄 수 (기본: 4)</li>
            <li><code>dataObj?/dataKey?</code>: 바운드 상태 객체와 키</li>
            <li><code>value?</code>: 제어 값</li>
            <li><code>error?</code>: 에러 메시지</li>
            <li><code>disabled?/readOnly?</code>: 상태 제어</li>
          </ul>
        </div>
      }
    >
      <div id="textarea-bound" className="mb-8">
        <h3 className="text-lg font-medium mb-4">바운드 모드</h3>
        <div>
          {examples[0]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[0]?.description}</div>
          <CodeBlock code={examples[0]?.code || ''} />
        </div>
      </div>

      <div id="textarea-controlled" className="mb-8">
        <h3 className="text-lg font-medium mb-4">컨트롤드 모드</h3>
        <div>
          {examples[1]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[1]?.description}</div>
          <CodeBlock code={examples[1]?.code || ''} />
        </div>
      </div>

      <div id="textarea-error" className="mb-8">
        <h3 className="text-lg font-medium mb-4">검증/에러 상태</h3>
        <div>
          {examples[2]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[2]?.description}</div>
          <CodeBlock code={examples[2]?.code || ''} />
        </div>
      </div>

      <div id="textarea-states" className="mb-8">
        <h3 className="text-lg font-medium mb-4">읽기 전용/비활성</h3>
        <div>
          {examples[3]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[3]?.description}</div>
          <CodeBlock code={examples[3]?.code || ''} />
        </div>
      </div>
    </DocSection>
  );
};

export default TextareaDocs;

