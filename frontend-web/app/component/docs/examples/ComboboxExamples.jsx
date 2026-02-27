/**
 * 파일명: ComboboxExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-11-05
 * 설명: Combobox 컴포넌트 예제 (EasyList/EasyObj 연동 포함)
 */
import { useState } from 'react'
import * as Lib from '@/app/lib'

/**
 * @description  ComboboxExamples 구성 데이터를 반환한다. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 입력값과 상태를 검증해 UI/데이터 흐름을 안전하게 유지한다.
 */
export const ComboboxExamples = () => {
  const cityList = Lib.EasyList([
    { value: 'seoul', text: '서울' },
    { value: 'busan', text: '부산' },
    { value: 'incheon', text: '인천' },
    { value: 'daegu', text: '대구' },
  ])

  const profile = Lib.EasyObj({
    address: {
      city: 'incheon',
      favorites: ['seoul', 'busan'],
    },
  })

  const [controlledCity, setControlledCity] = useState('seoul')

  const emptyCityList = Lib.EasyList([])

  return [
    {
      component: (
        <Lib.Combobox
          id="combobox-bound"
          dataList={cityList}
          dataObj={profile.address}
          dataKey="city"
          placeholder="도시 선택"
          status="success"
          statusMessage={`선택 도시: ${profile.address.city}`}
        />
      ),
      description:
        'EasyObj 바운드 모드 — dataObj/dataKey로 주소 객체와 동기화',
      code: `const cityList = Lib.EasyList([
  { value: 'seoul', text: '서울' },
  { value: 'busan', text: '부산' },
  { value: 'incheon', text: '인천' },
  { value: 'daegu', text: '대구' },
]);
const profile = Lib.EasyObj({ address: { city: 'incheon' } });

<Lib.Combobox
  dataList={cityList}
  dataObj={profile.address}
  dataKey="city"
  placeholder="도시 선택"
  status="success"
  statusMessage={\`선택 도시: \${profile.address.city}\`}
/>`,
    },
    {
      component: (
        <div className="space-y-2">
          <Lib.Combobox
            id="combobox-controlled"
            dataList={cityList}
            value={controlledCity}
            onValueChange={setControlledCity}
            placeholder="도시 선택 (컨트롤드)"
            status="info"
            statusMessage={`value prop: ${controlledCity}`}
          />
          <div className="text-xs text-gray-500">
            초성검색 예: ㅅㅇ→서울, ㅂㅅ→부산
          </div>
        </div>
      ),
      description: '컨트롤드 모드 — value/onValueChange 조합',
      code: `const [city, setCity] = useState('seoul');

<Lib.Combobox
  dataList={cityList}
  value={city}
  onValueChange={setCity}
  placeholder="도시 선택 (컨트롤드)"
  status="info"
  statusMessage={\`value prop: \${city}\`}
/>`,
    },
    {
      component: (
        <Lib.Combobox
          id="combobox-multi"
          dataList={cityList}
          dataObj={profile.address}
          dataKey="favorites"
          multi
          multiSummary
          showSelectAll
          summaryText="{count}개 도시 선택"
          placeholder="좋아하는 도시 선택"
          status="warning"
          statusMessage="다중 선택 (EasyList selected/바운드 값 동시 반영)"
        />
      ),
      description:
        'multi + EasyObj 배열 바운드 — favorites 배열과 EasyList selected 동기화',
      code: `<Lib.Combobox
  dataList={cityList}
  dataObj={profile.address}
  dataKey="favorites"
  multi
  multiSummary
  showSelectAll
  summaryText="{count}개 도시 선택"
  placeholder="좋아하는 도시 선택"
  status="warning"
  statusMessage="다중 선택 (EasyList selected/바운드 값 동시 반영)"
/>`,
    },
    {
      component: (
        <Lib.Combobox
          id="combobox-loading"
          dataList={Lib.EasyList([{ value: '', text: '불러오는 중', placeholder: true }])}
          status="loading"
          assistiveText="도시 목록을 불러오는 중입니다."
          disabled
        />
      ),
      description: '로딩/비활성화 — status="loading" + assistiveText',
      code: `<Lib.Combobox
  dataList={Lib.EasyList([{ value: '', text: '불러오는 중', placeholder: true }])}
  status="loading"
  assistiveText="도시 목록을 불러오는 중입니다."
  disabled
/>`,
    },
    {
      component: (
        <Lib.Combobox
          id="combobox-empty"
          dataList={emptyCityList}
          status="empty"
          assistiveText="선택 가능한 도시가 없습니다."
        />
      ),
      description:
        '빈 상태 — status="empty" 프리셋으로 항목 부재 안내와 assertive 라이브 영역',
      code: `<Lib.Combobox
  dataList={Lib.EasyList([])}
  status="empty"
  assistiveText="선택 가능한 도시가 없습니다."
/>`,
    },
  ]
}
