import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { DateInputExamples } from '../examples/DateInputExamples';
import { TimeInputExamples } from '../examples/TimeInputExamples';

const DateTimeDocs = () => {
  const dateEx = DateInputExamples();
  const timeEx = TimeInputExamples();
  return (
    <DocSection
      id="datetime-inputs"
      title="21. 날짜/시간 (Date/Time)"
      description={<p>브라우저 기본 Date/Time 입력을 래핑. EasyObj 바운드/컨트롤드 지원.</p>}
    >
      <div id="date-basic" className="mb-8">
        <h3 className="text-lg font-medium mb-4">날짜</h3>
        <div>
          {dateEx[0]?.component}
          <div className="mt-2 text-sm text-gray-600">{dateEx[0]?.description}</div>
          <CodeBlock code={dateEx[0]?.code || ''} />
        </div>
        <div className="mt-6">
          {dateEx[1]?.component}
          <div className="mt-2 text-sm text-gray-600">{dateEx[1]?.description}</div>
          <CodeBlock code={dateEx[1]?.code || ''} />
        </div>
      </div>

      <div id="time-basic" className="mb-8">
        <h3 className="text-lg font-medium mb-4">시간</h3>
        <div>
          {timeEx[0]?.component}
          <div className="mt-2 text-sm text-gray-600">{timeEx[0]?.description}</div>
          <CodeBlock code={timeEx[0]?.code || ''} />
        </div>
        <div className="mt-6">
          {timeEx[1]?.component}
          <div className="mt-2 text-sm text-gray-600">{timeEx[1]?.description}</div>
          <CodeBlock code={timeEx[1]?.code || ''} />
        </div>
      </div>
    </DocSection>
  );
};

export default DateTimeDocs;

