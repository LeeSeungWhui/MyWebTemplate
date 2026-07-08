/**
 * 파일명: DataClassDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: DataClass 컴포넌트 문서
 */
import { easyObjExampleList, easyListExampleList } from '../examples/DataClassExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const dataClassPropList = [
    { name: 'EasyObj', description: '객체 상태를 프록시로 래핑해 중첩 속성 변경을 추적' },
    { name: 'EasyList', description: '배열 상태에 push/pop/forAll 같은 조작 메서드 제공' },
    { name: 'forAll', description: '목록 전체를 순회하며 각 항목을 직접 수정' },
    { name: 'toJS', description: '프록시 상태를 순수 JavaScript 구조로 변환' },
];

const dataClassExampleSectionList = [
    {
        id: 'dataclass-easyobj',
        eyebrow: 'EXAMPLE 1',
        title: 'EasyObj',
        summary: '프로필처럼 중첩된 객체 상태를 setter 없이 직접 갱신합니다.',
        example: easyObjExampleList[0],
    },
    {
        id: 'dataclass-easylist',
        eyebrow: 'EXAMPLE 2',
        title: 'EasyList',
        summary: '업무 목록처럼 반복되는 배열 상태를 CRUD 메서드로 다룹니다.',
        example: easyListExampleList[0],
    },
];

/**
 * @description EasyObj/EasyList 문서 섹션을 구성하고 예제 목록을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const DataClassDocs = () => {
    return <DocSection id="dataclass" title="1. 데이터 클래스 (Data Class)" description={<div className="space-y-4 rounded-xl bg-slate-50/80 p-5 text-sm text-slate-700 ring-1 ring-slate-900/5">
                    <p>EasyObj와 EasyList는 템플릿 화면에서 반복되는 상태 조작을 단순화하는 데이터 헬퍼입니다. 객체/배열을 직접 다루는 문법을 유지하면서 React 렌더링과 상태 추적을 맞춥니다.</p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {dataClassPropList.map((propItem) => (
                            <div key={propItem.name} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
                                <code className="text-xs font-semibold text-indigo-700">{propItem.name}</code>
                                <p className="mt-1 text-xs text-slate-500">{propItem.description}</p>
                            </div>
                        ))}
                    </div>
                </div>}>
            <div className="space-y-8">
                {dataClassExampleSectionList.map((exampleSection) => (
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
        </DocSection>;
};

export default DataClassDocs;
