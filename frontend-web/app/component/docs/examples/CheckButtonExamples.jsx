/**
 * 파일명: CheckButtonExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: CheckButton 컴포넌트 예제
 */
import * as Lib from '@/app/lib';
import { useState } from 'react';

/**
 * @description BoundFilterCheckButtonDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const BoundFilterCheckButtonDemo = () => {
  const filterDataObj = Lib.EasyObj({
    unreadOnly: true,
    assignedToMe: false,
    highPriority: false
  });

  return <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-slate-900">업무 목록 필터</h4>
        <p className="mt-1 text-xs text-slate-500">여러 필터를 동시에 토글하는 칩 UI</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Lib.CheckButton dataObj={filterDataObj} dataKey="unreadOnly">읽지 않음</Lib.CheckButton>
        <Lib.CheckButton dataObj={filterDataObj} dataKey="assignedToMe" color="success">내 담당</Lib.CheckButton>
        <Lib.CheckButton dataObj={filterDataObj} dataKey="highPriority" color="warning">긴급</Lib.CheckButton>
      </div>
    </div>;
};

/**
 * @description ControlledCompactModeDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const ControlledCompactModeDemo = () => {
  const [isCompactMode, setIsCompactMode] = useState(true);

  return <div className="space-y-3">
      <Lib.CheckButton checked={isCompactMode} onValueChange={setIsCompactMode}>
        압축 보기
      </Lib.CheckButton>
      <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200/80">
        현재 목록 밀도: {isCompactMode ? '압축' : '넓게 보기'}
      </p>
    </div>;
};

/**
 * @description PresetColorCheckButtonDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const PresetColorCheckButtonDemo = () => {
  const statusDataObj = Lib.EasyObj({
    ready: true,
    pending: false,
    blocked: false,
    archived: false
  });

  return <div className="flex flex-wrap gap-2">
      <Lib.CheckButton color="success" dataObj={statusDataObj} dataKey="ready">Ready</Lib.CheckButton>
      <Lib.CheckButton color="warning" dataObj={statusDataObj} dataKey="pending">Pending</Lib.CheckButton>
      <Lib.CheckButton color="danger" dataObj={statusDataObj} dataKey="blocked">Blocked</Lib.CheckButton>
      <Lib.CheckButton color="neutral" dataObj={statusDataObj} dataKey="archived">Archived</Lib.CheckButton>
    </div>;
};

/**
 * @description DisabledCheckButtonDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const DisabledCheckButtonDemo = () => {
  return <div className="flex flex-wrap gap-2">
      <Lib.CheckButton disabled>권한 없음</Lib.CheckButton>
      <Lib.CheckButton disabled color="danger">잠긴 액션</Lib.CheckButton>
    </div>;
};

/**
 * @description CheckButton 예제 계약을 정의. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 상태가 필요한 예제는 demo 컴포넌트 안으로 가두고 계약은 직접 export한다.
 */
export const basicExampleList = [{
  exampleId: 'binding',
  component: <BoundFilterCheckButtonDemo />,
  description: 'EasyObj 바인딩 — 필터 칩 여러 개를 독립적으로 켜고 끄는 패턴',
  code: `const filterDataObj = Lib.EasyObj({
  unreadOnly: true,
  assignedToMe: false,
  highPriority: false,
});

<Lib.CheckButton dataObj={filterDataObj} dataKey="unreadOnly">
  읽지 않음
</Lib.CheckButton>
<Lib.CheckButton dataObj={filterDataObj} dataKey="assignedToMe" color="success">
  내 담당
</Lib.CheckButton>`
}, {
  exampleId: 'controlled',
  component: <ControlledCompactModeDemo />,
  description: '컨트롤드 모드 — checked/onValueChange로 보기 설정을 외부 상태와 동기화',
  code: `const [isCompactMode, setIsCompactMode] = useState(true);

<Lib.CheckButton
  checked={isCompactMode}
  onValueChange={setIsCompactMode}
>
  압축 보기
</Lib.CheckButton>`
}, {
  exampleId: 'disabled',
  component: <DisabledCheckButtonDemo />,
  description: '비활성화 상태 — 권한 부족이나 잠긴 옵션을 버튼 표면으로 표시',
  code: `<Lib.CheckButton disabled>
  권한 없음
</Lib.CheckButton>
<Lib.CheckButton disabled color="danger">
  잠긴 액션
</Lib.CheckButton>`
}];

export const variantExampleList = [{
  exampleId: 'colors',
  component: <PresetColorCheckButtonDemo />,
  description: '상태 프리셋 — success/warning/danger/neutral 버튼 색상',
  code: `<Lib.CheckButton color="success" dataObj={statusDataObj} dataKey="ready">
  Ready
</Lib.CheckButton>
<Lib.CheckButton color="warning" dataObj={statusDataObj} dataKey="pending">
  Pending
</Lib.CheckButton>
<Lib.CheckButton color="danger" dataObj={statusDataObj} dataKey="blocked">
  Blocked
</Lib.CheckButton>`
}];
