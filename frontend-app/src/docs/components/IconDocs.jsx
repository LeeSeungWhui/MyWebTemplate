import { View, Text } from 'react-native';
import { IconExamples } from '../examples/IconExamples';
import DocSection from '../shared/DocSection';

const IconDocs = () => {
    const examples = IconExamples();

    return (
        <DocSection
            title="3. 아이콘 (Icon)"
            description={
                <View>
                    <Text className="text-gray-600 mb-2">
                        Icon 컴포넌트는 다양한 아이콘 세트를 통합하여 제공합니다.
                    </Text>
                    <Text className="text-gray-600">
                        prefix:name 형식으로 원하는 아이콘을 사용할 수 있습니다. (예: md:home, io:heart)
                    </Text>
                </View>
            }
        >
            {examples.map((example, index) => (
                <View key={index} className="mb-8">
                    <View className="mb-4">
                        {example.component}
                    </View>
                    <Text className="text-sm text-gray-600 mb-2">
                        {example.description}
                    </Text>
                </View>
            ))}
        </DocSection>
    );
};

export default IconDocs; 