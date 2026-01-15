/**
 * 파일명: DateInputExamples.jsx
 * 설명: 앱용 DateInput 컴포넌트 예제
 * 작성자: Codex
 * 갱신일: 2025-02-19
 */
import { View, Text } from 'react-native';
import * as Lib from '../../lib';

export const DateInputExamples = () => {
  const dataObj = Lib.EasyObj({ date: '' });

  return [
    {
      component: (
        <View className="space-y-2">
          <Lib.DateInput dataObj={dataObj} dataKey="date" />
          <Text className="text-xs text-gray-600">dataObj.date = {String(dataObj.date)}</Text>
        </View>
      ),
      description: '기본: dataObj 바인딩',
      code: `const dataObj = EasyObj({ date: '' });

<DateInput dataObj={dataObj} dataKey="date" />`,
    },
    {
      component: (
        <Lib.DateInput defaultValue="2025-01-01" min="2025-01-01" max="2025-12-31" />
      ),
      description: 'defaultValue + min/max',
      code: `<DateInput defaultValue="2025-01-01" min="2025-01-01" max="2025-12-31" />`,
    },
  ];
};
