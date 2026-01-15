/**
 * 파일명: CheckboxDocs.jsx
 * 설명: 앱용 Checkbox 컴포넌트 문서
 * 작성자: Codex
 * 갱신일: 2025-02-19
 */
import { View, Text } from 'react-native';
import { CheckboxExamples } from '../examples/CheckboxExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const CheckboxDocs = () => {
  const examples = CheckboxExamples();

  return (
    <DocSection
      title="7. 체크박스 (Checkbox)"
      description={(
        <View className="space-y-2">
          <Text className="text-gray-700">Checkbox 컴포넌트는 checked/onChange 또는 dataObj/dataKey로 상태를 제어한다.</Text>
          <Text className="text-gray-700">name이 없으면 dataKey 또는 label을 name으로 사용한다.</Text>
          <View className="space-y-1">
            <Text className="text-sm text-gray-600">• label?: 체크박스 옆 텍스트</Text>
            <Text className="text-sm text-gray-600">• name?: 폼 이름</Text>
            <Text className="text-sm text-gray-600">• checked?: 제어 모드 상태</Text>
            <Text className="text-sm text-gray-600">• dataObj?/dataKey?: EasyObj 바인딩</Text>
            <Text className="text-sm text-gray-600">• color?: primary | HEX | rgb</Text>
            <Text className="text-sm text-gray-600">• disabled?: 비활성화</Text>
            <Text className="text-sm text-gray-600">• onChange?: change 이벤트</Text>
          </View>
        </View>
      )}
    >
      <View className="space-y-8">
        {examples.map((example, index) => (
          <View key={index} className="space-y-2">
            {example.component}
            <Text className="text-sm text-gray-600">{example.description}</Text>
            <CodeBlock code={example.code} />
          </View>
        ))}
      </View>
    </DocSection>
  );
};

export default CheckboxDocs;
