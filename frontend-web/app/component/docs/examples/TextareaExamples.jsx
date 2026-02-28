"use client";
/**
 * 파일명: TextareaExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Textarea 컴포넌트 예제
 */
import * as Lib from '@/app/lib';
import { useState } from 'react';

/**
 * @description TextareaExamples 구성 데이터를 반환. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 입력값과 상태를 검증해 UI/데이터 흐름을 안전하게 유지한다.
 */
export const TextareaExamples = () => {
  const textDataObj = Lib.EasyObj({ memo: '초기 메모' });
  const [val, setVal] = useState('로컬 상태');

  const examples = [
    {
      component: (
        <div>
          <div className="mb-2 text-sm text-gray-600">바운드 모드</div>
          <Lib.Textarea
            dataObj={textDataObj}
            dataKey="memo"
            rows={4}
            placeholder="메모를 입력하세요"
            onValueChange={(nextValue) => console.log('textarea(bound):', nextValue)}
          />
          <div className="mt-1 text-xs text-gray-500">textDataObj.memo = {textDataObj.memo}</div>
        </div>
      ),
      description: 'dataObj + dataKey 로 상태 바인딩',
      code: `const textDataObj = Lib.EasyObj({ memo: '' });

<Lib.Textarea
  dataObj={textDataObj}
  dataKey="memo"
  rows={4}
  placeholder="메모를 입력하세요"
  onValueChange={(nextValue) => console.log('textarea(bound):', nextValue)}
/>`
    },
    {
      component: (
        <div>
          <div className="mb-2 text-sm text-gray-600">컨트롤드 모드</div>
          <Lib.Textarea value={val} onValueChange={setVal} rows={3} />
          <div className="mt-1 text-xs text-gray-500">value = {val}</div>
        </div>
      ),
      description: '컨트롤드 모드 (value + onValueChange)',
      code: `const [val, setVal] = useState('');

<Lib.Textarea
  value={val}
  onValueChange={setVal}
  rows={3}
/>`
    },
    {
      component: (
        <div>
          <div className="mb-2 text-sm text-gray-600">검증/에러 상태</div>
          <Lib.Textarea
            dataObj={textDataObj}
            dataKey="memo"
            rows={4}
            error={textDataObj.memo.length < 10}
            placeholder="10자 이상 입력"
          />
          <div className="mt-1 text-xs text-red-600">{textDataObj.memo.length < 10 ? '10자 이상 입력해주세요' : '정상'}</div>
        </div>
      ),
      description: 'error prop 과 aria-invalid 활용',
      code: `<Lib.Textarea
  dataObj={textDataObj}
  dataKey="memo"
  rows={4}
  error={textDataObj.memo.length < 10}
  placeholder="10자 이상 입력"
/>
<div className="mt-1 text-xs text-red-600">{textDataObj.memo.length < 10 ? '10자 이상 입력해주세요' : '정상'}</div>`
    },
    {
      component: (
        <div className="flex flex-col gap-3">
          <Lib.Textarea placeholder="읽기 전용" value="내용 편집 불가" readOnly />
          <Lib.Textarea placeholder="비활성화" disabled />
        </div>
      ),
      description: 'readOnly / disabled 상태',
      code: `<Lib.Textarea placeholder="읽기 전용" value="내용 편집 불가" readOnly />
<Lib.Textarea placeholder="비활성화" disabled />`
    }
  ];

  return examples;
};
