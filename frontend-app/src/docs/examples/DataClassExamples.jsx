import { View, Text, TouchableOpacity } from 'react-native';
import * as Lib from '@/lib';

export const DataClassExamples = () => {
    const data = Lib.EasyObj({
        name: '홍길동',
        age: 20,
        address: {
            city: '서울',
            street: '강남대로'
        }
    });

    const list = Lib.EasyList([
        { id: 1, text: '할 일 1' },
        { id: 2, text: '할 일 2' }
    ]);

    return [
        {
            title: "EasyObj 기본 사용",
            component: (
                <View className="space-y-4">
                    <TouchableOpacity
                        className="bg-blue-500 px-4 py-2 rounded"
                        onPress={() => data.count++}
                    >
                        <Text className="text-white">카운트 증가</Text>
                    </TouchableOpacity>
                    <Text className="p-4 bg-gray-100 rounded">
                        {JSON.stringify(data, null, 2)}
                    </Text>
                </View>
            ),
            description: "EasyObj는 객체의 변경을 감지하고 자동으로 리렌더링합니다.",
            code: `const data = Lib.EasyObj({
    count: 0,
    name: '홍길동'
});

// 상태 변경 시 자동으로 리렌더링
data.count++;
data.name = '김철수';`
        },
        {
            title: "EasyList 기본 사용",
            component: (
                <View className="space-y-4">
                    <View className="flex-row space-x-2">
                        <TouchableOpacity
                            className="bg-blue-500 px-4 py-2 rounded"
                            onPress={() => list.push({ id: list.length + 1, text: `할 일 ${list.length + 1}` })}
                        >
                            <Text className="text-white">항목 추가</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-blue-500 px-4 py-2 rounded"
                            onPress={() => list.pop()}
                        >
                            <Text className="text-white">마지막 항목 제거</Text>
                        </TouchableOpacity>
                    </View>
                    <Text className="p-4 bg-gray-100 rounded">
                        {JSON.stringify(list, null, 2)}
                    </Text>
                </View>
            ),
            description: "EasyList는 배열 메서드(push, pop 등)를 지원하며 변경 시 자동으로 리렌더링됩니다.",
            code: `const list = Lib.EasyList([
    { id: 1, text: '할 일 1' },
    { id: 2, text: '할 일 2' }
]);

// 배열 메서드 사용
list.push({ id: 3, text: '할 일 3' });
list.pop();`
        },
        {
            title: "중첩된 데이터 구조",
            component: (
                <View className="space-y-4">
                    <TouchableOpacity
                        className="bg-blue-500 px-4 py-2 rounded"
                        onPress={() => data.items[0].count++}
                    >
                        <Text className="text-white">첫 번째 아이템 카운트 증가</Text>
                    </TouchableOpacity>
                    <Text className="p-4 bg-gray-100 rounded">
                        {JSON.stringify(data, null, 2)}
                    </Text>
                </View>
            ),
            description: "중첩된 객체나 배열의 변경도 자동으로 감지됩니다.",
            code: `const data = Lib.EasyObj({
    items: [
        { id: 1, count: 0 },
        { id: 2, count: 0 }
    ]
});

// 중첩된 속성 변경
data.items[0].count++;`
        }
    ];
}; 