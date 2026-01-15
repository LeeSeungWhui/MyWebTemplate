import { View, Text } from 'react-native';
import { TextareaExamples } from '../examples/TextareaExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const TextareaDocs = () => {
  const examples = TextareaExamples();

  return (
    <DocSection
      title="5. 텍스트 영역 (Textarea)"
      description={(
        <View>
          <Text className="text-gray-600 mb-2">
            Textarea는 여러 줄 텍스트를 입력받는 컴포넌트다.
          </Text>
          <Text className="text-gray-600">
            dataObj/dataKey 바인딩과 컨트롤드 모드를 모두 지원하고, rows, error, readOnly, disabled 같은 기본 옵션을 제공한다.
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

export default TextareaDocs;

