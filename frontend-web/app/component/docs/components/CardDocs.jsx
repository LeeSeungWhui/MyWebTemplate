/**
 * 파일명: CardDocs.jsx
 * 설명: Card 컴포넌트 문서
 */
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { CardExamples } from '../examples/CardExamples';

const CardDocs = () => {
  const examples = CardExamples();
  return (
    <DocSection
      id="cards"
      title="18. 카드 (Card)" description={
        <div>
          <p>헤더, 본문, 푸터로 구성된 컴포넌트입니다.</p>
          <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
            <li><code>children</code>: 본문 콘텐츠</li>
            <li><code>title?</code>: 헤더에 표시할 제목</li>
            <li><code>subtitle?</code>: 제목 아래 보조 텍스트</li>
            <li><code>actions?</code>: 헤더 우측 액션 요소</li>
            <li><code>footer?</code>: 하단 푸터 콘텐츠</li>
            <li><code>className?</code>: 추가 Tailwind 클래스</li>
          </ul>
        </div>
      }
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
