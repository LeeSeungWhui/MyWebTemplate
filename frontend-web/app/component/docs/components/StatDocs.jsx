/**
 * 파일명: StatDocs.jsx
 * 설명: Stat(지표) 카드 문서
 */
import * as Lib from '@/lib';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const StatDocs = () => {
  return (
    <DocSection id="stats" title="30. 지표 카드 (Stat)" description={<p>간단한 KPI/지표를 보여주는 카드. 아이콘은 aria-hidden, 값/증감에는 라벨 제공.</p>}>
      <div id="stat-basic" className="mb-8">
        <h3 className="text-lg font-medium mb-4">기본</h3>
        <div className="flex flex-col gap-2">
          <Lib.Stat label="주간 활성 사용자" value="12,340" delta="+3.2%" deltaType="up" />
          <CodeBlock code={`<Stat label="주간 활성 사용자" value="12,340" delta="+3.2%" deltaType="up" />`} />
        </div>
      </div>
    </DocSection>
  );
};

export default StatDocs;
