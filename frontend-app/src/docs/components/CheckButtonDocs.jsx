/**
 * 파일명: CheckButtonDocs.jsx
 * 설명: 앱용 CheckButton 컴포넌트 문서
 * 작성자: Codex
 * 갱신일: 2025-02-19
 */
import { View, Text } from 'react-native';
import { CheckButtonExamples } from '../examples/CheckButtonExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const CheckButtonDocs = () => {
  const examples = CheckButtonExamples();

  return (
    <DocSection
      title="8. 체크 버튼 (CheckButton)"
      description={(
        <View className="space-y-1">
          <Text className="text-gray-700">토글 버튼 형태의 체크 컴포넌트. checked/onValueChange 또는 dataObj/dataKey로 제어한다.</Text>
          <Text className="text-sm text-gray-600">• children: 버튼 라벨</Text>
          <Text className="text-sm text-gray-600">• name?: 폼 이름</Text>
          <Text className="text-sm text-gray-600">• checked?: 제어 모드 값</Text>
          <Text className="text-sm text-gray-600">• dataObj?/dataKey?: EasyObj 바인딩</Text>
          <Text className="text-sm text-gray-600">• color?: primary | HEX | rgb</Text>
          <Text className="text-sm text-gray-600">• disabled?: 비활성화</Text>
          <Text className="text-sm text-gray-600">• onValueChange?/onChange?: 이벤트 핸들러</Text>
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

export default CheckButtonDocs;
