/**
 * 파일명: EmptyDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Empty 컴포넌트 문서
 */
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { basicExampleList, actionExampleList } from '../examples/EmptyExamples';

const emptyPropList = [
  { name: 'icon?', description: '상단 아이콘 이름' },
  { name: 'title?', description: '비어 있는 상태 제목' },
  { name: 'description?', description: '후속 행동을 안내하는 설명' },
  { name: 'children?', description: '추가 안내 또는 보조 콘텐츠' },
  { name: 'action?', description: '버튼 등 주요 액션 요소' },
  { name: 'className?', description: '루트 추가 클래스' },
];

const emptyExampleSectionList = [
  {
    id: 'empty-basic',
    eyebrow: 'EXAMPLE 1',
    title: '기본 Empty',
    summary: '목록이나 조회 결과가 비어 있을 때 간결한 안내를 제공합니다.',
    example: basicExampleList[0],
  },
  {
    id: 'empty-action',
    eyebrow: 'EXAMPLE 2',
    title: '설명/액션',
    summary: '사용자가 다음 행동을 바로 선택할 수 있도록 CTA를 함께 배치합니다.',
    example: actionExampleList[0],
  },
];

/**
 * @description Empty 문서 섹션을 구성하고 예제 목록을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const EmptyDocs = () => {
  return <DocSection id="empties" title="24. 엠티 (Empty)" description={<div className="space-y-4 rounded-xl bg-slate-50/80 p-5 text-sm text-slate-700 ring-1 ring-slate-900/5">
        <p>Empty는 데이터가 없거나 필터 결과가 비었을 때 상황과 다음 행동을 안내합니다. 단순한 빈 화면이 아니라, 사용자가 복구하거나 새 항목을 만들 수 있는 방향을 함께 제시합니다.</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {emptyPropList.map((propItem) => (
            <div key={propItem.name} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
              <code className="text-xs font-semibold text-indigo-700">{propItem.name}</code>
              <p className="mt-1 text-xs text-slate-500">{propItem.description}</p>
            </div>
          ))}
        </div>
      </div>}>
      <div className="space-y-8">
        {emptyExampleSectionList.map((exampleSection) => (
          <div key={exampleSection.id} id={exampleSection.id} className="scroll-mt-24 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
            <div className="mb-4 flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{exampleSection.eyebrow}</span>
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">{exampleSection.title}</h3>
              <p className="text-sm text-slate-500">{exampleSection.summary}</p>
            </div>
            <div className="rounded-xl bg-slate-50/80 p-5 ring-1 ring-slate-200/80">
              {exampleSection.example?.component}
            </div>
            <div className="mt-3 text-sm text-slate-600">{exampleSection.example?.description}</div>
            <div className="mt-4">
              <CodeBlock code={exampleSection.example?.code || ''} />
            </div>
          </div>
        ))}
      </div>
    </DocSection>;
};

export default EmptyDocs;
