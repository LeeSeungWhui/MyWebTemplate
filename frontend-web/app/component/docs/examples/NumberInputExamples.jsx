/**
 * 파일명: NumberInputExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: NumberInput 컴포넌트 예제
 */
import * as Lib from '@/lib';

export const NumberInputExamples = () => {
  const obj = Lib.EasyObj({ qty: 1, price: 0 });

  const examples = [
    {
      component: (
        <div className="space-y-2">
          <Lib.NumberInput dataObj={obj} dataKey="qty" min={0} step={1} />
          <div className="text-xs text-gray-600">obj.qty = {String(obj.qty)}</div>
        </div>
      ),
      description: '기본: 바운드 + step 1',
      code: `const obj = Lib.EasyObj({ qty: 1 });

<Lib.NumberInput dataObj={obj} dataKey=\"qty\" min={0} step={1} />`
    },
    {
      component: (
        <Lib.NumberInput dataObj={obj} dataKey="price" min={0} max={100} step={0.5} />
      ),
      description: 'min/max/step 조합',
      code: `<Lib.NumberInput dataObj={obj} dataKey=\"price\" min={0} max={100} step={0.5} />`
    },
    {
      component: (
        <Lib.NumberInput defaultValue={10} step={5} />
      ),
      description: '언바운드 + defaultValue',
      code: `<Lib.NumberInput defaultValue={10} step={5} />`
    }
  ];

  return examples;
};

