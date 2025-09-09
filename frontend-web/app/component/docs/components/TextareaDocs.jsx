import DocSection from '../shared/DocSection';
import TextareaExamples from '../examples/TextareaExamples';

const TextareaDocs = () => (
  <section id="textareas" className="space-y-4">
    <DocSection title="17. 텍스트영역 (Textarea)" anchor="textareas">
      <p className="text-gray-700">바운드/컨트롤드 지원, 줄바꿈 보존, aria-invalid 적용.</p>
      <TextareaExamples />
    </DocSection>
  </section>
);

export default TextareaDocs;

