/**
 * 파일명: StatDocs.jsx
 * 설명: Stat(지표) 카드 문서
 */
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const StatDocs = () => {
  return (
    <DocSection id="stats" title="30. 지표 카드 (Stat)" description={<p>간단한 KPI/지표는 Card 변형으로 구현합니다. 아이콘은 aria-hidden, 텍스트 라벨 제공.</p>}>
      <div id="stat-basic" className="mb-8">
        <h3 className="text-lg font-medium mb-4">기본</h3>
        <div>
          <CodeBlock code={`<Lib.Card title="주간 활성 사용자">
  <div className="flex items-center gap-2">
    <span className="text-2xl font-bold" aria-label="값">12,340</span>
    <span className="text-green-600 text-sm" aria-label="증감">+3.2%</span>
  </div>
</Lib.Card>`} />
        </div>
      </div>
    </DocSection>
  );
};

export default StatDocs;

