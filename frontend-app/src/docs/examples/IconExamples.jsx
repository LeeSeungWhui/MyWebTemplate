import { View, Text, Linking, TouchableOpacity } from 'react-native';
import * as Lib from '../../lib';

const iconSetUrls = {
    ai: 'https://oblador.github.io/react-native-vector-icons/#antdesign',
    fi: 'https://oblador.github.io/react-native-vector-icons/#feather',
    fa: 'https://oblador.github.io/react-native-vector-icons/#fontawesome',
    io: 'https://oblador.github.io/react-native-vector-icons/#ionicons',
    md: 'https://oblador.github.io/react-native-vector-icons/#materialicons',
    mc: 'https://oblador.github.io/react-native-vector-icons/#materialcommunityicons',
    oc: 'https://oblador.github.io/react-native-vector-icons/#octicons',
    si: 'https://oblador.github.io/react-native-vector-icons/#simplelineicons'
};

export const IconExamples = () => {
    return [
        {
            title: "아이콘 세트",
            component: (
                <View className="flex-row flex-wrap gap-4">
                    <Lib.Icon icon="md:favorite" size="lg" color="#EF4444" />
                    <Lib.Icon icon="io:heart" size="lg" color="#3B82F6" />
                    <Lib.Icon icon="ai:star" size="lg" color="#F59E0B" />
                    <Lib.Icon icon="fi:check-circle" size="lg" color="#10B981" />
                </View>
            ),
            description: "다양한 아이콘 세트를 지원합니다.",
            code: `<Icon icon="md:favorite" size="lg" color="#EF4444" />
<Icon icon="io:heart" size="lg" color="#3B82F6" />
<Icon icon="ai:star" size="lg" color="#F59E0B" />
<Icon icon="fi:check-circle" size="lg" color="#10B981" />`
        },
        {
            title: "아이콘 크기",
            component: (
                <View className="flex-row flex-wrap gap-4 items-center">
                    <Lib.Icon icon="md:bookmark" size="sm" />
                    <Lib.Icon icon="md:bookmark" size="md" />
                    <Lib.Icon icon="md:bookmark" size="lg" />
                    <Lib.Icon icon="md:bookmark" size="xl" />
                </View>
            ),
            description: "sm, md, lg, xl 등 크기를 지정할 수 있습니다.",
            code: `<Icon icon="md:bookmark" size="sm" />
<Icon icon="md:bookmark" size="md" />
<Icon icon="md:bookmark" size="lg" />
<Icon icon="md:bookmark" size="xl" />`
        },
        {
            title: "아이콘 목록",
            component: (
                <View className="space-y-2">
                    <Text className="text-gray-600 mb-2">아이콘 목록 확인하기:</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {Object.entries({
                            ai: 'Ant Design',
                            fi: 'Feather',
                            fa: 'Font Awesome',
                            io: 'Ionicons',
                            md: 'Material Icons',
                            mc: 'Material Community',
                            oc: 'Octicons',
                            si: 'Simple Line'
                        }).map(([prefix, name]) => (
                            <View
                                key={prefix}
                                className="bg-gray-100 px-3 py-1 rounded-full"
                            >
                                <Text className="text-sm text-gray-600">{prefix} ({name})</Text>
                            </View>
                        ))}
                    </View>
                </View>
            ),
            description: "prefix:name 형식으로 원하는 아이콘을 사용할 수 있습니다. (예: md:home, io:heart)",
            code: `// 아이콘 사용 예시
<Icon icon="md:home" />  // Material Icons
<Icon icon="io:heart" />  // Ionicons
<Icon icon="fa:user" />  // Font Awesome
<Icon icon="fi:settings" />  // Feather Icons`
        }
    ];
};
