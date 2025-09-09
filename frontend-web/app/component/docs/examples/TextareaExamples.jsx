"use client";
import * as Lib from '@/lib';
import { useState } from 'react';

const TextareaExamples = () => {
  const obj = Lib.EasyObj({ memo: '초기값' });
  const [val, setVal] = useState('로컬 상태');
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 text-sm text-gray-600">바운드 모드</div>
        <Lib.Textarea dataObj={obj} dataKey="memo" rows={4} onValueChange={(v, ctx) => console.log('textarea bound', v, ctx)} />
        <div className="mt-1 text-xs text-gray-500">obj.memo = {obj.memo}</div>
      </div>
      <div>
        <div className="mb-2 text-sm text-gray-600">컨트롤드 모드</div>
        <Lib.Textarea value={val} onValueChange={setVal} rows={3} />
        <div className="mt-1 text-xs text-gray-500">value = {val}</div>
      </div>
    </div>
  );
};

export default TextareaExamples;

