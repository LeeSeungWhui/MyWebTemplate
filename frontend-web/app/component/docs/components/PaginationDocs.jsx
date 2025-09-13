/**
 * 파일명: PaginationDocs.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 경량 Pagination 문서 (독립 컴포넌트 + Table 내장 사용)
 */
import { PaginationExamples } from '../examples/PaginationExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

/**
 * Pagination 문서 섹션
 * @date 2025-09-13
 */
const PaginationDocs = () => {
  const examples = PaginationExamples();
  return (
    <DocSection id="pagination" title="28. 페이지네이션 (Pagination)" description={<div>
      <p>독립 컴포넌트로 제어형 페이지 이동을 제공하며, Table 내장 페이징으로도 사용할 수 있습니다.</p>
      <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
        <li><code>page</code>: 현재 페이지 번호 (1부터)</li>
        <li><code>pageCount</code>: 전체 페이지 수</li>
        <li><code>onChange</code>: 페이지 변경 시 호출 (새 페이지 전달)</li>
        <li><code>maxButtons?</code>: 표시할 최대 번호 버튼 (기본 7)</li>
        <li><code>showEdges?</code>: 처음/끝 버튼 및 ... 표시 여부 (기본 true)</li>
        <li><code>className?</code>: 래퍼 추가 클래스</li>
      </ul>
    </div>}> 
      <div id="pagination-basic" className="mb-8">
        <h3 className="text-lg font-medium mb-4">기본 (독립 컴포넌트)</h3>
        <div>
          {examples[0]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[0]?.description}</div>
          <CodeBlock code={examples[0]?.code || ''} />
        </div>
      </div>
      <div id="pagination-advanced" className="mb-8">
        <h3 className="text-lg font-medium mb-4">대용량/버튼 제한</h3>
        <div>
          {examples[1]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[1]?.description}</div>
          <CodeBlock code={examples[1]?.code || ''} />
        </div>
      </div>
    </DocSection>
  );
};

export default PaginationDocs;
