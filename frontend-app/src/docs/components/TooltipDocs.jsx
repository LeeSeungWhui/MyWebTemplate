/**
 * 파일명: TooltipDocs.jsx
 * 설명: 앱용 Tooltip 문서
 * 작성자: LSH
 * 갱신일: 2025-02-19
 */
import { View, Text } from "react-native";
import DocSection from "../shared/DocSection";
import CodeBlock from "../shared/CodeBlock";
import { TooltipExamples } from "../examples/TooltipExamples";

const TooltipDocs = () => {
  const examples = TooltipExamples();

  return (
    <DocSection
      title="20. 툴팁 (Tooltip)"
      description={
        <View className="space-y-1">
          <Text className="text-gray-700">
            hover/focus/click 트리거에 반응하는 간단 툴팁.
          </Text>
          <Text className="text-sm text-gray-600">• content: 툴팁 내용</Text>
          <Text className="text-sm text-gray-600">
            • placement?: top | bottom | left | right
          </Text>
          <Text className="text-sm text-gray-600">
            • trigger?: hover | click
          </Text>
          <Text className="text-sm text-gray-600">
            • delay?: 표시 지연(ms), disabled?: 비활성
          </Text>
          <Text className="text-sm text-gray-600">
            • textDirection?: lr | tb
          </Text>
        </View>
      }
    >
      {examples.map((example, index) => (
        <View key={index} className="mb-8 space-y-2">
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

export default TooltipDocs;
