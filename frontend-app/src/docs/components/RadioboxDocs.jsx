/**
 * 파일명: RadioboxDocs.jsx
 * 설명: 앱용 Radiobox 컴포넌트 문서
 * 작성자: LSH
 * 갱신일: 2025-02-19
 */
import { View, Text } from "react-native";
import { RadioboxExamples } from "../examples/RadioboxExamples";
import DocSection from "../shared/DocSection";
import CodeBlock from "../shared/CodeBlock";

const RadioboxDocs = () => {
  const examples = RadioboxExamples();

  return (
    <DocSection
      title="9. 라디오 박스 (Radiobox)"
      description={
        <View className="space-y-1">
          <Text className="text-gray-700">
            단일 선택 라디오 버튼. checked/onValueChange 또는 dataObj/dataKey로
            제어한다.
          </Text>
          <Text className="text-sm text-gray-600">• label: 라벨 텍스트</Text>
          <Text className="text-sm text-gray-600">• name?: 그룹 이름</Text>
          <Text className="text-sm text-gray-600">• value: 항목 값</Text>
          <Text className="text-sm text-gray-600">
            • checked?/defaultChecked?: 제어/비제어 초기 상태
          </Text>
          <Text className="text-sm text-gray-600">
            • dataObj?/dataKey?: EasyObj 바인딩
          </Text>
          <Text className="text-sm text-gray-600">
            • color?: primary | HEX | rgb
          </Text>
          <Text className="text-sm text-gray-600">• disabled?: 비활성화</Text>
          <Text className="text-sm text-gray-600">
            • onValueChange?/onChange?: 이벤트 핸들러
          </Text>
        </View>
      }
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

export default RadioboxDocs;
