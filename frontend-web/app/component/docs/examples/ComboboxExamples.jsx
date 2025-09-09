import * as Lib from '@/lib';

export const ComboboxExamples = () => {
  const cities = [
    { value: 'seoul', label: '서울' },
    { value: 'busan', label: '부산' },
    { value: 'incheon', label: '인천' },
    { value: 'daegu', label: '대구' },
  ];
  const obj = Lib.EasyObj({ city: '' });

  const examples = [
    {
      component: (
        <div className="space-y-2">
          <Lib.Combobox dataObj={obj} dataKey="city" items={cities} placeholder="도시 선택" />
          <div className="text-xs text-gray-600">obj.city = {String(obj.city)}</div>
        </div>
      ),
      description: '기본: 바운드 + 필터 가능',
      code: `const cities = [ { value: 'seoul', label: '서울' }, ... ];
const obj = Lib.EasyObj({ city: '' });

<Lib.Combobox dataObj={obj} dataKey=\"city\" items={cities} placeholder=\"도시 선택\" />`
    },
    {
      component: (
        <Lib.Combobox items={[ 'A', 'B', 'C' ]} defaultValue="B" />
      ),
      description: '언바운드 + 기본값',
      code: `<Lib.Combobox items={[ 'A', 'B', 'C' ]} defaultValue=\"B\" />`
    }
  ];

  return examples;
};

