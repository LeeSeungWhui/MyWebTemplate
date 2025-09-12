/**
 * 파일명: StatDocs.jsx
 * 설명: Stat(지표) 카드 문서
 */
import { StatExamples } from '../examples/StatExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const StatDocs = () => {
  const examples = StatExamples();
  return (
    <DocSection id="stats" title="30. 지표 카드 (Stat)" description={<p>간단한 KPI/지표를 보여주는 카드. 아이콘은 aria-hidden, 값/증감에는 라벨 제공.</p>}>
      <div id="stat-basic" className="mb-8">
        <h3 className="text-lg font-medium mb-4">기본</h3>
        <div>
          {examples[0]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[0]?.description}</div>
          <CodeBlock code={examples[0]?.code || ''} />
        </div>
      </div>
      <div id="stat-more" className="mb-8">
        <h3 className="text-lg font-medium mb-4">추가 예시</h3>
        <div>
          {examples[1]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[1]?.description}</div>
          <CodeBlock code={examples[1]?.code || ''} />
        </div>
        <div className="mt-6">
          {examples[2]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[2]?.description}</div>
          <CodeBlock code={examples[2]?.code || ''} />
        </div>
      </div>
    </DocSection>
  );
};

export default StatDocs;
