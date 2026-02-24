/**
 * 파일명: SwitchDocs.jsx
 * 설명: 앱용 Switch 컴포넌트 문서
 * 작성자: LSH
 * 갱신일: 2025-02-19
 */
import { View, Text } from "react-native";
import { SwitchExamples } from "../examples/SwitchExamples";
import DocSection from "../shared/DocSection";
import CodeBlock from "../shared/CodeBlock";

const SwitchDocs = () => {
  const examples = SwitchExamples();

  return (
    <DocSection
      title="11. 스위치 (Switch)"
      description={
        <View className="space-y-1">
          <Text className="text-gray-700">
            토글 스위치. checked/onValueChange 또는 dataObj/dataKey로 제어하며
            상태 플래그를 dataObj.checked에도 기록한다.
          </Text>
          <Text className="text-sm text-gray-600">
            • label?: 스위치 옆 텍스트
          </Text>
          <Text className="text-sm text-gray-600">• name?: 폼 이름</Text>
          <Text className="text-sm text-gray-600">
            • checked?/defaultChecked?: 제어/초기 상태
          </Text>
          <Text className="text-sm text-gray-600">
            • dataObj?/dataKey?: EasyObj 바인딩
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

export default SwitchDocs;
