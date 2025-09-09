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
        <Lib.Combobox
          dataList={[ { value: 'A', text: '사과' }, { value: 'B', text: '바나나' }, { value: 'C', text: '체리' } ]}
          multi
          placeholder="과일 선택"
        />
      ),
      description: 'multi: 다중 선택 (선택 항목 라벨을 , 로 표시)',
      code: `<Lib.Combobox dataList={[ { value: 'A', text: '사과' }, { value: 'B', text: '바나나' } ]} multi />`
    }
  ];

  return examples;
};
