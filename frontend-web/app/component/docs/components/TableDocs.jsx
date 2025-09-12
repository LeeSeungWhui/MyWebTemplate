/**
 * TableDocs.jsx
 * Table 컴포넌트 문서
 */
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { TableExamples } from '../examples/TableExamples';

const TableDocs = () => {
  const examples = TableExamples();
  return (
    <DocSection id="tables" title="27. 테이블 (Table)" description={<p>데이터 테이블/카드 리스트. 제어형/비제어 페이징, URL/스토리지 보존 지원.</p>}>
      <div id="table-basic" className="mb-8">
        <h3 className="text-lg font-medium mb-4">기본</h3>
        <div>
          {examples[0]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[0]?.description}</div>
          <CodeBlock code={examples[0]?.code || ''} />
        </div>
      </div>
      <div id="table-controlled" className="mb-8">
        <h3 className="text-lg font-medium mb-4">제어형 페이지</h3>
        <div>
          {examples[1]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[1]?.description}</div>
          <CodeBlock code={examples[1]?.code || ''} />
        </div>
      </div>
      <div id="table-card" className="mb-8">
        <h3 className="text-lg font-medium mb-4">카드</h3>
        <div>
          {examples[2]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[2]?.description}</div>
          <CodeBlock code={examples[2]?.code || ''} />
        </div>
      </div>
      <div id="table-styled" className="mb-8">
        <h3 className="text-lg font-medium mb-4">커스텀 스타일</h3>
        <div>
          {examples[3]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[3]?.description}</div>
          <CodeBlock code={examples[3]?.code || ''} />
        </div>
      </div>
      <div id="table-empty" className="mb-8">
        <h3 className="text-lg font-medium mb-4">빈 상태</h3>
        <div>
          {examples[4]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[4]?.description}</div>
          <CodeBlock code={examples[4]?.code || ''} />
        </div>
      </div>
    </DocSection>
  );
};

export default TableDocs;

