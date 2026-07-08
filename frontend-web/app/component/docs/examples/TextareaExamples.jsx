"use client";

/**
 * 파일명: TextareaExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Textarea 컴포넌트 예제
 */
import * as Lib from '@/app/lib';
import { useState } from 'react';

/**
 * @description BoundTextareaDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const BoundTextareaDemo = () => {
  const textDataObj = Lib.EasyObj({
    memo: '고객 온보딩 미팅에서 API 권한 범위와 첫 대시보드 지표를 확정했습니다.'
  });

  return <div className="space-y-3">
      <div>
        <label htmlFor="textarea-bound-memo" className="block text-sm font-semibold text-slate-900">고객 미팅 메모</label>
        <p className="mt-1 text-xs text-slate-500">EasyObj 필드에 바로 연결된 긴 텍스트 입력</p>
      </div>
      <Lib.Textarea id="textarea-bound-memo" dataObj={textDataObj} dataKey="memo" rows={4} placeholder="메모를 입력하세요" />
      <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200/80">
        <span className="font-semibold text-slate-800">textDataObj.memo</span>
        <p className="mt-1 whitespace-pre-wrap">{textDataObj.memo}</p>
      </div>
    </div>;
};

/**
 * @description CtrlTextareaDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const CtrlTextareaDemo = () => {
  const [textValue, setTextValue] = useState('이번 배포에는 컴포넌트 문서 정리와 폼 입력 예제 개선이 포함됩니다.');

  return <div className="space-y-3">
      <div>
        <label htmlFor="textarea-controlled-note" className="block text-sm font-semibold text-slate-900">릴리즈 노트 초안</label>
        <p className="mt-1 text-xs text-slate-500">React state를 단일 소스로 유지</p>
      </div>
      <Lib.Textarea id="textarea-controlled-note" value={textValue} onValueChange={setTextValue} rows={3} />
      <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200/80">
        value = {textValue}
      </div>
    </div>;
};

/**
 * @description ErrorTextareaDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const ErrorTextareaDemo = () => {
  const textDataObj = Lib.EasyObj({
    memo: '짧음'
  });
  const isTooShort = textDataObj.memo.length < 10;

  return <div className="space-y-3">
      <div>
        <label htmlFor="textarea-error-reason" className="block text-sm font-semibold text-slate-900">반려 사유</label>
        <p className="mt-1 text-xs text-slate-500">10자 미만이면 바로 오류 상태로 노출</p>
      </div>
      <Lib.Textarea id="textarea-error-reason" dataObj={textDataObj} dataKey="memo" rows={4} error={isTooShort} placeholder="10자 이상 입력" />
      <div className={isTooShort ? 'text-xs font-medium text-rose-600' : 'text-xs font-medium text-emerald-700'}>
        {isTooShort ? '10자 이상 입력해주세요' : '정상'}
      </div>
    </div>;
};

/**
 * @description Textarea 예제 계약을 정의. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 단건 섹션은 ExampleObj로 노출하고 상태는 demo 컴포넌트 안에만 둔다.
 */
export const boundExampleObj = {
  exampleId: 'bound',
  component: <BoundTextareaDemo />,
  description: 'dataObj + dataKey로 긴 메모 상태를 직접 바인딩',
  code: `const textDataObj = Lib.EasyObj({
  memo: '고객 온보딩 미팅에서 API 권한 범위와 첫 대시보드 지표를 확정했습니다.',
});

<Lib.Textarea
  id="textarea-bound-memo"
  dataObj={textDataObj}
  dataKey="memo"
  rows={4}
  placeholder="메모를 입력하세요"
/>`
};

export const controlExampleObj = {
  exampleId: 'controlled',
  component: <CtrlTextareaDemo />,
  description: 'value + onValueChange로 외부 상태와 동기화',
  code: `const [textValue, setTextValue] = useState('이번 배포에는 컴포넌트 문서 정리와 폼 입력 예제 개선이 포함됩니다.');

<Lib.Textarea
  id="textarea-controlled-note"
  value={textValue}
  onValueChange={setTextValue}
  rows={3}
/>`
};

export const errorExampleObj = {
  exampleId: 'error',
  component: <ErrorTextareaDemo />,
  description: 'error prop과 aria-invalid를 사용한 즉시 검증',
  code: `<Lib.Textarea
  id="textarea-error-reason"
  dataObj={textDataObj}
  dataKey="memo"
  rows={4}
  error={textDataObj.memo.length < 10}
  placeholder="10자 이상 입력"
/>
<div className="mt-1 text-xs text-red-600">{textDataObj.memo.length < 10 ? '10자 이상 입력해주세요' : '정상'}</div>`
};

export const readonlyExampleObj = {
  exampleId: 'readonly',
  component: <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-2">
        <label htmlFor="textarea-readonly" className="block text-sm font-semibold text-slate-900">승인 완료 메모</label>
        <Lib.Textarea id="textarea-readonly" placeholder="읽기 전용" value="검토 완료되어 더 이상 수정할 수 없습니다." readOnly />
      </div>
      <div className="space-y-2">
        <label htmlFor="textarea-disabled" className="block text-sm font-semibold text-slate-900">권한 없음</label>
        <Lib.Textarea id="textarea-disabled" placeholder="관리자 권한이 필요합니다" disabled />
      </div>
    </div>,
  description: 'readOnly와 disabled 상태를 나란히 비교',
  code: `<Lib.Textarea
  id="textarea-readonly"
  value="검토 완료되어 더 이상 수정할 수 없습니다."
  readOnly
/>
<Lib.Textarea
  id="textarea-disabled"
  placeholder="관리자 권한이 필요합니다"
  disabled
/>`
};
