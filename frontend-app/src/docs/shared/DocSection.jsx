import { View, Text } from 'react-native';

const DocSection = ({ title, description, children }) => {
    return (
        <View className="mb-8">
            <Text className="text-2xl font-bold mb-4">
                {title}
            </Text>

            {description && (
                <View className="mb-6 p-4 bg-blue-50 rounded-lg">
                    {description}
                </View>
            )}

            {children}
        </View>
    );
};

export default DocSection; 