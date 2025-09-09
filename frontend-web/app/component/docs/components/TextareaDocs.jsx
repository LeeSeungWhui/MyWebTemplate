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

export default TextareaDocs;

