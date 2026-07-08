/**
 * 파일명: SkeletonDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Skeleton 컴포넌트 문서
 */
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { textExampleList, avatarExampleList, cardExampleList } from '../examples/SkeletonExamples';

const skeletonPropList = [
  { name: 'variant?', description: 'rect, text, circle 형태 선택' },
  { name: 'lines?', description: 'text variant의 라인 수' },
  { name: 'circleSize?', description: 'circle variant의 크기(px)' },
  { name: 'className?', description: '높이, 너비, 여백 등 추가 클래스' },
];

const skeletonExampleSectionList = [
  {
    id: 'skeleton-text',
    eyebrow: 'EXAMPLE 1',
    title: '텍스트 로딩',
    summary: '문단 또는 리스트가 로딩 중일 때 콘텐츠 밀도를 미리 보여줍니다.',
    example: textExampleList[0],
  },
  {
    id: 'skeleton-composed',
    eyebrow: 'EXAMPLE 2',
    title: '아바타 + 텍스트',
    summary: '프로필, 댓글, 활동 로그처럼 반복되는 행 구조에 사용합니다.',
    example: avatarExampleList[0],
  },
  {
    id: 'skeleton-card',
    eyebrow: 'EXAMPLE 3',
    title: '카드 스켈레톤',
    summary: '대시보드 카드가 로딩 중일 때 최종 레이아웃을 안정적으로 유지합니다.',
    example: cardExampleList[0],
  },
];

/**
 * @description Skeleton 문서 섹션을 구성하고 예제 목록을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const SkeletonDocs = () => {
  return <DocSection id="skeletons" title="23. 스켈레톤 (Skeleton)" description={<div className="space-y-4 rounded-xl bg-slate-50/80 p-5 text-sm text-slate-700 ring-1 ring-slate-900/5">
        <p>Skeleton은 실제 데이터가 도착하기 전에도 화면의 구조와 밀도를 유지하는 로딩 플레이스홀더입니다. 목록, 프로필, 카드처럼 반복되는 패턴을 먼저 보여주면 레이아웃 흔들림이 줄어듭니다.</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {skeletonPropList.map((propItem) => (
            <div key={propItem.name} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
              <code className="text-xs font-semibold text-indigo-700">{propItem.name}</code>
              <p className="mt-1 text-xs text-slate-500">{propItem.description}</p>
            </div>
          ))}
        </div>
      </div>}>
      <div className="space-y-8">
        {skeletonExampleSectionList.map((exampleSection) => (
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

export default SkeletonDocs;
