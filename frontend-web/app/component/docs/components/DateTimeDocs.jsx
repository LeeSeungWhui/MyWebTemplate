/**
 * 파일명: DateTimeDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: DateTime 컴포넌트 문서
 */
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { dateExampleList } from '../examples/DateInputExamples';
import { timeExampleList } from '../examples/TimeInputExamples';

const dateTimePropList = [
    { name: 'dataObj/dataKey?', description: 'EasyObj의 날짜 또는 시간 문자열 필드와 연결' },
    { name: 'value/defaultValue?', description: '외부에서 제어하는 값 또는 초기 날짜·시간 값' },
    { name: 'min/max?', description: 'DateInput의 선택 가능 날짜 범위' },
    { name: 'step?', description: 'TimeInput 옵션 간격. 분 단위로 옵션 목록 생성' },
    { name: 'onChange/onValueChange?', description: '확정된 문자열 값과 연결 정보 전달' },
    { name: 'disabled/readOnly?', description: '직접 입력과 선택 버튼을 함께 잠금' },
    { name: 'placeholder/id?', description: '입력 안내와 라벨 연결 식별자' },
    { name: 'className?', description: '예약 폼, 필터 카드 등에서 폭을 보정' },
];

const dateTimeExampleSectionList = [
    {
        id: 'date-basic',
        eyebrow: 'EXAMPLE 1',
        title: '날짜 입력',
        summary: '일정 시작일, 계약 기간처럼 날짜 문자열을 입력하고 달력으로 선택합니다.',
        exampleList: dateExampleList,
    },
    {
        id: 'time-basic',
        eyebrow: 'EXAMPLE 2',
        title: '시간 입력',
        summary: '예약 시간, 발송 시간처럼 고정 간격 옵션과 직접 입력을 함께 지원합니다.',
        exampleList: timeExampleList,
    },
];

/**
 * @description DateInput/TimeInput 문서 섹션을 구성하고 예제 목록을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const DateTimeDocs = () => {
  return (
    <DocSection
      id="datetime-inputs"
      title="13. 날짜/시간 (Date/Time)" description={
        <div className="space-y-4 rounded-xl bg-slate-50/80 p-5 text-sm text-slate-700 ring-1 ring-slate-900/5">
          <p>DateInput과 TimeInput은 텍스트 입력과 선택 도구를 함께 제공해 날짜·시간 값을 폼 문자열로 확정합니다. EasyObj 데이터 연결, 외부 상태 제어, 직접 입력 후 <code>blur</code> 또는 <code>Enter</code>로 확정하는 흐름을 지원합니다.</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {dateTimePropList.map((propItem) => (
              <div key={propItem.name} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
                <code className="text-xs font-semibold text-indigo-700">{propItem.name}</code>
                <p className="mt-1 text-xs text-slate-500">{propItem.description}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">DateInput은 <code>YYYY-MM-DD</code>, TimeInput은 <code>HH:mm</code> 문자열을 확정 값으로 사용합니다.</p>
        </div>
      }
    >
      <div className="space-y-8">
        {dateTimeExampleSectionList.map((exampleSection) => (
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

export default DateTimeDocs;
