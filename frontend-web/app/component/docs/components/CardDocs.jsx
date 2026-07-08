"use client";

/**
 * 파일명: CardDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Card 컴포넌트 문서
 */
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { basicExampleList, actionExampleList, plainExampleList, composedExampleList } from '../examples/CardExamples';

const cardPropList = [
  { name: 'children', description: '본문 콘텐츠' },
  { name: 'title?', description: '헤더 제목' },
  { name: 'subtitle?', description: '제목 아래 보조 텍스트' },
  { name: 'actions?', description: '헤더 우측 액션 요소' },
  { name: 'footer?', description: '하단 푸터 콘텐츠' },
  { name: 'className?', description: '추가 Tailwind 클래스' },
];

const cardExampleSectionList = [
  {
    id: 'card-basic',
    eyebrow: 'EXAMPLE 1',
    title: '기본 Card',
    summary: '콘텐츠를 한 덩어리로 묶는 가장 기본적인 카드 구조입니다.',
    example: basicExampleList[0],
  },
  {
    id: 'card-actions',
    eyebrow: 'EXAMPLE 2',
    title: '액션/푸터',
    summary: '헤더 액션과 푸터 메타 정보를 함께 배치한 운영 화면형 카드입니다.',
    example: actionExampleList[0],
  },
  {
    id: 'card-plain',
    eyebrow: 'EXAMPLE 3',
    title: '본문 전용',
    summary: '헤더 없이 본문만 강조할 때 사용하는 간결한 정보 패널입니다.',
    example: plainExampleList[0],
  },
  {
    id: 'card-composed',
    eyebrow: 'EXAMPLE 4',
    title: '조합 예시',
    summary: 'Badge, Icon, footer를 조합해 실제 대시보드 카드에 가까운 구조를 보여줍니다.',
    example: composedExampleList[0],
  },
];

/**
 * @description Card 문서 섹션을 구성하고 예제 목록을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const CardDocs = () => {
  return <DocSection id="cards" title="25. 카드 (Card)" description={<div className="space-y-4 rounded-xl bg-slate-50/80 p-5 text-sm text-slate-700 ring-1 ring-slate-900/5">
          <p className="text-slate-700">헤더, 본문, 푸터를 한 번에 묶는 기본 surface 컴포넌트입니다. 대시보드 요약, 설정 패널, 액션 카드처럼 반복되는 정보 블록을 정돈된 흰색 카드로 표현합니다.</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {cardPropList.map((propItem) => (
              <div key={propItem.name} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
                <code className="text-xs font-semibold text-indigo-700">{propItem.name}</code>
                <p className="mt-1 text-xs text-slate-500">{propItem.description}</p>
              </div>
            ))}
          </div>
        </div>}>
      <div className="space-y-8">
        {cardExampleSectionList.map((exampleSection) => (
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

export default CardDocs;
