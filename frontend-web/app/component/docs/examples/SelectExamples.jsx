/**
 * 파일명: SelectExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-11-05
 * 설명: Select 컴포넌트 바운드/컨트롤드/상태 시나리오 예제
 */
import { useState } from 'react'
import * as Lib from '@/app/lib'

export const SelectExamples = () => {
  const jobOptions = Lib.EasyList([
    { id: '', label: '직무를 선택하세요', placeholder: true, selected: true },
    { id: 'designer', label: '디자이너' },
    { id: 'developer', label: '개발자' },
    { id: 'pm', label: '프로덕트 매니저' },
  ])

  const emptyOptions = Lib.EasyList([])

  const [role, setRole] = useState('developer')

  const loadingOptions = Lib.EasyList([
    { id: '', label: '불러오는 중', placeholder: true, selected: true },
  ])

  const getSelectedJobId = () => {
    const selected = jobOptions.find((item) => item.selected)
    return selected ? String(selected.id) : ''
  }

  return [
    {
      component: (
        <div className="space-y-2">
          <Lib.Select
            id="select-easylist"
            dataList={jobOptions}
            valueKey="id"
            textKey="label"
            status="success"
            statusMessage="dataList의 selected 플래그와 동기화됩니다."
          />
          <dl className="text-xs text-gray-600">
            <dt className="font-semibold">현재 선택된 id</dt>
            <dd>{getSelectedJobId()}</dd>
          </dl>
        </div>
      ),
      description:
        'EasyList 모드 — dataList 내부의 selected 플래그만으로 선택 상태를 관리',
      code: `const jobs = Lib.EasyList([
  { id: '', label: '직무를 선택하세요', placeholder: true, selected: true },
  { id: 'designer', label: '디자이너' },
  { id: 'developer', label: '개발자' },
  { id: 'pm', label: '프로덕트 매니저' },
]);

<Lib.Select
  dataList={jobs}
  valueKey="id"
  textKey="label"
  status="success"
  statusMessage="dataList의 selected 플래그와 동기화됩니다."
/>`,
    },
    {
      component: (
        <div className="space-y-2">
          <Lib.Select
            id="select-controlled"
            dataList={jobOptions}
            valueKey="id"
            textKey="label"
            value={role}
            onValueChange={setRole}
            status="info"
            statusMessage={`value prop: ${role}`}
          />
          <div className="text-xs text-gray-600">value = {String(role)}</div>
        </div>
      ),
      description:
        '컨트롤드 모드 — value/onValueChange로 외부 상태와 동기화하면서도 dataList.selected는 자동 갱신',
      code: `const [role, setRole] = useState('developer');

<Lib.Select
  dataList={jobs}
  valueKey="id"
  textKey="label"
  value={role}
  onValueChange={setRole}
  status="info"
  statusMessage={\`value prop: \${role}\`}
/>`,
    },
    {
      component: (
        <Lib.Select
          id="select-loading"
          dataList={loadingOptions}
          valueKey="id"
          textKey="label"
          status="loading"
          assistiveText="옵션을 불러오는 중입니다."
          disabled
        />
      ),
      description:
        '로딩/비활성화 상태 — status="loading" + assistiveText로 라이브 영역 안내',
      code: `<Lib.Select
  dataList={loadingOptions}
  valueKey="id"
  textKey="label"
  status="loading"
  assistiveText="옵션을 불러오는 중입니다."
  disabled
/>`,
    },
    {
      component: (
        <Lib.Select
          id="select-error"
          dataList={jobOptions}
          valueKey="id"
          textKey="label"
          status="error"
          statusMessage="필수 입력 항목입니다."
        />
      ),
      description: '에러 상태 — status="error"와 안내 메시지',
      code: `<Lib.Select
  dataList={jobs}
  valueKey="id"
  textKey="label"
  status="error"
  statusMessage="필수 입력 항목입니다."
/>`,
    },
    {
      component: (
        <Lib.Select
          id="select-empty"
          dataList={emptyOptions}
          status="empty"
          assistiveText="선택 가능한 항목이 비어 있습니다."
        />
      ),
      description:
        '빈 상태 — status="empty" 프리셋으로 항목 부재 안내 및 aria-live=assertive 적용',
      code: `<Lib.Select
  dataList={Lib.EasyList([])}
  status="empty"
  assistiveText="선택 가능한 항목이 비어 있습니다."
/>`,
    },
  ]
}
