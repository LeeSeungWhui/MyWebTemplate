/**
 * 파일명: ConfirmDocs.jsx
 * 설명: 앱용 Confirm(global UI) 문서
 * 작성자: LSH
 * 갱신일: 2025-02-19
 */
import { View, Text } from "react-native";
import DocSection from "../shared/DocSection";
import CodeBlock from "../shared/CodeBlock";
import { ConfirmExamples } from "../examples/ConfirmExamples";

const ConfirmDocs = () => {
  const examples = ConfirmExamples();

  return (
    <DocSection
      title="18. 확인 (Confirm)"
      description={
        <View className="space-y-1">
          <Text className="text-gray-700">
            전역 스토어(useGlobalUi)의 showConfirm로 확인 모달을 띄운다.
            Promise를 반환하여 확인/취소를 await 할 수 있다.
          </Text>
          <Text className="text-sm text-gray-600">
            • showConfirm(message, opts?):
            title/type/confirmText/cancelText/onConfirm/onCancel 지원
          </Text>
          <Text className="text-sm text-gray-600">
            • hideConfirm(result?): 수동 닫기
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

export default ConfirmDocs;
