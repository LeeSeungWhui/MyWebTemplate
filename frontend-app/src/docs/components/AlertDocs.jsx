/**
 * 파일명: AlertDocs.jsx
 * 설명: 앱용 Alert(global UI) 문서
 * 작성자: LSH
 * 갱신일: 2025-02-19
 */
import { View, Text } from "react-native";
import DocSection from "../shared/DocSection";
import CodeBlock from "../shared/CodeBlock";
import { AlertExamples } from "../examples/AlertExamples";

const AlertDocs = () => {
  const examples = AlertExamples();

  return (
    <DocSection
      title="17. 알림 (Alert)"
      description={
        <View className="space-y-1">
          <Text className="text-gray-700">
            전역 스토어(useGlobalUi)의 showAlert로 간단 알림 오버레이를 띄운다.
          </Text>
          <Text className="text-sm text-gray-600">
            • showAlert(message, opts?): message와 title/type/onClick 설정
          </Text>
          <Text className="text-sm text-gray-600">
            • hideAlert(): 수동 닫기
          </Text>
          <Text className="text-sm text-gray-600">
            • isLoading/setLoading 등과 함께 글로벌 UI 묶음
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

export default AlertDocs;
