import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Main = () => {
    const navigation = useNavigation();

    return (
        <View className="flex-1 items-center justify-center p-4">
            <Text className="text-2xl font-bold mb-8">
                MyApp Template
            </Text>

            <View className="space-y-4 w-full max-w-xs">
                <TouchableOpacity
                    className="bg-blue-500 p-4 rounded-lg"
                    onPress={() => navigation.navigate('login')}
                >
                    <Text className="text-white text-center font-semibold">
                        로그인하러 가기
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-gray-200 p-4 rounded-lg"
                    onPress={() => navigation.navigate('component')}
                >
                    <Text className="text-gray-700 text-center font-semibold">
                        컴포넌트 구경하기
                    </Text>
                </TouchableOpacity>
            </View>

            <Text className="mt-8 text-gray-500 text-center">
                이거 보이면{'\n'}
                라우팅이랑 NativeWind 다 되는거임
            </Text>
        </View>
    );
};

export default Main; 