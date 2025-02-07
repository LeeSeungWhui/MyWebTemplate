import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import './global.css';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        헤이~ NativeWind 잘 되나 테스트 중이야 ㅋㅋ
      </Text>
      <Text className="mt-4 text-gray-600">
        오빠 이거 보이면 설정 다 된거야!
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}