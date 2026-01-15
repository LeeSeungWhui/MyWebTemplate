/**
 * 파일명: RadioboxExamples.jsx
 * 설명: 앱용 Radiobox 컴포넌트 예제
 * 작성자: Codex
 * 갱신일: 2025-02-19
 */
import { View, Text } from 'react-native';
import { useState } from 'react';
import * as Lib from '../../lib';

export const RadioboxExamples = () => {
  const dataObj = Lib.EasyObj({ role: 'developer' });
  const [role, setRole] = useState('designer');
  const setRoleChecked = (nextValue) => {
    setRole(nextValue);
  };

  return [
    {
      component: (
        <View className="space-y-2">
          <Lib.Radiobox
            label="디자이너"
            name="role"
            value="designer"
            dataObj={dataObj}
            dataKey="role"
          />
          <Lib.Radiobox
            label="개발자"
            name="role"
            value="developer"
            dataObj={dataObj}
            dataKey="role"
          />
          <Lib.Radiobox
            label="PM"
            name="role"
            value="pm"
            dataObj={dataObj}
            dataKey="role"
          />
        </View>
      ),
      description: 'name/dataKey를 공유해 하나만 선택되는 기본 라디오 패턴.',
      code: `const dataObj = EasyObj({ role: 'developer' });

<Radiobox label="디자이너" name="role" value="designer" dataObj={dataObj} dataKey="role" />
<Radiobox label="개발자" name="role" value="developer" dataObj={dataObj} dataKey="role" />
<Radiobox label="PM" name="role" value="pm" dataObj={dataObj} dataKey="role" />`,
    },
    {
      component: (
        <View className="space-y-2">
          <Text className="text-sm font-semibold text-gray-800">컨트롤드 모드</Text>
          <Lib.Radiobox
            label="디자이너"
            name="controlled-role"
            value="designer"
            checked={role === 'designer'}
            onValueChange={setRole}
          />
          <Lib.Radiobox
            label="개발자"
            name="controlled-role"
            value="developer"
            checked={role === 'developer'}
            onValueChange={setRoleChecked}
          />
          <Lib.Radiobox
            label="PM"
            name="controlled-role"
            value="pm"
            checked={role === 'pm'}
            onValueChange={setRoleChecked}
          />
          <Text className="text-xs text-gray-600">현재 선택: {role}</Text>
        </View>
      ),
      description: 'checked/onValueChange로 외부 상태를 제어하는 컨트롤드 패턴.',
      code: `const [role, setRole] = useState('designer');

<View className="space-y-2">
  <Radiobox
    label="디자이너"
    name="controlled-role"
    value="designer"
    checked={role === 'designer'}
    onValueChange={setRole}
  />
  <Radiobox
    label="개발자"
    name="controlled-role"
    value="developer"
    checked={role === 'developer'}
    onValueChange={setRole}
  />
  <Radiobox
    label="PM"
    name="controlled-role"
    value="pm"
    checked={role === 'pm'}
    onValueChange={setRole}
  />
</View>`,
    },
  ];
};
