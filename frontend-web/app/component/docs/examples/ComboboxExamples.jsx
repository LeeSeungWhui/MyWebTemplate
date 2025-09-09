import * as Lib from '@/lib';

export const ComboboxExamples = () => {
  const cities = [
    { value: 'seoul', text: '서울', selected: true },
    { value: 'busan', text: '부산' },
    { value: 'incheon', text: '인천' },
    { value: 'daegu', text: '대구' },
  ];
  const obj = Lib.EasyObj({ city: 'incheon', fruits: [] });

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
        <div className="space-y-2">
          <Lib.Combobox dataList={cities} dataObj={obj} dataKey="city" placeholder="도시 선택 (바운드)" />
          <div className="text-xs text-gray-600">obj.city = {String(obj.city)}</div>
          <div className="text-xs text-gray-500">초성검색 예: ㅅㅇ→서울, ㅂㅅ→부산</div>
        </div>
      ),
      description: 'dataObj 바운드 + 초성검색',
      code: `const obj = Lib.EasyObj({ city: 'incheon' });

<Lib.Combobox dataList={cities} dataObj={obj} dataKey="city" placeholder="도시 선택 (바운드)" />`
    },
    {
      component: (
        <Lib.Combobox
          dataList={[ { value: 'A', text: '사과' }, { value: 'B', text: '바나나' }, { value: 'C', text: '체리' } ]}
          multi
          placeholder="과일 선택"
        />
      ),
      description: 'multi: 다중 선택 (라벨 나열)',
      code: `<Lib.Combobox dataList={[ { value: 'A', text: '사과' }, { value: 'B', text: '바나나' } ]} multi />`
    },
    {
      component: (
        <Lib.Combobox
          dataList={[ { value: 'A', text: '사과' }, { value: 'B', text: '바나나' }, { value: 'C', text: '체리' } ]}
          multi
          multiSummary
          showSelectAll
          placeholder="과일 선택"
        />
      ),
      description: 'multi + 요약 뱃지 + 전체 선택/해제',
      code: `<Lib.Combobox dataList={[ { value: 'A', text: '사과' }, { value: 'B', text: '바나나' }, { value: 'C', text: '체리' } ]}
  multi multiSummary showSelectAll />`
    }
  ];

  return examples;
};

