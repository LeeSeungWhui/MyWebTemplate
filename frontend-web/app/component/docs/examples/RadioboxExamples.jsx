/**
 * 파일명: RadioboxExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Radiobox 컴포넌트 예제
 */
import * as Lib from '@/app/lib';
import { useState } from 'react';

/**
 * @description BoundPlanRadioboxDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const BoundPlanRadioboxDemo = () => {
  const planDataObj = Lib.EasyObj({
    selectedPlan: 'growth'
  });

  return <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-slate-900">요금제 선택</h4>
        <p className="mt-1 text-xs text-slate-500">선택된 value가 selectedPlan 필드에 저장됩니다.</p>
      </div>
      <div className="space-y-2 rounded-lg bg-slate-50 px-3 py-3 ring-1 ring-slate-200/80">
        <Lib.Radiobox name="plan" label="Starter" value="starter" dataObj={planDataObj} dataKey="selectedPlan" color="neutral" />
        <Lib.Radiobox name="plan" label="Growth" value="growth" dataObj={planDataObj} dataKey="selectedPlan" color="primary" />
        <Lib.Radiobox name="plan" label="Enterprise" value="enterprise" dataObj={planDataObj} dataKey="selectedPlan" color="success" />
      </div>
    </div>;
};

/**
 * @description ControlledPriorityRadioboxDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const ControlledPriorityRadioboxDemo = () => {
  const [priorityValue, setPriorityValue] = useState('normal');

  return <div className="space-y-3">
      <div className="space-y-2">
        <Lib.Radiobox name="priority" label="보통" value="normal" checked={priorityValue === 'normal'} onValueChange={setPriorityValue} color="neutral" />
        <Lib.Radiobox name="priority" label="긴급" value="urgent" checked={priorityValue === 'urgent'} onValueChange={setPriorityValue} color="danger" />
      </div>
      <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200/80">
        priority = {priorityValue}
      </p>
    </div>;
};

/**
 * @description DisabledRadioboxDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const DisabledRadioboxDemo = () => {
  return <div className="space-y-2">
      <Lib.Radiobox name="lockedRegion" label="국내 리전" value="kr" disabled defaultChecked />
      <Lib.Radiobox name="lockedRegion" label="해외 리전" value="global" disabled />
      <p className="text-xs text-slate-500">정책상 바꿀 수 없는 설정은 disabled로 잠급니다.</p>
    </div>;
};

/**
 * @description StatusRadioboxDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const StatusRadioboxDemo = () => {
  const statusDataObj = Lib.EasyObj({
    publishStatus: 'draft'
  });

  return <div className="space-y-2">
      <Lib.Radiobox name="publishStatus" label="임시저장" value="draft" dataObj={statusDataObj} dataKey="publishStatus" color="neutral" />
      <Lib.Radiobox name="publishStatus" label="검토 요청" value="review" dataObj={statusDataObj} dataKey="publishStatus" color="warning" />
      <Lib.Radiobox name="publishStatus" label="즉시 게시" value="publish" dataObj={statusDataObj} dataKey="publishStatus" color="success" />
    </div>;
};

/**
 * @description Radiobox 예제 계약을 정의. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 상태가 필요한 예제는 demo 컴포넌트 안으로 가두고 계약은 직접 export한다.
 */
export const basicExampleList = [{
  exampleId: 'binding',
  component: <BoundPlanRadioboxDemo />,
  description: 'EasyObj 바인딩 — 같은 name 그룹의 선택 value를 단일 필드에 저장',
  code: `const planDataObj = Lib.EasyObj({
  selectedPlan: 'growth',
});

<Lib.Radiobox
  name="plan"
  label="Growth"
  value="growth"
  dataObj={planDataObj}
  dataKey="selectedPlan"
  color="primary"
/>`
}, {
  exampleId: 'controlled',
  component: <ControlledPriorityRadioboxDemo />,
  description: '컨트롤드 모드 — checked/onValueChange로 외부 단일 선택 상태와 동기화',
  code: `const [priorityValue, setPriorityValue] = useState('normal');

<Lib.Radiobox
  name="priority"
  label="긴급"
  value="urgent"
  checked={priorityValue === 'urgent'}
  onValueChange={setPriorityValue}
  color="danger"
/>`
}, {
  exampleId: 'disabled',
  component: <DisabledRadioboxDemo />,
  description: '비활성화 상태 — 정책상 바꿀 수 없는 단일 선택 항목 표시',
  code: `<Lib.Radiobox
  name="lockedRegion"
  label="국내 리전"
  value="kr"
  disabled
  defaultChecked
/>`
}];

export const variantExampleList = [{
  exampleId: 'status',
  component: <StatusRadioboxDemo />,
  description: '상태 색상 — neutral/warning/success 프리셋으로 선택 의미 구분',
  code: `<Lib.Radiobox
  name="publishStatus"
  label="검토 요청"
  value="review"
  dataObj={statusDataObj}
  dataKey="publishStatus"
  color="warning"
/>`
}];
