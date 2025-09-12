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
    <DocSection id="tables" title="27. 테이블 (Table)" description={
      <div>
        <p>데이터 테이블과 카드 리스트를 렌더링합니다. 제어형 및 비제어 페이징을 지원하며 URL과 스토리지에 상태를 보존합니다.</p>
        <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
          <li><code>data</code>: 행 데이터 배열/EasyList</li>
          <li><code>columns</code>: 열 정의 배열</li>
          <li><code>page?/pageSize?</code>: 현재 페이지 및 페이지당 행 수</li>
          <li><code>variant?</code>: 'table' | 'card'</li>
          <li><code>onPageChange?</code>: 페이지 변경 콜백</li>
        </ul>
      </div>
    }>
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

