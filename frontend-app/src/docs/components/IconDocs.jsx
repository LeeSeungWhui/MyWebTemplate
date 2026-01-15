import { View, Text } from 'react-native';
import { IconExamples } from '../examples/IconExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const IconDocs = () => {
  const examples = IconExamples();

  return (
    <DocSection
      title="3. 아이콘 (Icon)"
      description={(
        <View>
          <Text className="text-gray-600 mb-2">
            Icon 컴포넌트는 다양한 아이콘 세트를 통합해서 제공한다.
          </Text>
          <Text className="text-gray-600">
            prefix:name 형식으로 원하는 아이콘을 사용할 수 있다. (예: md:home, io:heart)
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

export default IconDocs;
