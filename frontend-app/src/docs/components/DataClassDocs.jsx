import { View, Text } from 'react-native';
import { DataClassExamples } from '../examples/DataClassExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const DataClassDocs = () => {
  const examples = DataClassExamples();

  return (
    <DocSection
      title="1. 데이터 클래스"
      description={(
        <View>
          <Text className="text-gray-600 mb-2">
            EasyObj와 EasyList는 상태 관리를 쉽게 해주는 데이터 클래스야.
          </Text>
          <Text className="text-gray-600">
            Proxy로 객체/배열 변경을 감지해서 리렌더링까지 알아서 처리해준다.
          </Text>
        </View>
      )}
    >
      {examples.map((example, index) => (
        <View key={index} className="mb-8">
          {example.title ? (
            <Text className="text-lg font-medium mb-2">
              {example.title}
            </Text>
          ) : null}
          {example.description ? (
            <Text className="text-sm text-gray-600 mb-4">
              {example.description}
            </Text>
          ) : null}
          <View className="mb-4 bg-white p-4 rounded-md border border-gray-200">
            {example.component}
          </View>
          {example.code ? <CodeBlock code={example.code} /> : null}
        </View>
      ))}
    </DocSection>
  );
};

export default DataClassDocs;
