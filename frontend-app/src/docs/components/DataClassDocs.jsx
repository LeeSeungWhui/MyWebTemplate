import { View, Text } from 'react-native';
import { DataClassExamples } from '../examples/DataClassExamples';
import DocSection from '../shared/DocSection';

const DataClassDocs = () => {
    const examples = DataClassExamples();

    return (
        <DocSection
            title="1. 데이터 클래스"
            description={
                <View>
                    <Text className="text-gray-600 mb-2">
                        EasyObj와 EasyList는 상태 관리를 쉽게 해주는 데이터 클래스입니다.
                    </Text>
                    <Text className="text-gray-600">
                        Proxy를 사용하여 객체/배열의 변경을 감지하고 자동으로 리렌더링합니다.
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
                    {/* CodeBlock은 나중에 구현 */}
                </View>
            ))}
        </DocSection>
    );
};

export default DataClassDocs; 