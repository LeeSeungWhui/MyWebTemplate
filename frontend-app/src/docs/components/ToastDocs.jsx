/**
 * 파일명: ToastDocs.jsx
 * 설명: 앱용 Toast(global UI) 문서
 * 작성자: LSH
 * 갱신일: 2025-02-19
 */
import { View, Text } from "react-native";
import DocSection from "../shared/DocSection";
import CodeBlock from "../shared/CodeBlock";
import { ToastExamples } from "../examples/ToastExamples";

const ToastDocs = () => {
  const examples = ToastExamples();

  return (
    <DocSection
      title="19. 토스트 (Toast)"
      description={
        <View className="space-y-1">
          <Text className="text-gray-700">
            전역 스토어(useGlobalUi)의 showToast로 짧은 배너 알림을 띄운다.
          </Text>
          <Text className="text-sm text-gray-600">
            • showToast(message, opts?): type/position/duration 지정
          </Text>
          <Text className="text-sm text-gray-600">
            • hideToast(): 수동 닫기 (duration=Infinity 시 사용)
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

export default ToastDocs;
