import { View, Text } from 'react-native';
import { useState } from 'react';
import * as Lib from '../../lib';

export const SelectExamples = () => {
  const jobOptions = Lib.EasyList([
    { id: '', label: '직무를 선택하세요', placeholder: true, selected: true },
    { id: 'designer', label: '디자이너' },
    { id: 'developer', label: '개발자' },
    { id: 'pm', label: '프로덕트 매니저' },
  ]);

  const emptyOptions = Lib.EasyList([]);

  const getSelectedJobId = () => {
    const selected = jobOptions.find((item) => item.selected);
    return selected ? String(selected.id) : '';
  };

  const ControlledSelect = ({ jobs }) => {
    const [role, setRole] = useState('developer');
    return (
      <View className="space-y-2">
        <Lib.Select
          dataList={jobs}
          valueKey="id"
          textKey="label"
          value={role}
          onValueChange={setRole}
          status="success"
          statusMessage={`value prop: ${role}`}
        />
        <Text className="text-xs text-gray-600">
          value prop에 따라 선택 상태가 결정되고, dataList.selected는 자동 갱신된다.
        </Text>
      </View>
    );
  };

  return [
    {
      title: 'EasyList 모드',
      component: (
        <View className="space-y-2">
          <Lib.Select
            dataList={jobOptions}
            valueKey="id"
            textKey="label"
            status="success"
            statusMessage="dataList의 selected 플래그와 동기화된다."
          />
          <Text className="text-xs text-gray-600">
            현재 선택된 id: {getSelectedJobId()}
          </Text>
        </View>
      ),
      description: 'EasyList 내부의 selected만으로 선택 상태를 관리하는 기본 Select 예시.',
      code: `const jobs = EasyList([
  { id: '', label: '직무를 선택하세요', placeholder: true, selected: true },
  { id: 'designer', label: '디자이너' },
  { id: 'developer', label: '개발자' },
  { id: 'pm', label: '프로덕트 매니저' },
]);

<Select
  dataList={jobs}
  valueKey="id"
  textKey="label"
  status="success"
  statusMessage="dataList의 selected 플래그와 동기화된다."
/>`,
    },
    {
      title: '컨트롤드 모드',
      component: (
        <ControlledSelect jobs={jobOptions} />
      ),
      description: 'value prop을 사용해 외부 상태와 맞춰 쓰는 컨트롤드 패턴.',
      code: `const [role, setRole] = useState('developer');

<Select
  dataList={jobs}
  valueKey="id"
  textKey="label"
  value={role}
  onValueChange={setRole}
  status="success"
  statusMessage={\`value prop: \${role}\`}
/>`,
    },
    {
      title: '로딩/에러/빈 상태',
      component: (
        <View className="space-y-4">
          <View>
            <Lib.Select
              dataList={jobOptions}
              valueKey="id"
              textKey="label"
              status="disabled"
              statusMessage="옵션을 불러오는 중이다."
              disabled
            />
          </View>
          <View>
            <Lib.Select
              dataList={jobOptions}
              valueKey="id"
              textKey="label"
              status="error"
              statusMessage="필수 입력 항목이다."
            />
          </View>
          <View>
            <Lib.Select
              dataList={emptyOptions}
              status="default"
              statusMessage="선택 가능한 항목이 없다."
            />
          </View>
        </View>
      ),
      description: '비활성(loading 대용)/에러/빈 상태에서 status + statusMessage로 피드백을 주는 패턴.',
      code: `<Select
  dataList={jobs}
  valueKey="id"
  textKey="label"
  status="disabled"
  statusMessage="옵션을 불러오는 중이다."
  disabled
/>
<Select
  dataList={jobs}
  valueKey="id"
  textKey="label"
  status="error"
  statusMessage="필수 입력 항목이다."
/>
<Select
  dataList={EasyList([])}
  status="empty"
  statusMessage="선택 가능한 항목이 없다."
/>`,
    },
  ];
};
