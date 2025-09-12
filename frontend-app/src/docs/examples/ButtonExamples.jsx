import { View, Text } from 'react-native';
import * as Lib from '@/lib';

export const ButtonExamples = () => {
    return [
        {
            title: "버튼 스타일",
            component: (
                <View className="flex-row flex-wrap gap-2">
                    <Lib.Button variant="primary">Primary</Lib.Button>
                    <Lib.Button variant="secondary">Secondary</Lib.Button>
                    <Lib.Button variant="outline">Outline</Lib.Button>
                    <Lib.Button variant="ghost">Ghost</Lib.Button>
                    <Lib.Button variant="danger">Danger</Lib.Button>
                    <Lib.Button variant="success">Success</Lib.Button>
                </View>
            ),
            description: "버튼의 기본 스타일 variant들입니다.",
            code: `<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>`
        },
        {
            title: "버튼 크기",
            component: (
                <View className="flex-row flex-wrap gap-2 items-center">
                    <Lib.Button size="sm">Small</Lib.Button>
                    <Lib.Button size="md">Medium</Lib.Button>
                    <Lib.Button size="lg">Large</Lib.Button>
                </View>
            ),
            description: "sm, md, lg 세 가지 크기를 지원합니다.",
            code: `<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`
        },
        {
            title: "상태",
            component: (
                <View className="flex-row flex-wrap gap-2">
                    <Lib.Button disabled>Disabled</Lib.Button>
                    <Lib.Button loading>Loading</Lib.Button>
                </View>
            ),
            description: "비활성화 상태와 로딩 상태를 지원합니다.",
            code: `<Button disabled>Disabled</Button>
<Button loading>Loading</Button>`
        }
    ];
}; 