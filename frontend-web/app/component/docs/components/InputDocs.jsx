/**
 * 파일명: InputDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Input 컴포넌트 문서
 */
import { advancedExampleList, basicExampleList, filterExampleList, maskExampleList } from '../examples/InputExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const inputPropList = [
    { name: 'dataObj/dataKey?', description: 'EasyObj 상태와 필드 키를 연결하는 바운드 입력' },
    { name: 'value/defaultValue?', description: 'controlled 또는 초기값 기반 입력' },
    { name: 'type?', description: 'text, email, password, number 등 HTML input 타입' },
    { name: 'filter?', description: '허용 문자 범위를 정해 입력 전 단계에서 차단' },
    { name: 'mask?', description: '전화번호·사업자번호처럼 고정 포맷으로 변환' },
    { name: 'maxDigits/maxDecimals?', description: 'number 입력의 정수부·소수부 자릿수 제한' },
    { name: 'prefix/suffix?', description: '검색 아이콘, 단위, 통화 등 보조 표시' },
    { name: 'error?', description: '오류 상태와 에러 메시지 표시' },
];

const inputExampleSectionList = [
    {
        id: 'input-basic',
        eyebrow: 'EXAMPLE 1',
        title: '기본 입력',
        summary: '텍스트와 이메일처럼 가장 자주 쓰는 폼 입력을 업무 화면 밀도로 확인합니다.',
        exampleList: basicExampleList,
    },
    {
        id: 'input-mask',
        eyebrow: 'EXAMPLE 2',
        title: '마스크 입력',
        summary: '전화번호와 사업자번호처럼 형식이 정해진 값을 입력 중에 바로 정리합니다.',
        exampleList: maskExampleList,
    },
    {
        id: 'input-filter',
        eyebrow: 'EXAMPLE 3',
        title: '필터/숫자 입력',
        summary: '숫자 자릿수 제한과 문자셋 필터를 같은 카드 안에서 비교합니다.',
        exampleList: filterExampleList,
    },
    {
        id: 'input-advanced',
        eyebrow: 'EXAMPLE 4',
        title: '고급 기능',
        summary: 'prefix, suffix, error, password toggle처럼 실제 폼에서 자주 필요한 상태입니다.',
        exampleList: advancedExampleList,
    },
];

/**
 * @description Input 문서 섹션을 구성하고 예제 목록을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const InputDocs = () => {
    return (
        <DocSection
            id="inputs"
            title="4. 입력 (Input)" description={
                <div className="space-y-4 rounded-xl bg-slate-50/80 p-5 text-sm text-slate-700 ring-1 ring-slate-900/5">
                    <p>Input은 텍스트, 숫자, 검색, 비밀번호처럼 폼에서 가장 많이 반복되는 입력 표면입니다. EasyObj 바인딩과 controlled 모드를 모두 지원하고, 마스크·필터·에러 상태를 한 컴포넌트 안에서 처리합니다.</p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {inputPropList.map((propItem) => (
                            <div key={propItem.name} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
                                <code className="text-xs font-semibold text-indigo-700">{propItem.name}</code>
                                <p className="mt-1 text-xs text-slate-500">{propItem.description}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500">마스크 패턴: <code>#</code> 숫자, <code>A</code> 대문자, <code>a</code> 소문자, <code>?</code> 영문, <code>*</code> 모든 문자</p>
                </div>
            }
        >
            <div className="space-y-8">
                {inputExampleSectionList.map((exampleSection) => (
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

export default InputDocs;
