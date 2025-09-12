/**
 * 파일명: DropdownExamples.jsx
 * 설명: Dropdown 컴포넌트 사용 예제 모음 (EasyList 기반)
 */
import * as Lib from '@/lib';
import { useState } from 'react';

export const DropdownExamples = () => {
  const dataList = Lib.EasyList([
    { label: '항목 1', value: 'one' },
    { label: '항목 2', value: 'two' },
    { label: '비활성 항목', value: 'disabled', disabled: true },
  ]);
  const [sel, setSel] = useState(null);

  const examples = [
    {
      component: (
        <div className="flex flex-col gap-2 items-start">
          <Lib.Dropdown dataList={dataList} trigger={<span>메뉴 열기</span>} onSelect={(it) => setSel(it?.get ? it.get('label') : it?.label)} />
          <div className="text-sm text-gray-600">선택: {sel ?? '없음'} / 모델: {String((dataList.find?.((x)=>x.selected)?.label) ?? (dataList.forAll ? (()=>{ let l=null; dataList.forAll(it=>{ if(it.selected) l=it.label; }); return l; })(): ''))}</div>
      </div>
      ),
      description: 'EasyList 항목으로 구성된 기본 드롭다운',
      code: `const dataList = EasyList([\n  { label: '항목 1', value: 'one' },\n  { label: '항목 2', value: 'two' },\n  { label: '비활성 항목', value: 'disabled', disabled: true },\n]);\n<Dropdown dataList={dataList} trigger={<span>메뉴 열기</span>} onSelect={(it) => setSel(it.label)} />`
    },
  ];

  return examples;
};
