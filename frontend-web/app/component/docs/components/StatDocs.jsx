/**
 * 파일명: StatDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Stat(지표) 카드 문서
 */
import { basicExampleList, extraExampleList } from '../examples/StatExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const statPropList = [
  { name: 'label', description: '지표 이름 또는 기준' },
  { name: 'value', description: '강조 표시할 핵심 값' },
  { name: 'delta?', description: '증감률 또는 상태 변화' },
  { name: 'deltaType?', description: 'up, down, neutral 변화 방향' },
  { name: 'icon?', description: '우측 보조 아이콘 노드' },
  { name: 'helpText?', description: '하단 보조 설명' },
  { name: 'className?', description: '루트 추가 클래스' },
];

const statExampleSectionList = [
  {
    id: 'stat-basic',
    eyebrow: 'EXAMPLE 1',
    title: '기본 KPI',
    summary: '가장 중요한 지표를 카드 한 장으로 명확하게 보여줍니다.',
    example: basicExampleList[0],
  },
  {
    id: 'stat-more',
    eyebrow: 'EXAMPLE 2',
    title: '운영 지표 묶음',
    summary: '상승/하락/중립 지표를 같은 grid 안에서 비교합니다.',
    example: extraExampleList[0],
  },
  {
    id: 'stat-service',
    eyebrow: 'EXAMPLE 3',
    title: '서비스 상태',
    summary: '값이 숫자가 아니어도 상태와 도움말을 함께 전달할 수 있습니다.',
    example: extraExampleList[1],
  },
];

/**
 * Stat 문서 섹션
 * @date 2025-09-13
 */

/**
 * @description Stat 문서 섹션을 구성하고 예제 목록을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const StatDocs = () => {
  return <DocSection id="stats" title="22. 지표 카드 (Stat)" description={<div className="space-y-4 rounded-xl bg-slate-50/80 p-5 text-sm text-slate-700 ring-1 ring-slate-900/5">
      <p>Stat은 대시보드와 관리 화면에서 핵심 KPI를 한눈에 보여주는 요약 카드입니다. 값, 증감, 아이콘, 도움말을 조합해 숫자형 지표와 상태형 지표를 같은 규칙으로 표시합니다.</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {statPropList.map((propItem) => (
          <div key={propItem.name} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
            <code className="text-xs font-semibold text-indigo-700">{propItem.name}</code>
            <p className="mt-1 text-xs text-slate-500">{propItem.description}</p>
          </div>
        ))}
      </div>
    </div>}>
      <div className="space-y-8">
        {statExampleSectionList.map((exampleSection) => (
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

export default StatDocs;
