/**
 * 파일명: PaginationDocs.jsx
 * 설명: 경량 Pagination 문서 (독립 컴포넌트 + Table 내장 사용)
 */
import { useState } from 'react';
import * as Lib from '@/lib';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const PaginationDocs = () => {
  const [page, setPage] = useState(2);
  const pageCount = 12;
  return (
    <DocSection id="pagination" title="28. 페이지네이션 (Pagination)" description={<p>독립 컴포넌트로 제어형 페이지 이동을 제공하며, Table 내장 페이징으로도 사용할 수 있습니다.</p>}>
      <div id="pagination-basic" className="mb-8">
        <h3 className="text-lg font-medium mb-4">기본 (독립 컴포넌트)</h3>
        <div className="flex flex-col gap-2 items-start">
          <Lib.Pagination page={page} pageCount={pageCount} onChange={setPage} />
          <div className="text-sm text-gray-600">현재 페이지: {page} / {pageCount}</div>
          <CodeBlock code={`const [page, setPage] = useState(2);
<Lib.Pagination page={page} pageCount={12} onChange={setPage} />`} />
        </div>
      </div>
      <div id="pagination-advanced" className="mb-8">
        <h3 className="text-lg font-medium mb-4">Table 내장 페이징</h3>
        <div>
          <CodeBlock code={`<Lib.Table data={data} columns={columns} pageParam="page" persistKey="table" page={page} onPageChange={setPage} />`} />
        </div>
      </div>
    </DocSection>
  );
};

export default PaginationDocs;
