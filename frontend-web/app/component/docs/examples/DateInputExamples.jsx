/**
 * 파일명: DateInputExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: DateInput 컴포넌트 예제
 */
import * as Lib from '@/app/lib';

/**
 * @description  DateInputExamples 구성 데이터를 반환한다. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 입력값과 상태를 검증해 UI/데이터 흐름을 안전하게 유지한다.
 */
export const DateInputExamples = () => {
  const obj = Lib.EasyObj({ date: '' });

  const examples = [
    {
      component: (
        <div className="space-y-2">
          <Lib.DateInput dataObj={obj} dataKey="date" />
          <div className="text-xs text-gray-600">obj.date = {String(obj.date)}</div>
        </div>
      ),
      description: '기본: 바운드',
      code: `const obj = Lib.EasyObj({ date: '' });

<Lib.DateInput dataObj={obj} dataKey=\"date\" />`
    },
    {
      component: (
        <Lib.DateInput defaultValue="2025-01-01" min="2025-01-01" max="2025-12-31" />
      ),
      description: 'min/max + 기본값',
      code: `<Lib.DateInput defaultValue=\"2025-01-01\" min=\"2025-01-01\" max=\"2025-12-31\" />`
    }
  ];

  return examples;
};

