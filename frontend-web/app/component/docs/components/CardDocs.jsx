import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { CardExamples } from '../examples/CardExamples';

const CardDocs = () => {
  const examples = CardExamples();
  return (
    <DocSection
      id="cards"
      title="18. 카드 (Card)"
      description={<p>헤더/본문/푸터 구성 컴포넌트. SSR/CSR 모두 경량.</p>}
    >
      <div id="card-basic" className="mb-8">
        <h3 className="text-lg font-medium mb-4">기본 Card</h3>
        <div>
          {examples[0]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[0]?.description}</div>
          <CodeBlock code={examples[0]?.code || ''} />
        </div>
      </div>

      <div id="card-actions" className="mb-8">
        <h3 className="text-lg font-medium mb-4">액션/푸터</h3>
        <div>
          {examples[1]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[1]?.description}</div>
          <CodeBlock code={examples[1]?.code || ''} />
        </div>
      </div>

      <div id="card-plain" className="mb-8">
        <h3 className="text-lg font-medium mb-4">본문 전용</h3>
        <div>
          {examples[2]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[2]?.description}</div>
          <CodeBlock code={examples[2]?.code || ''} />
        </div>
      </div>

      <div id="card-composed" className="mb-8">
        <h3 className="text-lg font-medium mb-4">조합 예시</h3>
        <div>
          {examples[3]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[3]?.description}</div>
          <CodeBlock code={examples[3]?.code || ''} />
        </div>
      </div>
    </DocSection>
  );
};

export default CardDocs;
