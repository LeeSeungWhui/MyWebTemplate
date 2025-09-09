import * as Lib from '@/lib';

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

