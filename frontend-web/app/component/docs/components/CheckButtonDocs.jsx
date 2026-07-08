/**
 * 파일명: CheckButtonDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: CheckButton 컴포넌트 문서
 */
import { basicExampleList, variantExampleList } from '../examples/CheckButtonExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const checkButtonPropList = [
    { name: 'children', description: '버튼 내부 라벨 또는 아이콘+텍스트 콘텐츠' },
    { name: 'name?', description: '폼 이름. 없으면 dataKey 또는 문자열 children 사용' },
    { name: 'dataObj/dataKey?', description: 'EasyObj boolean 필드와 토글 상태 바인딩' },
    { name: 'checked/onValueChange?', description: '외부 상태로 눌림 상태를 제어' },
    { name: 'color?', description: 'primary, success, warning, danger, neutral 프리셋' },
    { name: 'disabled?', description: '선택 불가 상태와 커서/투명도 처리' },
    { name: 'className?', description: '툴바·필터 영역에 맞춘 간격/폭 보정' },
];

const checkButtonExampleSectionList = [
    {
        id: 'checkbutton-basic',
        eyebrow: 'EXAMPLE 1',
        title: '기본 사용법',
        summary: '칩/토글 버튼처럼 클릭 면적이 필요한 체크 입력을 확인합니다.',
        exampleList: basicExampleList,
    },
    {
        id: 'checkbutton-variants',
        eyebrow: 'EXAMPLE 2',
        title: '상태와 필터 패턴',
        summary: '업무 필터, 보기 설정, 상태 프리셋을 버튼형 선택으로 구성합니다.',
        exampleList: variantExampleList,
    },
];

/**
 * @description CheckButton 문서 섹션을 구성하고 예제 목록을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const CheckButtonDocs = () => {
    return (
        <DocSection
            id="checkbuttons"
            title="8. 체크버튼 (CheckButton)" description={
                <div className="space-y-4 rounded-xl bg-slate-50/80 p-5 text-sm text-slate-700 ring-1 ring-slate-900/5">
                    <p>CheckButton은 Checkbox의 토글 동작을 버튼 UI로 보여주는 컴포넌트입니다. 일반 체크박스보다 클릭 면적이 넓어 필터 칩, 보기 설정, 작업 옵션처럼 빠르게 켜고 끄는 UI에 적합합니다.</p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {checkButtonPropList.map((propItem) => (
                            <div key={propItem.name} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
                                <code className="text-xs font-semibold text-indigo-700">{propItem.name}</code>
                                <p className="mt-1 text-xs text-slate-500">{propItem.description}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500"><code>aria-pressed</code>로 현재 눌림 상태를 전달하므로 버튼형 토글 의미가 보조기술에도 유지됩니다.</p>
                </div>
            }
        >
            <div className="space-y-8">
                {checkButtonExampleSectionList.map((exampleSection) => (
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

export default CheckButtonDocs;
