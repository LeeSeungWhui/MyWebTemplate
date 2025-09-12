/**
 * 파일명: PaginationDocs.jsx
 * 설명: 경량 Pagination 문서 (독립 컴포넌트 + Table 내장 사용)
 */
import { PaginationExamples } from '../examples/PaginationExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const PaginationDocs = () => {
  const examples = PaginationExamples();
  return (
    <DocSection id="pagination" title="28. 페이지네이션 (Pagination)" description={<p>독립 컴포넌트로 제어형 페이지 이동을 제공하며, Table 내장 페이징으로도 사용할 수 있습니다.</p>}>
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
