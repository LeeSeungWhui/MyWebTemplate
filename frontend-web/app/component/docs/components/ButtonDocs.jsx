/**
 * 파일명: ButtonDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Button 컴포넌트 문서
 */
import { variantExampleList, sizeExampleList } from '../examples/ButtonExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const buttonPropList = [
    { name: 'children', description: '버튼 내부 콘텐츠' },
    { name: 'variant?', description: 'primary, secondary, outline, danger 등 색상 스타일' },
    { name: 'size?', description: 'sm, md, lg 높이/패딩 밀도' },
    { name: 'icon?', description: 'Icon 컴포넌트에 전달할 아이콘 이름' },
    { name: 'iconPosition?', description: 'left 또는 right 아이콘 위치' },
    { name: 'loading?', description: '처리 중 상태와 스피너 표시' },
    { name: 'disabled?', description: '비활성 상태' },
    { name: 'type?', description: 'button, submit, reset' },
];

const buttonExampleSectionList = [
    {
        id: 'button-variants',
        eyebrow: 'EXAMPLE 1',
        title: '버튼 종류',
        summary: '업무 화면에서 쓰는 주요 CTA, 보조, 위험, 성공 액션을 한 줄로 비교합니다.',
        exampleList: variantExampleList,
    },
    {
        id: 'button-sizes',
        eyebrow: 'EXAMPLE 2',
        title: '크기와 상태',
        summary: 'sm/md/lg 크기와 icon/loading/disabled 상태를 한 화면에서 확인합니다.',
        exampleList: sizeExampleList,
    },
];

/**
 * @description Button 문서 섹션을 구성하고 예제 목록을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const ButtonDocs = () => {
    return <DocSection id="buttons" title="2. 버튼 (Button)" description={<div className="space-y-4 rounded-xl bg-slate-50/80 p-5 text-sm text-slate-700 ring-1 ring-slate-900/5">
                    <p>Button은 사용자가 실행하는 핵심 동작을 표현합니다. 기본 <code>variant</code>를 유지하면서 상태, 크기, 아이콘, 로딩·비활성 상태를 일관된 밀도로 제공합니다.</p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {buttonPropList.map((propItem) => (
                            <div key={propItem.name} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
                                <code className="text-xs font-semibold text-indigo-700">{propItem.name}</code>
                                <p className="mt-1 text-xs text-slate-500">{propItem.description}</p>
                            </div>
                        ))}
                    </div>
                </div>}>
            <div className="space-y-8">
                {buttonExampleSectionList.map((exampleSection) => (
                    <div key={exampleSection.id} id={exampleSection.id} className="scroll-mt-24 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
                        <div className="mb-4 flex flex-col gap-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{exampleSection.eyebrow}</span>
                            <h3 className="text-lg font-semibold tracking-tight text-slate-950">{exampleSection.title}</h3>
                            <p className="text-sm text-slate-500">{exampleSection.summary}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50/80 p-5 ring-1 ring-slate-200/80">
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {exampleSection.exampleList.map((example) => (
                                    <div key={example.exampleId} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
                                        <div className="flex min-h-12 items-center gap-2">
                                            {example.component}
                                        </div>
                                        <p className="mt-3 text-sm text-slate-600">{example.description}</p>
                                        <div className="mt-3">
                                            <CodeBlock code={example.code} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </DocSection>;
};

export default ButtonDocs;
