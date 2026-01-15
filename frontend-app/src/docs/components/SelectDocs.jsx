import { View, Text } from 'react-native';
import { SelectExamples } from '../examples/SelectExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const SelectDocs = () => {
  const examples = SelectExamples();

  return (
    <DocSection
      title="6. 선택 (Select)"
      description={(
        <View>
          <Text className="text-gray-600 mb-2">
            Select는 RN 기본 Picker 기반의 단일 선택 컴포넌트다. EasyList의 selected 플래그나 value prop으로 선택 상태를 제어한다.
          </Text>
          <Text className="text-gray-600">
            dataList + valueKey/textKey만 넘기면 되고, status는 default/success/warning/error/disabled 프리셋을 쓴다. value/onValueChange로 컨트롤드 모드도 가능하다.
          </Text>
        </View>
      )}
    >
      <View className="mb-8">
        <Text className="text-lg font-medium mb-2">
          기본 사용법
        </Text>
        <View className="mb-4 bg-white p-4 rounded-md border border-gray-200">
          {examples[0]?.component}
        </View>
        <Text className="text-sm text-gray-600 mb-4">
          {examples[0]?.description}
        </Text>
        <CodeBlock code={examples[0]?.code || ''} />
      </View>

      <View className="mb-8">
        <Text className="text-lg font-medium mb-2">
          컨트롤드 모드
        </Text>
        <View className="mb-4 bg-white p-4 rounded-md border border-gray-200">
          {examples[1]?.component}
        </View>
        <Text className="text-sm text-gray-600 mb-4">
          {examples[1]?.description}
        </Text>
        <CodeBlock code={examples[1]?.code || ''} />
      </View>

      <View className="mb-8">
        <Text className="text-lg font-medium mb-2">
          상태(로딩/에러/빈)
        </Text>
        <View className="mb-4 bg-white p-4 rounded-md border border-gray-200">
          {examples[2]?.component}
        </View>
        <Text className="text-sm text-gray-600 mb-4">
          {examples[2]?.description}
        </Text>
        <CodeBlock code={examples[2]?.code || ''} />
      </View>
    </DocSection>
  );
};

export default SelectDocs;
