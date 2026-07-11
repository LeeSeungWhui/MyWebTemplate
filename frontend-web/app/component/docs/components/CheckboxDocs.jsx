/**
 * 파일명: CheckboxDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Checkbox 컴포넌트 문서
 */
import { basicExampleList, variantExampleList } from '../examples/CheckboxExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const checkboxPropList = [
    { name: 'label?', description: '입력 옆에 노출되는 라벨 텍스트' },
    { name: 'name?', description: '폼 제출·그룹 식별용 이름. 없으면 dataKey 또는 label 사용' },
    { name: 'dataObj/dataKey?', description: 'EasyObj 필드와 체크 상태를 양방향으로 연결' },
    { name: 'checked/onValueChange?', description: '외부 상태로 체크 여부를 제어' },
    { name: 'color?', description: 'primary, success, warning, danger, neutral 프리셋' },
    { name: 'disabled?', description: '읽기 전용·권한 부족 상태의 비활성화 표시' },
    { name: 'className?', description: '문서/폼 레이아웃에 맞춘 추가 클래스' },
];

const checkboxExampleSectionList = [
    {
        id: 'checkbox-basic',
        eyebrow: 'EXAMPLE 1',
        title: '기본 사용법',
        summary: '단일 체크와 EasyObj 데이터 연결을 설정·권한 화면에 가까운 밀도로 확인합니다.',
        exampleList: basicExampleList,
    },
    {
        id: 'checkbox-variants',
        eyebrow: 'EXAMPLE 2',
        title: '상태와 업무 시나리오',
        summary: '필수 약관, 알림 옵션, 상태 색상처럼 실제 폼에서 반복되는 선택 패턴입니다.',
        exampleList: variantExampleList,
    },
];

/**
 * @description Checkbox 문서 섹션을 구성하고 예제 목록을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const CheckboxDocs = () => {
    return (
        <DocSection
            id="checkboxes"
            title="7. 체크박스 (Checkbox)" description={
                <div className="space-y-4 rounded-xl bg-slate-50/80 p-5 text-sm text-slate-700 ring-1 ring-slate-900/5">
                    <p>Checkbox는 약관 동의, 알림 수신, 체크리스트처럼 여러 항목을 독립적으로 켜고 끄는 입력입니다. EasyObj 데이터 연결과 외부 상태 제어를 모두 지원하며, 색상 프리셋으로 상태 의미를 함께 전달할 수 있습니다.</p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {checkboxPropList.map((propItem) => (
                            <div key={propItem.name} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
                                <code className="text-xs font-semibold text-indigo-700">{propItem.name}</code>
                                <p className="mt-1 text-xs text-slate-500">{propItem.description}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500">연결된 값은 boolean, <code>Y</code>, <code>1</code> 계열을 체크 상태로 해석합니다.</p>
                </div>
            }
        >
            <div className="space-y-8">
                {checkboxExampleSectionList.map((exampleSection) => (
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

export default CheckboxDocs;
