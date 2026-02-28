import { View } from 'react-native';

const BasicLayout = ({ children }) => {
    return (
        <View className="flex-1 bg-gray-100">
            {/* 여기에 헤더나 푸터 추가하면 됨 */}
            <View className="flex-1">
                {children}
            </View>
        </View>
    );
};

export default BasicLayout;