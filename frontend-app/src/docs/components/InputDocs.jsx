import { View, Text } from 'react-native';
import { InputExamples } from '../examples/InputExamples';
import DocSection from '../shared/DocSection';

const InputDocs = () => {
    const examples = InputExamples();

    return (
        <DocSection
            title="4. 입력 필드 (Input)"
            description={
                <View>
                    <Text className="text-gray-600 mb-2">
                        Input 컴포넌트는 다양한 형태의 입력을 지원하는 기본 입력 필드입니다.
                    </Text>
                    <Text className="text-gray-600">
                        마스크, 필터, 숫자 입력 제한 등 다양한 기능을 제공합니다.
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

export default InputDocs; 