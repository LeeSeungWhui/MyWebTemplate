/**
 * 파일명: ComboboxExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Combobox 컴포넌트 예제
 */
import * as Lib from '@/lib';
import { useState } from 'react';

export const ComboboxExamples = () => {
  const citiesSelected = [
    { value: 'seoul', text: '서울', selected: true },
    { value: 'busan', text: '부산' },
    { value: 'incheon', text: '인천' },
    { value: 'daegu', text: '대구' },
  ];
  const cities = [
    { value: 'seoul', text: '서울' },
    { value: 'busan', text: '부산' },
    { value: 'incheon', text: '인천' },
    { value: 'daegu', text: '대구' },
  ];
  const [ctlCity, setCtlCity] = useState('incheon');

  const examples = [
    {
      component: (
        <div className="space-y-2">
          <Lib.Combobox dataList={cities} placeholder="도시 선택" />
        </div>
      ),
      description: '기본: dataList(선택 없음) + 필터/초성검색',
      code: `const cities = [
  { value: 'seoul', text: '서울' },
  { value: 'busan', text: '부산' },
  { value: 'incheon', text: '인천' },
  { value: 'daegu', text: '대구' },
];

<Lib.Combobox dataList={cities} placeholder="도시 선택" />`
    },
    {
      component: (
        <div className="space-y-2">
          <Lib.Combobox dataList={citiesSelected} value={ctlCity} onValueChange={setCtlCity} placeholder="도시 선택 (컨트롤드)" />
          <div className="text-xs text-gray-600">value = {String(ctlCity)}</div>
          <div className="text-xs text-gray-500">초성검색 예: ㅅㅇ→서울, ㅂㅅ→부산</div>
        </div>
      ),
      description: '컨트롤드: value + onValueChange + 초성검색',
      code: `const [city, setCity] = useState('incheon');

<Lib.Combobox
  dataList={cities}
  value={city}
  onValueChange={setCity}
  placeholder="도시 선택 (컨트롤드)"
/>`
    },
    {
      component: (
        <Lib.Combobox
          dataList={[{ value: 'A', text: '사과' }, { value: 'B', text: '바나나' }, { value: 'C', text: '체리' }]}
          multi
          placeholder="과일 선택"
        />
      ),
      description: 'multi: 다중 선택 (라벨 나열)',
      code: `<Lib.Combobox dataList={[ { value: 'A', text: '사과' }, { value: 'B', text: '바나나' } ]} multi placeholder="과일 선택"/>`
    },
    {
      component: (
        <Lib.Combobox
          dataList={[{ value: 'A', text: '사과' }, { value: 'B', text: '바나나' }, { value: 'C', text: '체리' }]}
          multi
          multiSummary
          showSelectAll
          placeholder="과일 선택"
        />
      ),
      description: 'multi + 요약 뱃지 + 전체 선택/해제',
      code: `<Lib.Combobox dataList={[ { value: 'A', text: '사과' }, { value: 'B', text: '바나나' }, { value: 'C', text: '체리' } ]}
  multi multiSummary showSelectAll placeholder="과일 선택"/>`
    }
  ];

  return examples;
};

