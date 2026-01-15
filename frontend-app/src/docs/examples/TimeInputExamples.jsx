/**
 * 파일명: TimeInputExamples.jsx
 * 설명: 앱용 TimeInput 컴포넌트 예제
 * 작성자: Codex
 * 갱신일: 2025-02-19
 */
import { View, Text } from 'react-native';
import * as Lib from '../../lib';

export const TimeInputExamples = () => {
  const dataObj = Lib.EasyObj({ time: '' });

  return [
    {
      component: (
        <View className="space-y-2">
          <Lib.TimeInput dataObj={dataObj} dataKey="time" />
          <Text className="text-xs text-gray-600">dataObj.time = {String(dataObj.time)}</Text>
        </View>
      ),
      description: '기본: dataObj 바인딩',
      code: `const dataObj = EasyObj({ time: '' });

<TimeInput dataObj={dataObj} dataKey="time" />`,
    },
    {
      component: (
        <Lib.TimeInput defaultValue="09:30" />
      ),
      description: 'defaultValue 사용 예',
      code: `<TimeInput defaultValue="09:30" />`,
    },
  ];
};
