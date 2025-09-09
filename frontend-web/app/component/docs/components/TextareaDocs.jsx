import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { TextareaExamples } from '../examples/TextareaExamples';

const TextareaDocs = () => {
  const examples = TextareaExamples();
  return (
    <DocSection
      id="textareas"
      title="17. 텍스트영역 (Textarea)"
      description={<p>바운드/컨트롤드 지원, 줄바꿈 보존, aria-invalid 사용.</p>}
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

