/**
 * 파일명: NumberInputDocs.jsx
 * 설명: 앱용 NumberInput 컴포넌트 문서
 * 작성자: Codex
 * 갱신일: 2025-02-19
 */
import { View, Text } from 'react-native';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { NumberInputExamples } from '../examples/NumberInputExamples';

const NumberInputDocs = () => {
  const examples = NumberInputExamples();

  return (
    <DocSection
      title="12. 숫자 입력 (NumberInput)"
      description={(
        <View className="space-y-1">
          <Text className="text-gray-700">스텝 버튼이 있는 숫자 입력. value/onValueChange 또는 dataObj/dataKey 바인딩을 지원한다.</Text>
          <Text className="text-sm text-gray-600">• value?/defaultValue?: 제어/초기 값</Text>
          <Text className="text-sm text-gray-600">• min?/max?: 허용 범위</Text>
          <Text className="text-sm text-gray-600">• step?: 증감 단위 (기본 1)</Text>
          <Text className="text-sm text-gray-600">• dataObj?/dataKey?: EasyObj 바인딩</Text>
          <Text className="text-sm text-gray-600">• disabled?/readOnly?: 입력/증감 비활성화</Text>
          <Text className="text-sm text-gray-600">• onValueChange?/onChange?: 값 변경 핸들러</Text>
        </View>
      )}
    >
      {examples.map((example, index) => (
        <View key={index} className="mb-8 space-y-2">
          <Text className="text-lg font-medium">{example.title || `예제 ${index + 1}`}</Text>
          <View className="bg-white p-4 rounded-md border border-gray-200">
            {example.component}
          </View>
          <Text className="text-sm text-gray-600">{example.description}</Text>
          <CodeBlock code={example.code} />
        </View>
      ))}
    </DocSection>
  );
};

export default NumberInputDocs;
