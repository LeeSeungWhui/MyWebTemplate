import { View, Text, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Icon } from '@/lib';

const CodeBlock = ({ code }) => {
    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(code);
        // 여기에 토스트 메시지 추가하면 좋을 것 같은데... 나중에? ㅋㅋ
    };

    return (
        <TouchableOpacity
            onPress={copyToClipboard}
            className="mt-2"
        >
            <View className="bg-gray-100 rounded-md p-4 flex-row items-center justify-between">
                <Text className="font-mono text-xs text-gray-800 flex-1">
                    {code}
                </Text>
                <View className="ml-2">
                    <Icon icon="md:content-copy" size="sm" color="#6B7280" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default CodeBlock; 