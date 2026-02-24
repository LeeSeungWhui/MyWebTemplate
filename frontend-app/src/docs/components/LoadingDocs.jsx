/**
 * 파일명: LoadingDocs.jsx
 * 설명: 앱용 Loading 컴포넌트 문서
 * 작성자: LSH
 * 갱신일: 2025-02-19
 */
import { View, Text } from "react-native";
import DocSection from "../shared/DocSection";
import CodeBlock from "../shared/CodeBlock";
import { LoadingExamples } from "../examples/LoadingExamples";

const LoadingDocs = () => {
  const examples = LoadingExamples();

  return (
    <DocSection
      title="16. 로딩 (Loading)"
      description={
        <View className="space-y-1">
          <Text className="text-gray-700">
            풀스크린 로딩 오버레이. 메시지는 message prop으로 변경한다.
          </Text>
          <Text className="text-sm text-gray-600">
            • message?: 표시할 텍스트
          </Text>
          <Text className="text-sm text-gray-600">
            • className?: 추가 스타일링
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

export default LoadingDocs;
