/**
 * 파일명: StatDocs.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Stat(지표) 카드 문서
 */
import { StatExamples } from '../examples/StatExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

/**
 * Stat 문서 섹션
 * @date 2025-09-13
 */
const StatDocs = () => {
  const examples = StatExamples();
  return (
    <DocSection id="stats" title="30. 지표 카드 (Stat)" description={<div>
      <p>간단한 KPI/지표를 보여주는 카드. 아이콘은 aria-hidden, 값/증감에는 라벨 제공.</p>
      <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
        <li><code>label</code>: 지표 이름</li>
        <li><code>value</code>: 표시할 값</li>
        <li><code>delta?</code>: 증감 수치 또는 텍스트</li>
        <li><code>deltaType?</code>: 'up' | 'down' | 'neutral' (기본 neutral)</li>
        <li><code>icon?</code>: 우측 아이콘 노드</li>
        <li><code>helpText?</code>: 하단 보조 설명</li>
        <li><code>className?</code>: 루트 추가 클래스</li>
      </ul>
    </div>}> 
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
