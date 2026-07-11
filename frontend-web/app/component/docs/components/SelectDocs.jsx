/**
 * 파일명: SelectDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Select 컴포넌트 문서
 */
import { basicExampleList, stateExampleList } from '../examples/SelectExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const selectPropList = [
    { name: 'dataList', description: '옵션 배열 또는 EasyList. selected 플래그 동기화' },
    { name: 'valueKey/textKey?', description: '옵션 값과 라벨로 사용할 키' },
    { name: 'dataObj/dataKey?', description: 'EasyObj 선택 값과 연결' },
    { name: 'value/onValueChange?', description: '외부 상태의 선택 값과 동기화' },
    { name: 'status?', description: 'default, success, info, warning, error, loading, empty' },
    { name: 'statusMessage?', description: '상태별 가시 안내 문구' },
    { name: 'assistiveText?', description: '스크린리더용 보조 안내' },
    { name: 'disabled?', description: '선택 불가 상태' },
];

const selectExampleSectionList = [
    {
        id: 'select-basic',
        eyebrow: 'EXAMPLE 1',
        title: '기본 사용법',
        summary: 'EasyList selected 플래그와 외부 상태 값을 실제 직무 선택 흐름으로 비교합니다.',
        exampleList: basicExampleList,
    },
    {
        id: 'select-states',
        eyebrow: 'EXAMPLE 2',
        title: '상태',
        summary: 'loading, error, empty처럼 사용자가 판단해야 하는 상태를 한 표면에서 확인합니다.',
        exampleList: stateExampleList,
    },
];

/**
 * @description Select 문서 섹션을 구성하고 예제 목록을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const SelectDocs = () => {
    return (
        <DocSection
            id="selects"
            title="6. 선택 (Select)" description={
                <div className="space-y-4 rounded-xl bg-slate-50/80 p-5 text-sm text-slate-700 ring-1 ring-slate-900/5">
                    <p>Select는 짧은 옵션 목록에서 하나의 값을 고르는 입력 요소입니다. EasyList의 <code>selected</code> 플래그, EasyObj 데이터 연결, 외부 상태 제어를 모두 지원하고 상태 메시지와 <code>aria-live</code> 안내를 함께 제공합니다.</p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {selectPropList.map((propItem) => (
                            <div key={propItem.name} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
                                <code className="text-xs font-semibold text-indigo-700">{propItem.name}</code>
                                <p className="mt-1 text-xs text-slate-500">{propItem.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            }
        >
            <div className="space-y-8">
                {selectExampleSectionList.map((exampleSection) => (
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

export default SelectDocs;
