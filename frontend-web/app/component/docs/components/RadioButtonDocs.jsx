/**
 * 파일명: RadioButtonDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: RadioButton 컴포넌트 문서
 */
import { basicExampleList, variantExampleList } from '../examples/RadioButtonExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const radioButtonPropList = [
    { name: 'children', description: '버튼 안에 표시되는 선택지 라벨' },
    { name: 'name?', description: '동일 그룹을 묶는 이름. 없으면 dataKey 또는 문자열 children 사용' },
    { name: 'value', description: '선택 시 저장·전달되는 단일 값' },
    { name: 'dataObj/dataKey?', description: 'EasyObj 필드에 선택 value를 저장' },
    { name: 'checked/onValueChange?', description: '외부 상태로 선택 버튼을 제어' },
    { name: 'color?', description: 'primary, success, warning, danger, neutral 프리셋' },
    { name: 'disabled?', description: '선택 불가 버튼 상태' },
    { name: 'className?', description: '버튼 그룹 간격·정렬 보정' },
];

const radioButtonExampleSectionList = [
    {
        id: 'radiobutton-basic',
        eyebrow: 'EXAMPLE 1',
        title: '기본 사용법',
        summary: '세그먼트 버튼처럼 보이는 단일 선택 UI를 요금제·기간 선택으로 확인합니다.',
        exampleList: basicExampleList,
    },
    {
        id: 'radiobutton-variants',
        eyebrow: 'EXAMPLE 2',
        title: '상태와 업무 시나리오',
        summary: '보기 모드, 언어, 우선순위처럼 눌림 상태가 명확해야 하는 선택 패턴입니다.',
        exampleList: variantExampleList,
    },
];

/**
 * @description RadioButton 문서 섹션을 구성하고 예제 목록을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const RadioButtonDocs = () => {
    return (
        <DocSection
            id="radiobuttons"
            title="10. 라디오버튼 (RadioButton)" description={
                <div className="space-y-4 rounded-xl bg-slate-50/80 p-5 text-sm text-slate-700 ring-1 ring-slate-900/5">
                    <p>RadioButton은 Radiobox의 단일 선택 계약을 버튼형 UI로 보여줍니다. 세그먼트 컨트롤, 가격 주기, 보기 모드처럼 선택된 옵션을 버튼 표면에서 강하게 보여줘야 할 때 사용합니다.</p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {radioButtonPropList.map((propItem) => (
                            <div key={propItem.name} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
                                <code className="text-xs font-semibold text-indigo-700">{propItem.name}</code>
                                <p className="mt-1 text-xs text-slate-500">{propItem.description}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500">실제 <code>input[type=radio]</code>는 시각적으로 숨기고 버튼 표면으로 상태를 표현합니다.</p>
                </div>
            }
        >
            <div className="space-y-8">
                {radioButtonExampleSectionList.map((exampleSection) => (
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
                                        {example.component}
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
        </DocSection>
    );
};

export default RadioButtonDocs;
