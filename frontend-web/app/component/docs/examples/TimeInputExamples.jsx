/**
 * 파일명: TimeInputExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: TimeInput 컴포넌트 예제
 */
import * as Lib from '@/app/lib';

/**
 * @description TimeInputExamples 구성 데이터를 반환한다.
 * @updated 2026-02-24
 */
export const TimeInputExamples = () => {
  const obj = Lib.EasyObj({ time: '' });

  const examples = [
    {
      component: (
        <div className="space-y-2">
          <Lib.TimeInput dataObj={obj} dataKey="time" />
          <div className="text-xs text-gray-600">obj.time = {String(obj.time)}</div>
        </div>
      ),
      description: '기본: 바운드',
      code: `const obj = Lib.EasyObj({ time: '' });

<Lib.TimeInput dataObj={obj} dataKey=\"time\" />`
    },
    {
      component: (
        <Lib.TimeInput defaultValue="09:30" step={60} />
      ),
      description: '기본값 + 분 단위(step)',
      code: `<Lib.TimeInput defaultValue=\"09:30\" step={60} />`
    }
  ];

  return examples;
};

