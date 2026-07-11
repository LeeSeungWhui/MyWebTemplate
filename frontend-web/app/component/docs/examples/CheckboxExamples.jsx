/**
 * 파일명: CheckboxExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Checkbox 컴포넌트 예제
 */
import * as Lib from '@/app/lib';
import { useState } from 'react';

/**
 * @description BoundNotificationCheckboxDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const BoundNotificationCheckboxDemo = () => {
  const notificationDataObj = Lib.EasyObj({
    securityNotice: true,
    productNotice: false,
    marketingNotice: false
  });

  return <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-slate-900">알림 수신 설정</h4>
        <p className="mt-1 text-xs text-slate-500">EasyObj boolean 필드에 각 항목을 독립 저장</p>
      </div>
      <div className="space-y-2 rounded-lg bg-slate-50 px-3 py-3 ring-1 ring-slate-200/80">
        <Lib.Checkbox name="notice" label="보안 알림 받기" dataObj={notificationDataObj} dataKey="securityNotice" color="danger" />
        <Lib.Checkbox name="notice" label="제품 업데이트 받기" dataObj={notificationDataObj} dataKey="productNotice" color="primary" />
        <Lib.Checkbox name="notice" label="마케팅 소식 받기" dataObj={notificationDataObj} dataKey="marketingNotice" color="neutral" />
      </div>
    </div>;
};

/**
 * @description ControlledApprovalCheckboxDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const ControlledApprovalCheckboxDemo = () => {
  const [isApproved, setIsApproved] = useState(false);

  return <div className="space-y-3">
      <Lib.Checkbox label="상담 내용 확인 완료" checked={isApproved} onValueChange={setIsApproved} color="success" />
      <div className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${isApproved ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'}`}>
        {isApproved ? '후속 안내 가능' : '확인 대기'}
      </div>
    </div>;
};

/**
 * @description ConsentChecklistDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const ConsentChecklistDemo = () => {
  const consentDataObj = Lib.EasyObj({
    termsAgreed: false,
    privacyAgreed: false,
    marketingAgreed: false
  });

  return <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-900">가입 약관 동의</h4>
      <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
        <Lib.Checkbox name="terms" label="[필수] 서비스 이용약관 동의" dataObj={consentDataObj} dataKey="termsAgreed" color="success" />
        <Lib.Checkbox name="privacy" label="[필수] 개인정보 처리방침 동의" dataObj={consentDataObj} dataKey="privacyAgreed" color="success" />
        <Lib.Checkbox name="marketing" label="[선택] 프로모션 정보 수신" dataObj={consentDataObj} dataKey="marketingAgreed" color="neutral" />
      </div>
    </div>;
};

/**
 * @description StatusColorCheckboxDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const StatusColorCheckboxDemo = () => {
  const checklistDataObj = Lib.EasyObj({
    requestChecked: true,
    callbackNeeded: true,
    paymentHold: false
  });

  return <div className="space-y-2">
      <Lib.Checkbox label="요청 내용 확인" dataObj={checklistDataObj} dataKey="requestChecked" color="success" />
      <Lib.Checkbox label="전화 상담 필요" dataObj={checklistDataObj} dataKey="callbackNeeded" color="warning" />
      <Lib.Checkbox label="결제 확인 보류" dataObj={checklistDataObj} dataKey="paymentHold" color="danger" />
    </div>;
};

/**
 * @description DisabledCheckboxDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const DisabledCheckboxDemo = () => {
  return <div className="space-y-2">
      <Lib.Checkbox label="관리자 전용 설정" disabled />
      <p className="text-xs text-slate-500">권한이 없는 항목은 라벨까지 흐리게 처리됩니다.</p>
    </div>;
};

/**
 * @description Checkbox 예제 계약을 정의. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 상태가 필요한 예제는 demo 컴포넌트 안으로 가두고 계약은 직접 export한다.
 */
export const basicExampleList = [{
  exampleId: 'binding',
  component: <BoundNotificationCheckboxDemo />,
  description: 'EasyObj 데이터 연결 — 알림 설정처럼 여러 boolean 필드를 독립적으로 저장',
  code: `const notificationDataObj = Lib.EasyObj({
  securityNotice: true,
  productNotice: false,
  marketingNotice: false,
});

<Lib.Checkbox
  name="notice"
  label="보안 알림 받기"
  dataObj={notificationDataObj}
  dataKey="securityNotice"
  color="danger"
/>`
}, {
  exampleId: 'controlled',
  component: <ControlledApprovalCheckboxDemo />,
  description: '외부 상태 제어 — checked/onValueChange로 확인 상태와 동기화',
  code: `const [isApproved, setIsApproved] = useState(false);

<Lib.Checkbox
  label="상담 내용 확인 완료"
  checked={isApproved}
  onValueChange={setIsApproved}
  color="success"
/>`
}, {
  exampleId: 'disabled',
  component: <DisabledCheckboxDemo />,
  description: '비활성화 상태 — 권한 부족 또는 읽기 전용 항목 표시',
  code: `<Lib.Checkbox
  label="관리자 전용 설정"
  disabled
/>`
}];

export const variantExampleList = [{
  exampleId: 'consent',
  component: <ConsentChecklistDemo />,
  description: '약관 동의 — 필수/선택 항목을 같은 폼 그룹에서 관리',
  code: `<Lib.Checkbox
  name="terms"
  label="[필수] 서비스 이용약관 동의"
  dataObj={consentDataObj}
  dataKey="termsAgreed"
  color="success"
/>`
}, {
  exampleId: 'colors',
  component: <StatusColorCheckboxDemo />,
  description: '상태 색상 — success/warning/danger 프리셋으로 의미를 구분',
  code: `<Lib.Checkbox
  label="요청 내용 확인"
  dataObj={checklistDataObj}
  dataKey="requestChecked"
  color="success"
/>
<Lib.Checkbox
  label="전화 상담 필요"
  dataObj={checklistDataObj}
  dataKey="callbackNeeded"
  color="warning"
/>`
}];
