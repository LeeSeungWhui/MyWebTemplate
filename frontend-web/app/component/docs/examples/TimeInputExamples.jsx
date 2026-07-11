/**
 * 파일명: TimeInputExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: TimeInput 컴포넌트 예제
 */
import * as Lib from '@/app/lib';

/**
 * @description BoundTimeDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const BoundTimeDemo = () => {
  const timeDataObj = Lib.EasyObj({
    sendTime: '09:30'
  });

  return <div className="space-y-2">
      <label htmlFor="time-send" className="block text-sm font-semibold text-slate-900">알림 발송 시간</label>
      <Lib.TimeInput id="time-send" dataObj={timeDataObj} dataKey="sendTime" step={30} className="max-w-xs" />
      <div className="text-xs text-slate-500">notification.sendTime = {String(timeDataObj.sendTime)}</div>
    </div>;
};

/**
 * @description StepTimeDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const StepTimeDemo = () => {
  return <div className="space-y-2">
      <label htmlFor="time-meeting" className="block text-sm font-semibold text-slate-900">미팅 시작 시간</label>
      <Lib.TimeInput id="time-meeting" defaultValue="14:00" step={15} className="max-w-xs" />
      <p className="text-xs text-slate-500">15분 단위 옵션으로 예약 시간을 선택합니다.</p>
    </div>;
};

/**
 * @description TimeInput 예제 계약을 정의. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 상태가 필요한 예제는 demo 컴포넌트 안으로 가두고 계약은 직접 export한다.
 */
export const timeExampleList = [{
  exampleId: 'bound',
  component: <BoundTimeDemo />,
  description: '알림 발송 시간을 EasyObj 필드와 연결',
  code: `const timeDataObj = Lib.EasyObj({ sendTime: '09:30' });

<Lib.TimeInput
  id="time-send"
  dataObj={timeDataObj}
  dataKey="sendTime"
  step={30}
/>`
}, {
  exampleId: 'step',
  component: <StepTimeDemo />,
  description: 'defaultValue와 15분 단위 옵션 목록',
  code: '<Lib.TimeInput id="time-meeting" defaultValue="14:00" step={15} />'
}];
