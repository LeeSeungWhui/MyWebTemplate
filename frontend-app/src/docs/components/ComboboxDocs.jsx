/**
 * 파일명: ComboboxDocs.jsx
 * 설명: 앱용 Combobox 컴포넌트 문서
 * 작성자: LSH
 * 갱신일: 2025-02-19
 */
import { View, Text } from "react-native";
import DocSection from "../shared/DocSection";
import CodeBlock from "../shared/CodeBlock";
import { ComboboxExamples } from "../examples/ComboboxExamples";

const ComboboxDocs = () => {
  const examples = ComboboxExamples();

  return (
    <DocSection
      title="14. 콤보박스 (Combobox)"
      description={
        <View className="space-y-1">
          <Text className="text-gray-700">
            검색 가능한 단일/다중 선택 컴포넌트. value/onValueChange 또는
            dataObj/dataKey로 제어한다.
          </Text>
          <Text className="text-sm text-gray-600">
            • dataList + valueKey/textKey: 옵션 목록
          </Text>
          <Text className="text-sm text-gray-600">
            • placeholder: 버튼 표시 텍스트
          </Text>
          <Text className="text-sm text-gray-600">
            • filterable?: 검색 허용 여부
          </Text>
          <Text className="text-sm text-gray-600">
            • multi?: 다중 선택 (체크 토글)
          </Text>
          <Text className="text-sm text-gray-600">
            • onValueChange?/onChange?: 값 변경 콜백
          </Text>
          <Text className="text-sm text-gray-600">• disabled?: 비활성화</Text>
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

export default ComboboxDocs;
