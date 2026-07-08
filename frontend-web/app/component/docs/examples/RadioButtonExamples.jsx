/**
 * 파일명: RadioButtonExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: RadioButton 컴포넌트 예제
 */
import * as Lib from '@/app/lib';
import { useState } from 'react';

/**
 * @description BoundBillingRadioButtonDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const BoundBillingRadioButtonDemo = () => {
  const billingDataObj = Lib.EasyObj({
    billingCycle: 'annual'
  });

  return <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-slate-900">결제 주기</h4>
        <p className="mt-1 text-xs text-slate-500">버튼형 단일 선택으로 현재 선택을 강하게 표시</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Lib.RadioButton name="billingCycle" value="monthly" dataObj={billingDataObj} dataKey="billingCycle">
          월간
        </Lib.RadioButton>
        <Lib.RadioButton name="billingCycle" value="annual" dataObj={billingDataObj} dataKey="billingCycle" color="success">
          연간 20% 할인
        </Lib.RadioButton>
      </div>
    </div>;
};

/**
 * @description ControlledLanguageRadioButtonDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const ControlledLanguageRadioButtonDemo = () => {
  const [languageValue, setLanguageValue] = useState('ko');

  return <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Lib.RadioButton name="language" value="ko" checked={languageValue === 'ko'} onValueChange={setLanguageValue}>
          한국어
        </Lib.RadioButton>
        <Lib.RadioButton name="language" value="en" checked={languageValue === 'en'} onValueChange={setLanguageValue}>
          English
        </Lib.RadioButton>
      </div>
      <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200/80">
        language = {languageValue}
      </p>
    </div>;
};

/**
 * @description ViewModeRadioButtonDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const ViewModeRadioButtonDemo = () => {
  const viewModeDataObj = Lib.EasyObj({
    mode: 'kanban'
  });

  return <div className="flex flex-wrap gap-2">
      <Lib.RadioButton name="viewMode" value="table" dataObj={viewModeDataObj} dataKey="mode" color="neutral">테이블</Lib.RadioButton>
      <Lib.RadioButton name="viewMode" value="kanban" dataObj={viewModeDataObj} dataKey="mode">칸반</Lib.RadioButton>
      <Lib.RadioButton name="viewMode" value="calendar" dataObj={viewModeDataObj} dataKey="mode" color="warning">캘린더</Lib.RadioButton>
    </div>;
};

/**
 * @description DisabledRadioButtonDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const DisabledRadioButtonDemo = () => {
  return <div className="flex flex-wrap gap-2">
      <Lib.RadioButton name="releaseChannel" value="stable" disabled>Stable</Lib.RadioButton>
      <Lib.RadioButton name="releaseChannel" value="preview" disabled color="danger">Preview 잠김</Lib.RadioButton>
    </div>;
};

/**
 * @description RadioButton 예제 계약을 정의. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 상태가 필요한 예제는 demo 컴포넌트 안으로 가두고 계약은 직접 export한다.
 */
export const basicExampleList = [{
  exampleId: 'binding',
  component: <BoundBillingRadioButtonDemo />,
  description: 'EasyObj 바인딩 — 결제 주기처럼 선택된 value를 단일 필드에 저장',
  code: `const billingDataObj = Lib.EasyObj({
  billingCycle: 'annual',
});

<Lib.RadioButton
  name="billingCycle"
  value="annual"
  dataObj={billingDataObj}
  dataKey="billingCycle"
  color="success"
>
  연간 20% 할인
</Lib.RadioButton>`
}, {
  exampleId: 'controlled',
  component: <ControlledLanguageRadioButtonDemo />,
  description: '컨트롤드 모드 — checked/onValueChange로 외부 선택 상태와 동기화',
  code: `const [languageValue, setLanguageValue] = useState('ko');

<Lib.RadioButton
  name="language"
  value="ko"
  checked={languageValue === 'ko'}
  onValueChange={setLanguageValue}
>
  한국어
</Lib.RadioButton>`
}, {
  exampleId: 'disabled',
  component: <DisabledRadioButtonDemo />,
  description: '비활성화 상태 — 사용자가 선택할 수 없는 채널을 버튼으로 표시',
  code: `<Lib.RadioButton
  name="releaseChannel"
  value="stable"
  disabled
>
  Stable
</Lib.RadioButton>`
}];

export const variantExampleList = [{
  exampleId: 'viewMode',
  component: <ViewModeRadioButtonDemo />,
  description: '보기 모드 — neutral/default/warning 프리셋으로 단일 버튼 그룹 구성',
  code: `<Lib.RadioButton
  name="viewMode"
  value="kanban"
  dataObj={viewModeDataObj}
  dataKey="mode"
>
  칸반
</Lib.RadioButton>`
}];
