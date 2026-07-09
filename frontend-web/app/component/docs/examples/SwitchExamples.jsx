"use client";

/**
 * 파일명: SwitchExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Switch 컴포넌트 예제
 */
import * as Lib from '@/app/lib';
import { useState } from 'react';

/**
 * @description BoundSwitchDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const BoundSwitchDemo = () => {
  const switchDataObj = Lib.EasyObj({
    weeklyDigest: true
  });

  return <div className="space-y-3">
      <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">주간 리포트 이메일</div>
          <p className="mt-1 text-xs text-slate-500">월요일 오전 9시에 팀 요약을 발송합니다.</p>
        </div>
        <Lib.Switch dataObj={switchDataObj} dataKey="weeklyDigest" label={switchDataObj.weeklyDigest ? 'ON' : 'OFF'} />
      </div>
      <div className="text-xs text-slate-500">settings.weeklyDigest = {String(switchDataObj.weeklyDigest)}</div>
    </div>;
};

/**
 * @description CtrlSwitchDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const CtrlSwitchDemo = () => {
  const [isAutoSaveOn, setIsAutoSaveOn] = useState(false);

  return <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 p-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">임시저장 자동화</div>
            <p className="mt-1 text-xs text-slate-500">입력 중인 초안을 30초마다 저장합니다.</p>
          </div>
          <Lib.Switch checked={isAutoSaveOn} onValueChange={nextValue => setIsAutoSaveOn(nextValue)} label={isAutoSaveOn ? '사용' : '중지'} />
        </div>
      </div>
      <div className="text-xs text-slate-500">isAutoSaveOn = {String(isAutoSaveOn)}</div>
    </div>;
};

/**
 * @description DisabledSwitchDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const DisabledSwitchDemo = () => {
  return <div className="space-y-3">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
        <span className="text-sm font-semibold text-slate-900">보안 점검 모드</span>
        <Lib.Switch disabled defaultChecked label="잠김" />
      </div>
      <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-3">
        <span className="text-sm font-semibold text-slate-900">외부 공유 허용</span>
        <Lib.Switch disabled label="권한 없음" />
      </div>
    </div>;
};

/**
 * @description A11ySwitchDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const A11ySwitchDemo = () => {
  const switchDataObj = Lib.EasyObj({
    notifications: true
  });

  return <div className="space-y-2">
      <label htmlFor="notify-switch" className="block text-sm font-semibold text-slate-900">알림 수신 설정</label>
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
        <Lib.Switch dataObj={switchDataObj} dataKey="notifications" id="notify-switch" label="푸시 알림" />
      </div>
      <p className="text-xs text-slate-500">명시적인 id로 외부 라벨과 스위치를 연결합니다.</p>
    </div>;
};

/**
 * @description Switch 예제 계약을 정의. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 단건 섹션은 ExampleObj로 노출하고 상태는 demo 컴포넌트 안에만 둔다.
 */
export const basicExampleList = [{
  exampleId: 'settings',
  component: <BoundSwitchDemo />,
  description: '설정 객체와 dataKey를 직접 연결한 바운드 스위치',
  code: `const switchDataObj = Lib.EasyObj({ weeklyDigest: true });

<Lib.Switch
  dataObj={switchDataObj}
  dataKey="weeklyDigest"
  label={switchDataObj.weeklyDigest ? 'ON' : 'OFF'}
/>`
}, {
  exampleId: 'controlled',
  component: <CtrlSwitchDemo />,
  description: '외부 React state로 상태를 제어하는 controlled 스위치',
  code: `const [isAutoSaveOn, setIsAutoSaveOn] = useState(false);

<Lib.Switch
  checked={isAutoSaveOn}
  onValueChange={(nextValue) => setIsAutoSaveOn(nextValue)}
  label={isAutoSaveOn ? '사용' : '중지'}
/>`
}];

export const stateExampleList = [{
  exampleId: 'disabled',
  component: <DisabledSwitchDemo />,
  description: 'disabled와 defaultChecked를 함께 사용한 잠긴 설정 상태',
  code: `<Lib.Switch disabled defaultChecked label="비활성화" />
<Lib.Switch disabled label="비활성화 (OFF)" />`
}, {
  exampleId: 'access',
  component: <A11ySwitchDemo />,
  description: 'id를 지정해 외부 label과 스위치 입력을 명확하게 연결',
  code: `<Lib.Switch
  dataObj={switchDataObj}
  dataKey="notifications"
  id="notify-switch"
  label="푸시 알림"
/>`
}];
