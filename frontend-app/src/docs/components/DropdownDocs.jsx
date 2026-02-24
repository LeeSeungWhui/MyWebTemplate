/**
 * 파일명: DropdownDocs.jsx
 * 설명: 앱용 Dropdown 컴포넌트 문서
 * 작성자: LSH
 * 갱신일: 2025-02-19
 */
import { View, Text } from "react-native";
import DocSection from "../shared/DocSection";
import CodeBlock from "../shared/CodeBlock";
import { DropdownExamples } from "../examples/DropdownExamples";

const DropdownDocs = () => {
  const examples = DropdownExamples();

  return (
    <DocSection
      title="15. 드롭다운 (Dropdown)"
      description={
        <View className="space-y-1">
          <Text className="text-gray-700">
            간단한 드롭다운. value/onValueChange 또는 dataObj/dataKey로 제어하며
            dataList.selected도 함께 갱신한다.
          </Text>
          <Text className="text-sm text-gray-600">
            • dataList + valueKey/textKey: 옵션 목록
          </Text>
          <Text className="text-sm text-gray-600">
            • placeholder: 버튼 표시 텍스트
          </Text>
          <Text className="text-sm text-gray-600">• multi?: 다중 선택</Text>
          <Text className="text-sm text-gray-600">
            • closeOnSelect?: 선택 후 닫기 여부(단일 기본 true, 다중 기본 false)
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

export default DropdownDocs;
