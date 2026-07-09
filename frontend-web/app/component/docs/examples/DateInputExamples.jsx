/**
 * 파일명: DateInputExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: DateInput 컴포넌트 예제
 */
import * as Lib from '@/app/lib';

/**
 * @description BoundDateDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const BoundDateDemo = () => {
  const dateDataObj = Lib.EasyObj({
    startDate: '2026-07-15'
  });

  return <div className="space-y-2">
      <label htmlFor="date-start" className="block text-sm font-semibold text-slate-900">프로젝트 시작일</label>
      <Lib.DateInput id="date-start" dataObj={dateDataObj} dataKey="startDate" className="max-w-xs" />
      <div className="text-xs text-slate-500">schedule.startDate = {String(dateDataObj.startDate)}</div>
    </div>;
};

/**
 * @description RangeDateDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const RangeDateDemo = () => {
  return <div className="space-y-2">
      <label htmlFor="date-contract-end" className="block text-sm font-semibold text-slate-900">계약 종료일</label>
      <Lib.DateInput id="date-contract-end" defaultValue="2026-12-31" min="2026-01-01" max="2026-12-31" className="max-w-xs" />
      <p className="text-xs text-slate-500">2026년 계약 기간 안에서만 선택하도록 제한합니다.</p>
    </div>;
};

/**
 * @description DateInput 예제 계약을 정의. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 상태가 필요한 예제는 demo 컴포넌트 안으로 가두고 계약은 직접 export한다.
 */
export const dateExampleList = [{
  exampleId: 'bound',
  component: <BoundDateDemo />,
  description: '프로젝트 시작일을 EasyObj 필드에 바인딩',
  code: `const dateDataObj = Lib.EasyObj({ startDate: '2026-07-15' });

<Lib.DateInput
  id="date-start"
  dataObj={dateDataObj}
  dataKey="startDate"
/>`
}, {
  exampleId: 'range',
  component: <RangeDateDemo />,
  description: 'min/max와 defaultValue로 선택 가능 기간 제한',
  code: `<Lib.DateInput
  id="date-contract-end"
  defaultValue="2026-12-31"
  min="2026-01-01"
  max="2026-12-31"
/>`
}];
