/**
 * 파일명: InputExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Input 컴포넌트 예제
 */
import * as Lib from '@/app/lib';

/**
 * @description BoundInputDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const BoundInputDemo = ({ dataKey, fieldId, label, hint, initialDataObj, ...inputProps }) => {
  const inputDataObj = Lib.EasyObj(initialDataObj);
  const inputId = fieldId || `input-demo-${dataKey}`;

  return <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-semibold text-slate-900">{label}</label>
      <Lib.Input id={inputId} dataObj={inputDataObj} dataKey={dataKey} {...inputProps} />
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>;
};

/**
 * @description Input 예제 계약을 정의. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 상태가 필요한 예제는 demo 컴포넌트 안으로 가두고 계약은 직접 export한다.
 */
export const basicExampleList = [{
  exampleId: 'basic',
  component: <BoundInputDemo dataKey="projectName" fieldId="input-project-name" label="프로젝트명" hint="일반 텍스트 필드와 placeholder 상태" initialDataObj={{
    projectName: ''
  }} placeholder="예: 고객 포털 리뉴얼" />,
  description: '가장 기본적인 텍스트 입력',
  code: `<Lib.Input
    dataObj={inputDataObj}
    dataKey="projectName"
    placeholder="예: 고객 포털 리뉴얼"
/>`
}, {
  exampleId: 'email',
  component: <BoundInputDemo dataKey="email" fieldId="input-email" label="담당자 이메일" hint="type=email을 그대로 전달" initialDataObj={{
    email: ''
  }} type="email" placeholder="owner@example.com" />,
  description: '이메일 입력',
  code: `<Lib.Input
    dataObj={inputDataObj}
    dataKey="email"
    type="email"
    placeholder="owner@example.com"
/>`
}];

export const maskExampleList = [{
  exampleId: 'phoneMask',
  component: <BoundInputDemo dataKey="phone" fieldId="input-phone" label="연락처" hint="숫자 입력을 전화번호 포맷으로 표시" initialDataObj={{
    phone: ''
  }} mask="###-####-####" placeholder="010-1234-5678" />,
  description: '전화번호 마스킹',
  code: `<Lib.Input
    dataObj={inputDataObj}
    dataKey="phone"
    mask="###-####-####"
    placeholder="010-1234-5678"
/>`
}, {
  exampleId: 'businessMask',
  component: <BoundInputDemo dataKey="businessNo" fieldId="input-business-no" label="사업자번호" hint="고정 포맷 식별자 입력" initialDataObj={{
    businessNo: ''
  }} mask="###-##-#####" placeholder="123-45-67890" />,
  description: '사업자번호 마스킹',
  code: `<Lib.Input
    dataObj={inputDataObj}
    dataKey="businessNo"
    mask="###-##-#####"
    placeholder="사업자번호 123-45-67890"
/>`
}];

export const filterExampleList = [{
  exampleId: 'numberLimit',
  component: <BoundInputDemo dataKey="amount" fieldId="input-amount" label="예산" hint="정수 10자리, 소수 2자리까지 허용" initialDataObj={{
    amount: ''
  }} type="number" maxDigits={10} maxDecimals={2} placeholder="1200000.00" />,
  description: '숫자 입력 (자리수 제한)',
  code: `<Lib.Input
    dataObj={inputDataObj}
    dataKey="amount"
    type="number"
    maxDigits={10}
    maxDecimals={2}
    placeholder="1200000.00"
/>`
}, {
  exampleId: 'alphaNum',
  component: <BoundInputDemo dataKey="code" fieldId="input-code" label="초대 코드" hint="영문/숫자만 허용" initialDataObj={{
    code: ''
  }} filter="A-Za-z0-9" placeholder="TEAM2026" />,
  description: '영문/숫자 필터',
  code: `<Lib.Input
    dataObj={inputDataObj}
    dataKey="code"
    filter="A-Za-z0-9"
    placeholder="TEAM2026"
/>`
}, {
  exampleId: 'korean',
  component: <BoundInputDemo dataKey="koreanName" fieldId="input-korean-name" label="한글 이름" hint="한글 조합 입력을 유지하면서 필터링" initialDataObj={{
    koreanName: ''
  }} filter="가-힣" placeholder="홍길동" />,
  description: '한글 필터',
  code: `<Lib.Input
    dataObj={inputDataObj}
    dataKey="koreanName"
    filter="가-힣"
    placeholder="홍길동"
/>`
}];

export const advancedExampleList = [{
  exampleId: 'error',
  component: <BoundInputDemo dataKey="recoveryEmail" fieldId="input-recovery-email" label="복구 이메일" hint="검증 실패 메시지를 인라인으로 표시" initialDataObj={{
    recoveryEmail: ''
  }} error="이메일 형식이 올바르지 않습니다" placeholder="wrong-email" />,
  description: '에러 상태',
  code: `<Lib.Input
    dataObj={inputDataObj}
    dataKey="recoveryEmail"
    error="이메일 형식이 올바르지 않습니다"
    placeholder="wrong-email"
/>`
}, {
  exampleId: 'price',
  component: <BoundInputDemo dataKey="price" fieldId="input-price" label="청구 금액" hint="우측 정렬과 suffix 단위 표시" initialDataObj={{
    price: ''
  }} type="number" maxDigits={10} className="text-right" placeholder="금액 입력" suffix="원" />,
  description: '금액 입력 (우측 정렬, 접미사 표시)',
  code: `<Lib.Input
    dataObj={inputDataObj}
    dataKey="price"
    type="number"
    maxDigits={10}
    className="text-right"
    placeholder="금액 입력"
    suffix="원"
/>`
}, {
  exampleId: 'search',
  component: <BoundInputDemo dataKey="searchKeyword" fieldId="input-search" label="고객 검색" hint="prefix 아이콘으로 검색 목적을 빠르게 인지" initialDataObj={{
    searchKeyword: ''
  }} prefix={<Lib.Icon icon="ri:RiSearchLine" className="h-5 w-5 text-slate-400" />} placeholder="이름, 이메일, 회사명 검색" />,
  description: '아이콘이 있는 검색 입력',
  code: `<Lib.Input
    dataObj={inputDataObj}
    dataKey="searchKeyword"
    prefix={<Lib.Icon icon="ri:RiSearchLine" className="h-5 w-5 text-slate-400" />}
    placeholder="이름, 이메일, 회사명 검색"
/>`
}, {
  exampleId: 'password',
  component: <BoundInputDemo dataKey="password" fieldId="input-password" label="비밀번호" hint="togglePassword로 표시/숨김 전환" initialDataObj={{
    password: ''
  }} type="password" placeholder="비밀번호 입력" togglePassword />,
  description: '비밀번호 토글 기능',
  code: `<Lib.Input
    dataObj={inputDataObj}
    dataKey="password"
    type="password"
    placeholder="비밀번호 입력"
    togglePassword
/>`
}];
