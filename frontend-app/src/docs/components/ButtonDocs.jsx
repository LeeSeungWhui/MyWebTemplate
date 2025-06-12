import { View, Text } from 'react-native';
import { ButtonExamples } from '../examples/ButtonExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const ButtonDocs = () => {
    const examples = ButtonExamples();

    return (
        <DocSection
            title="2. 버튼 (Button)"
            description={
                <View>
                    <Text className="text-gray-600 mb-2">
                        Button 컴포넌트는 다양한 스타일과 상태를 지원하는 기본 버튼입니다.
                    </Text>
                    <Text className="text-gray-600">
                        variant, size, disabled, loading 등의 속성을 통해 커스터마이징할 수 있습니다.
                    </Text>
                </View>
            }
        >
            {examples.map((example, index) => (
                <View key={index} className="mb-8">
                    <Text className="text-lg font-medium mb-2">
                        {example.title}
                    </Text>
                    <Text className="text-sm text-gray-600 mb-4">
                        {example.description}
                    </Text>
                    <View className="mb-4 bg-white p-4 rounded-md border border-gray-200">
                        {example.component}
                    </View>
                    <CodeBlock code={example.code} />
                </View>
            ))}
        </DocSection>
    );
};

export default ButtonDocs; 