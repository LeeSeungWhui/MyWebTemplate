import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { BadgeExamples } from '../examples/BadgeExamples';

const BadgeDocs = () => {
  const examples = BadgeExamples();
  return (
    <DocSection
      id="badges"
      title="19. 배지/태그 (Badge/Tag)"
      description={<p>상태 표시용 레이블. 색상/크기/모양 지원</p>}
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

export default BadgeDocs;

