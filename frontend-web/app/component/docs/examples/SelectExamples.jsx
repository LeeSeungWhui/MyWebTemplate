/**
 * 파일명: SelectExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-11-05
 * 설명: Select 컴포넌트 바운드/컨트롤드/상태 시나리오 예제
 */
import { useState } from 'react'
import * as Lib from '@/app/lib'

export const SelectExamples = () => {
  const form = Lib.EasyObj({
    profile: {
      job: 'designer',
    },
  })
  const jobOptions = Lib.EasyList([
    { id: '', label: '직무를 선택하세요', placeholder: true },
    { id: 'designer', label: '디자이너' },
    { id: 'developer', label: '개발자' },
    { id: 'pm', label: '프로덕트 매니저' },
  ])

  const [role, setRole] = useState('developer')

  const loadingOptions = Lib.EasyList([
    { id: '', label: '불러오는 중', placeholder: true },
  ])

  return [
    {
      component: (
        <div className="space-y-2">
          <Lib.Select
            id="select-bound"
            dataObj={form.profile}
            dataKey="job"
            dataList={jobOptions}
            valueKey="id"
            textKey="label"
            status="success"
            statusMessage="EasyObj 값과 동기화되었습니다."
          />
          <dl className="text-xs text-gray-600">
            <dt className="font-semibold">현재 form.profile.job</dt>
            <dd>{String(form.profile.job)}</dd>
          </dl>
        </div>
      ),
      description:
        'EasyObj 바운드 모드 — dataObj/dataKey로 EasyObj 값과 즉시 동기화',
      code: `const form = Lib.EasyObj({ profile: { job: 'designer' } });
const jobs = Lib.EasyList([
  { id: '', label: '직무를 선택하세요', placeholder: true },
  { id: 'designer', label: '디자이너' },
  { id: 'developer', label: '개발자' },
  { id: 'pm', label: '프로덕트 매니저' },
]);

<Lib.Select
  dataObj={form.profile}
  dataKey="job"
  dataList={jobs}
  valueKey="id"
  textKey="label"
  status="success"
  statusMessage="EasyObj 값과 동기화되었습니다."
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
        '컨트롤드 모드 — value/onValueChange로 외부 상태와 동기화',
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
  ]
}
