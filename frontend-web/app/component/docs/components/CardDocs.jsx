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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

export default CardDocs;
