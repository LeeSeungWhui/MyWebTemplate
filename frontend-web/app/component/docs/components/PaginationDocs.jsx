/**
 * 파일명: PaginationDocs.jsx
 * 설명: 경량 Pagination 문서 (Table 내장 페이징 기준)
 */
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const PaginationDocs = () => {
  return (
    <DocSection id="pagination" title="28. 페이지네이션 (Pagination)" description={<p>Table 컴포넌트의 내장 페이징을 통해 제어형/비제어, URL/스토리지 보존을 지원합니다.</p>}>
      <div id="pagination-basic" className="mb-8">
        <h3 className="text-lg font-medium mb-4">기본</h3>
        <div>
          <CodeBlock code={`<Lib.Table data={data} columns={columns} pageSize={10} />`} />
        </div>
      </div>
      <div id="pagination-advanced" className="mb-8">
        <h3 className="text-lg font-medium mb-4">고급 (URL/스토리지/제어형)</h3>
        <div>
          <CodeBlock code={`<Lib.Table data={data} columns={columns} pageParam="page" persistKey="table" page={page} onPageChange={setPage} />`} />
        </div>
      </div>
    </DocSection>
  );
};

export default PaginationDocs;

