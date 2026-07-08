/**
 * 파일명: BadgeDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Badge 컴포넌트 문서
 */
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { variantExampleList, outlineExampleList, sizeExampleList, iconExampleList } from '../examples/BadgeExamples';

const badgePropList = [
  { name: 'children', description: '배지 내부에 표시할 텍스트 또는 아이콘' },
  { name: 'variant?', description: 'neutral, primary, success, warning, danger, outline' },
  { name: 'size?', description: 'sm 또는 md 크기 선택' },
  { name: 'pill?', description: '완전히 둥근 pill 형태로 표시' },
  { name: 'className?', description: '추가 Tailwind 클래스' },
];

const badgeExampleSectionList = [
  {
    id: 'badge-variants',
    eyebrow: 'EXAMPLE 1',
    title: '상태 Variants',
    summary: '운영 화면에서 자주 쓰는 상태값을 색상별로 빠르게 구분합니다.',
    example: variantExampleList[0],
  },
  {
    id: 'badge-outline-pill',
    eyebrow: 'EXAMPLE 2',
    title: 'Outline / Pill',
    summary: '강조도를 낮춘 보조 라벨과 둥근 상태 칩을 함께 보여줍니다.',
    example: outlineExampleList[0],
  },
  {
    id: 'badge-sizes',
    eyebrow: 'EXAMPLE 3',
    title: '크기',
    summary: '테이블 안의 작은 라벨과 카드 상단의 중간 라벨을 분리해 사용합니다.',
    example: sizeExampleList[0],
  },
  {
    id: 'badge-icons',
    eyebrow: 'EXAMPLE 4',
    title: '아이콘 포함',
    summary: '상태 의미가 중요한 곳에는 아이콘을 붙여 스캔 속도를 높입니다.',
    example: iconExampleList[0],
  },
];

/**
 * @description Badge 문서 섹션을 구성하고 예제 목록을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const BadgeDocs = () => {
  return <DocSection id="badges" title="21. 배지/태그 (Badge/Tag)" description={<div className="space-y-4 rounded-xl bg-slate-50/80 p-5 text-sm text-slate-700 ring-1 ring-slate-900/5">
          <p>Badge는 상태, 권한, 단계, 카테고리를 짧은 라벨로 표현하는 컴포넌트입니다. 채도가 낮은 slate/indigo 기반 surface 위에서 과하게 튀지 않도록 색상과 밀도를 정돈합니다.</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {badgePropList.map((propItem) => (
              <div key={propItem.name} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
                <code className="text-xs font-semibold text-indigo-700">{propItem.name}</code>
                <p className="mt-1 text-xs text-slate-500">{propItem.description}</p>
              </div>
            ))}
          </div>
        </div>}>
      <div className="space-y-8">
        {badgeExampleSectionList.map((exampleSection) => (
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

export default BadgeDocs;
