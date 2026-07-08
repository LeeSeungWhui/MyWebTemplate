/**
 * 파일명: PaginationDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: 경량 Pagination 문서 (독립 컴포넌트 + Table 내장 사용)
 */
import { basicExampleObj, limitExampleObj } from '../examples/PaginationExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const paginationPropList = [
  { name: 'page', description: '현재 페이지 번호 (1부터)' },
  { name: 'pageCount', description: '전체 페이지 수' },
  { name: 'onChange', description: '페이지 변경 시 새 페이지 전달' },
  { name: 'maxButtons?', description: '표시할 최대 번호 버튼' },
  { name: 'showEdges?', description: '처음/끝 버튼과 생략 표시 여부' },
  { name: 'className?', description: '래퍼 추가 클래스' },
];

const paginationExampleSectionList = [
  {
    id: 'pagination-basic',
    eyebrow: 'EXAMPLE 1',
    title: '기본 제어형 페이지네이션',
    summary: '목록 하단에 바로 넣기 좋은 기본 page/onChange 패턴입니다.',
    example: basicExampleObj,
  },
  {
    id: 'pagination-advanced',
    eyebrow: 'EXAMPLE 2',
    title: '대용량/버튼 제한',
    summary: '페이지 수가 많을 때 번호 버튼을 제한하고 edge 이동을 유지하는 패턴입니다.',
    example: limitExampleObj,
  },
];

/**
 * @description Pagination 문서 섹션을 구성하고 예제 목록을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const PaginationDocs = () => {
  return <DocSection id="pagination" title="27. 페이지네이션 (Pagination)" description={<div className="space-y-4 rounded-xl bg-slate-50/80 p-5 text-sm text-slate-700 ring-1 ring-slate-900/5">
      <p>독립 컴포넌트로 제어형 페이지 이동을 제공하며, Table 내장 페이징과 같은 상호작용 계약을 공유합니다. 목록 하단의 방향 버튼, edge 이동, 번호 윈도우를 일관된 컨트롤로 제공합니다.</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {paginationPropList.map((propItem) => (
          <div key={propItem.name} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
            <code className="text-xs font-semibold text-indigo-700">{propItem.name}</code>
            <p className="mt-1 text-xs text-slate-500">{propItem.description}</p>
          </div>
        ))}
      </div>
    </div>}>
      <div className="space-y-8">
        {paginationExampleSectionList.map((exampleSection) => (
          <div key={exampleSection.id} id={exampleSection.id} className="scroll-mt-24 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
            <div className="mb-4 flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{exampleSection.eyebrow}</span>
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">{exampleSection.title}</h3>
              <p className="text-sm text-slate-500">{exampleSection.summary}</p>
            </div>
            <div className="rounded-xl bg-slate-50/80 p-5 ring-1 ring-slate-200/80">
              {exampleSection.example.component}
            </div>
            <div className="mt-3 text-sm text-slate-600">{exampleSection.example.description}</div>
            <div className="mt-4">
              <CodeBlock code={exampleSection.example.code} />
            </div>
          </div>
        ))}
      </div>
    </DocSection>;
};

export default PaginationDocs;
