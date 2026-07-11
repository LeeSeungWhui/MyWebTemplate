/**
 * 파일명: TableDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Table 컴포넌트 문서
 */
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { basicExampleObj, cardExampleObj, controlExampleObj, emptyExampleObj, styleExampleObj } from '../examples/TableExamples';

const tablePropGroupList = [
  {
    title: '데이터',
    items: ['data/dataList', 'columns', 'rowKey?'],
  },
  {
    title: '페이지',
    items: ['page?', 'pageSize?', 'defaultPage?', 'onPageChange?', 'pageParam?', 'persistKey?'],
  },
  {
    title: '표현',
    items: ['variant?', 'renderCard?', 'gridClassName?', 'empty?', 'loading?', 'status?'],
  },
  {
    title: '스타일',
    items: ['className?', 'headerClassName?', 'rowClassName?', 'cellClassName?', 'rowsClassName?'],
  },
];

const tableExampleSectionList = [
  {
    id: 'table-basic',
    eyebrow: 'EXAMPLE 1',
    title: '기본 테이블',
    summary: '주소의 검색 조건과 세션 저장 값을 함께 사용하는 기본 데이터 테이블입니다.',
    example: basicExampleObj,
  },
  {
    id: 'table-controlled',
    eyebrow: 'EXAMPLE 2',
    title: '외부 상태 제어',
    summary: 'page/onPageChange를 외부 상태로 관리하는 제어형 페이지네이션 예시입니다.',
    example: controlExampleObj,
  },
  {
    id: 'table-card',
    eyebrow: 'EXAMPLE 3',
    title: '카드 변형',
    summary: '같은 데이터 소스를 카드 그리드로 보여주는 사용자 목록 패턴입니다.',
    example: cardExampleObj,
  },
  {
    id: 'table-styled',
    eyebrow: 'EXAMPLE 4',
    title: '커스텀 스타일',
    summary: '행과 셀을 분리된 카드처럼 표현한 정돈된 업무 화면 스타일입니다.',
    example: styleExampleObj,
  },
  {
    id: 'table-empty',
    eyebrow: 'EXAMPLE 5',
    title: '빈 상태',
    summary: '데이터가 없을 때 사용자에게 명확한 안내를 제공하는 상태 예시입니다.',
    example: emptyExampleObj,
  },
];

/**
 * @description Table 문서 섹션을 구성하고 예제 목록을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const TableDocs = () => {
  return (
    <DocSection id="tables" title="26. 테이블 (Table)" description={
      <div className="space-y-4 rounded-xl bg-slate-50/80 p-5 text-sm text-slate-700 ring-1 ring-slate-900/5">
        <p>데이터 테이블과 카드 목록을 같은 사용 방식으로 렌더링합니다. 외부 상태 제어 또는 자체 페이지 이동, 주소 검색 조건, 브라우저 저장 값 유지를 지원해 실제 관리 화면의 목록 경험을 빠르게 구성할 수 있습니다.</p>
        <div className="grid gap-3 md:grid-cols-2">
          {tablePropGroupList.map((groupItem) => (
            <div key={groupItem.title} className="rounded-lg bg-white p-3 ring-1 ring-slate-200/80">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{groupItem.title}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {groupItem.items.map((propName) => (
                  <code key={propName} className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">{propName}</code>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <div className="space-y-8">
        {tableExampleSectionList.map((exampleSection) => (
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
    </DocSection>
  );
};

export default TableDocs;
