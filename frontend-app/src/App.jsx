import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import NavigationConfig from './route/NavigationConfig';
import '../global.css';

export default function App() {
  return (
    <View className="flex-1 overflow-y-auto"
      style={Platform.OS === 'web' ? { height: '100vh' } : undefined}>
      <NavigationConfig />
      <StatusBar style="auto" />
    </View>
  );
}