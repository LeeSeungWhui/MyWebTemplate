/**
 * 파일명: RadioboxDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Radiobox 컴포넌트 문서
 */
import { basicExampleList, variantExampleList } from '../examples/RadioboxExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const radioboxPropList = [
    { name: 'label?', description: '라디오 입력 옆에 표시되는 선택지 텍스트' },
    { name: 'name?', description: '동일 그룹을 묶는 이름. 같은 name 안에서 하나만 선택' },
    { name: 'value', description: '선택 시 dataObj 또는 onValueChange로 전달할 값' },
    { name: 'dataObj/dataKey?', description: 'EasyObj 단일 필드에 선택 value 저장' },
    { name: 'checked/defaultChecked?', description: '외부에서 제어하는 상태 또는 초기 선택값' },
    { name: 'onValueChange?', description: '선택된 value를 직접 받는 변경 핸들러' },
    { name: 'color?', description: 'primary, success, warning, danger, neutral 프리셋' },
    { name: 'disabled?', description: '선택 불가 상태의 입력과 라벨 비활성화' },
];

const radioboxExampleSectionList = [
    {
        id: 'radiobox-basic',
        eyebrow: 'EXAMPLE 1',
        title: '기본 사용법',
        summary: '라벨형 단일 선택을 역할·요금제 같은 실제 폼 패턴으로 확인합니다.',
        exampleList: basicExampleList,
    },
    {
        id: 'radiobox-variants',
        eyebrow: 'EXAMPLE 2',
        title: '상태와 업무 시나리오',
        summary: '외부 상태 제어, 비활성화, 상태 색상까지 라디오 그룹 동작을 비교합니다.',
        exampleList: variantExampleList,
    },
];

/**
 * @description Radiobox 문서 섹션을 구성하고 예제 목록을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const RadioboxDocs = () => {
    return (
        <DocSection
            id="radioboxes"
            title="9. 라디오박스 (Radiobox)" description={
                <div className="space-y-4 rounded-xl bg-slate-50/80 p-5 text-sm text-slate-700 ring-1 ring-slate-900/5">
                    <p>Radiobox는 여러 선택지 중 하나만 고르는 기본 라디오 입력입니다. 같은 <code>name</code>을 공유하는 선택지는 하나의 그룹으로 동작하고, 선택된 <code>value</code>가 EasyObj 필드 또는 변경 콜백으로 전달됩니다.</p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {radioboxPropList.map((propItem) => (
                            <div key={propItem.name} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
                                <code className="text-xs font-semibold text-indigo-700">{propItem.name}</code>
                                <p className="mt-1 text-xs text-slate-500">{propItem.description}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500">버튼형 선택이 필요하면 같은 계약의 <code>RadioButton</code>을 사용합니다.</p>
                </div>
            }
        >
            <div className="space-y-8">
                {radioboxExampleSectionList.map((exampleSection) => (
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

export default RadioboxDocs;
