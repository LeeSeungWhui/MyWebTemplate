/**
 * 파일명: TabDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-07-07
 * 설명: Tab 컴포넌트 문서
 */
import { basicExampleObj, controlExampleObj, iconExampleObj, styleExampleObj, underlineExampleObj } from '../examples/TabExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const tabPropList = [
    { name: 'dataObj?/dataKey?', description: '현재 탭 인덱스와 데이터 필드를 연결' },
    { name: 'tabIndex?', description: '초기 또는 제어 탭 인덱스' },
    { name: 'onChange?', description: '탭 변경 시 호출' },
    { name: 'variant?', description: 'segmented 또는 underline' },
    { name: 'className?', description: '래퍼 추가 클래스' },
    { name: 'children', description: 'Tab.Item 목록' },
];

const tabExampleSectionList = [
    {
        id: 'tab-basic',
        eyebrow: 'EXAMPLE 1',
        title: '기본 사용법',
        summary: 'EasyObj 데이터 연결로 현재 탭을 관리하는 기본 분할형 탭입니다.',
        example: basicExampleObj,
    },
    {
        id: 'tab-controlled',
        eyebrow: 'EXAMPLE 2',
        title: '제어 컴포넌트',
        summary: 'tabIndex/onChange를 외부 상태에 연결해 화면 상태를 직접 제어합니다.',
        example: controlExampleObj,
    },
    {
        id: 'tab-styled',
        eyebrow: 'EXAMPLE 3',
        title: '스타일링',
        summary: 'className으로 주변 배경과 밀도를 조정한 관리 화면형 탭입니다.',
        example: styleExampleObj,
    },
    {
        id: 'tab-underline',
        eyebrow: 'EXAMPLE 4',
        title: '밑줄 스타일',
        summary: 'variant="underline"을 prop으로 유지해 밀도 높은 화면의 상단 탭에 사용합니다.',
        example: underlineExampleObj,
    },
    {
        id: 'tab-icons',
        eyebrow: 'EXAMPLE 5',
        title: '아이콘 탭',
        summary: 'Tab.Item title에 JSX를 전달해 아이콘과 텍스트를 함께 표시합니다.',
        example: iconExampleObj,
    },
];

/**
 * @description Tab 문서 섹션을 구성하고 예제 목록을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const TabDocs = () => {
    return (
        <DocSection
            id="tabs"
            title="28. 탭 (Tab)" description={
                <div className="space-y-4 rounded-xl bg-slate-50/80 p-5 text-sm text-slate-700 ring-1 ring-slate-900/5">
                    <p>Tab 컴포넌트는 <code>Tab.Item</code>을 사용해 관련 콘텐츠 패널을 묶습니다. 기본은 분할 버튼 형태이며, 밀도 높은 화면에서는 <code>variant="underline"</code>으로 전환해 같은 사용 방식 안에서 두 가지 탭 스타일을 유지합니다.</p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {tabPropList.map((propItem) => (
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
                {tabExampleSectionList.map((exampleSection) => (
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
        </DocSection>
    );
};

export default TabDocs;
