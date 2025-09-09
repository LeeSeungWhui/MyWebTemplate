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
      <div id="badge-variants" className="mb-8">
        <h3 className="text-lg font-medium mb-4">색상 Variants</h3>
        <div>
          {examples[0]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[0]?.description}</div>
          <CodeBlock code={examples[0]?.code || ''} />
        </div>
      </div>

      <div id="badge-outline-pill" className="mb-8">
        <h3 className="text-lg font-medium mb-4">Outline / Pill</h3>
        <div>
          {examples[1]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[1]?.description}</div>
          <CodeBlock code={examples[1]?.code || ''} />
        </div>
      </div>

      <div id="badge-sizes" className="mb-8">
        <h3 className="text-lg font-medium mb-4">크기</h3>
        <div>
          {examples[2]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[2]?.description}</div>
          <CodeBlock code={examples[2]?.code || ''} />
        </div>
      </div>

      <div id="badge-icons" className="mb-8">
        <h3 className="text-lg font-medium mb-4">아이콘 포함</h3>
        <div>
          {examples[3]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[3]?.description}</div>
          <CodeBlock code={examples[3]?.code || ''} />
        </div>
      </div>
    </DocSection>
  );
};

export default BadgeDocs;
