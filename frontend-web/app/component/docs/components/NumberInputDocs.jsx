/**
 * 파일명: NumberInputDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: NumberInput 컴포넌트 문서
 */
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { basicExampleObj, rangeExampleObj, unboundExampleObj } from '../examples/NumberInputExamples';

const numberInputPropList = [
    { name: 'dataObj/dataKey?', description: 'EasyObj 숫자 필드와 입력 값을 양방향으로 연결' },
    { name: 'value/defaultValue?', description: '외부에서 제어하는 값 또는 독립형 초기 숫자' },
    { name: 'min/max?', description: '입력·증감 버튼으로 확정되는 허용 범위' },
    { name: 'step?', description: '버튼·키보드 증감 단위. 기본값은 1' },
    { name: 'onChange/onValueChange?', description: '확정된 숫자 또는 빈 값과 연결 정보 전달' },
    { name: 'disabled/readOnly?', description: '입력 및 증감 버튼을 잠그는 상태' },
    { name: 'placeholder/id?', description: '빈 값 안내 문구와 접근성 식별자' },
    { name: 'className?', description: '카드/폼 행 안에서 폭과 간격을 보정' },
];

const numberInputExampleSectionList = [
    {
        id: 'number-basic',
        eyebrow: 'EXAMPLE 1',
        title: '기본',
        summary: '수량처럼 최소값과 step 1이 필요한 가장 기본적인 숫자 입력입니다.',
        exampleList: [basicExampleObj],
    },
    {
        id: 'number-range',
        eyebrow: 'EXAMPLE 2',
        title: '범위와 스텝',
        summary: '예산·비율처럼 min/max와 소수 step을 함께 쓰는 케이스입니다.',
        exampleList: [rangeExampleObj],
    },
    {
        id: 'number-unbound',
        eyebrow: 'EXAMPLE 3',
        title: '독립형',
        summary: '간단한 초기값 입력이나 독립 위젯으로 사용할 때의 형태입니다.',
        exampleList: [unboundExampleObj],
    },
];

/**
 * @description NumberInput 문서 섹션을 구성하고 예제 목록을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const NumberInputDocs = () => {
  return (
    <DocSection
      id="number-inputs"
      title="12. 숫자 입력 (NumberInput)" description={
        <div className="space-y-4 rounded-xl bg-slate-50/80 p-5 text-sm text-slate-700 ring-1 ring-slate-900/5">
          <p>NumberInput은 직접 입력과 증감 버튼을 함께 제공하는 숫자 입력입니다. 입력을 벗어나는 시점에 값을 정규화하고, <code>min/max</code> 범위를 벗어나면 허용 범위로 보정합니다.</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {numberInputPropList.map((propItem) => (
              <div key={propItem.name} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
                <code className="text-xs font-semibold text-indigo-700">{propItem.name}</code>
                <p className="mt-1 text-xs text-slate-500">{propItem.description}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">키보드 <code>ArrowUp/ArrowDown</code>과 <code>PageUp/PageDown</code>도 step 단위로 동작해 데이터 입력 화면에서 빠르게 값을 조정할 수 있습니다.</p>
        </div>
      }
    >
      <div className="space-y-8">
        {numberInputExampleSectionList.map((exampleSection) => (
          <div key={exampleSection.id} id={exampleSection.id} className="scroll-mt-24 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
            <div className="mb-4 flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{exampleSection.eyebrow}</span>
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">{exampleSection.title}</h3>
              <p className="text-sm text-slate-500">{exampleSection.summary}</p>
            </div>
            <div className="rounded-xl bg-slate-50/80 p-5 ring-1 ring-slate-200/80">
              <div className="max-w-2xl">
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

export default NumberInputDocs;
