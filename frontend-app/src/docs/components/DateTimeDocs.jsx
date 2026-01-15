/**
 * 파일명: DateTimeDocs.jsx
 * 설명: 앱용 Date/Time 입력 문서
 * 작성자: Codex
 * 갱신일: 2025-02-19
 */
import { View, Text } from 'react-native';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { DateInputExamples } from '../examples/DateInputExamples';
import { TimeInputExamples } from '../examples/TimeInputExamples';

const DateTimeDocs = () => {
  const dateExamples = DateInputExamples();
  const timeExamples = TimeInputExamples();

  return (
    <DocSection
      title="13. 날짜/시간 (Date/Time)"
      description={(
        <View className="space-y-1">
          <Text className="text-gray-700">네이티브 Date/Time 피커 기반 입력. value/onValueChange 또는 dataObj/dataKey로 제어한다.</Text>
          <Text className="text-sm text-gray-600">• value?/defaultValue?: 제어/초기 값 (date: YYYY-MM-DD, time: HH:MM)</Text>
          <Text className="text-sm text-gray-600">• dataObj?/dataKey?: EasyObj 바인딩</Text>
          <Text className="text-sm text-gray-600">• min/max(date 전용): 선택 가능 범위</Text>
          <Text className="text-sm text-gray-600">• disabled?/readOnly?: 입력/선택 막기</Text>
          <Text className="text-sm text-gray-600">• onValueChange?/onChange?: 값 변경 콜백</Text>
        </View>
      )}
    >
      <View className="mb-8 space-y-2">
        <Text className="text-lg font-medium">날짜</Text>
        {dateExamples.map((example, index) => (
          <View key={index} className="space-y-2">
            <View className="bg-white p-4 rounded-md border border-gray-200">
              {example.component}
            </View>
            <Text className="text-sm text-gray-600">{example.description}</Text>
            <CodeBlock code={example.code} />
          </View>
        ))}
      </View>

      <View className="space-y-2">
        <Text className="text-lg font-medium">시간</Text>
        {timeExamples.map((example, index) => (
          <View key={index} className="space-y-2">
            <View className="bg-white p-4 rounded-md border border-gray-200">
              {example.component}
            </View>
            <Text className="text-sm text-gray-600">{example.description}</Text>
            <CodeBlock code={example.code} />
          </View>
        ))}
      </View>
    </DocSection>
  );
};

export default DateTimeDocs;
