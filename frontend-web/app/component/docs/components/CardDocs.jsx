import DocSection from '../shared/DocSection';
import CardExamples from '../examples/CardExamples';

const CardDocs = () => (
  <section id="cards" className="space-y-4">
    <DocSection title="18. 카드 (Card)" anchor="cards">
      <p className="text-gray-700">헤더/본문/푸터 구성 컴포넌트. SSR/CSR 모두 경량.</p>
      <CardExamples />
    </DocSection>
  </section>
);

export default CardDocs;

