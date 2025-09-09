import * as Lib from '@/lib';

export const ComboboxExamples = () => {
  const cities = [
    { value: 'seoul', text: '서울', selected: true },
    { value: 'busan', text: '부산' },
    { value: 'incheon', text: '인천' },
    { value: 'daegu', text: '대구' },
  ];

  const examples = [
    {
      component: (
        <div className="space-y-2">
          <Lib.Combobox dataList={cities} placeholder="도시 선택" />
        </div>
      ),
      description: 'dataList 기반 선택 + 필터/초성검색',
      code: `const cities = [
  { value: 'seoul', text: '서울', selected: true },
  { value: 'busan', text: '부산' },
];

<Lib.Combobox dataList={cities} placeholder="도시 선택" />`
    },
    {
      component: (
        <Lib.Combobox dataList={[ { value: 'A', text: 'A' }, { value: 'B', text: 'B', selected: true }, { value: 'C', text: 'C' } ]} />
      ),
      description: '언바운드(dataList만) 기본값은 selected 항목',
      code: `<Lib.Combobox dataList={[ { value: 'A', text: 'A' }, { value: 'B', text: 'B', selected: true } ]} />`
    }
  ];

  return examples;
};
