import * as Lib from '@/lib';

export const DataClassExamples = () => {
    const examples = [
        {
            component: (() => {
                const data = Lib.EasyObj({
                    name: '?�길??,
                    age: 20,
                    hobbies: ['?�서', '?�동'],
                    address: {
                        city: '?�울',
                        street: '강남?��?
                    }
                });

                return (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Lib.Button onClick={() => data.age += 1}>
                                ?�이 증�?
                            </Lib.Button>
                            <Lib.Button onClick={() => data.hobbies.push('?�행')}>
                                취�? 추�?
                            </Lib.Button>
                            <Lib.Button onClick={() => data.address.city = '부??}>
                                ?�시 변�?
                            </Lib.Button>
                        </div>
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>
                );
            })(),
            description: "EasyObj??객체??중첩???�성까�? ?�동?�로 ?�태�?관리합?�다.",
            code: `const data = Lib.EasyObj({
    name: '?�길??,
    age: 20,
    hobbies: ['?�서', '?�동'],
    address: {
        city: '?�울',
        street: '강남?��?
    }
});

// ?�태 변�????�동?�로 리렌?�링
data.age += 1;
data.hobbies.push('?�행');
data.address.city = '부??;`
        },
        {
            component: (() => {
                const list = Lib.EasyList([
                    { id: 1, text: '????1' },
                    { id: 2, text: '????2' }
                ]);

                return (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Lib.Button onClick={() => list.push({
                                id: list.length + 1,
                                text: `????${list.length + 1}`
                            })}>
                                ??�� 추�?
                            </Lib.Button>
                            <Lib.Button onClick={() => list.pop()}>
                                마�?�???�� ?�거
                            </Lib.Button>
                            <Lib.Button onClick={() => list.forAll(item => {
                                item.text += ' (?�료)';
                            })}>
                                모든 ??�� ?�료
                            </Lib.Button>
                        </div>
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
                            {JSON.stringify(list, null, 2)}
                        </pre>
                    </div>
                );
            })(),
            description: "EasyList??배열 메서?��? 지?�하�?�???��???�태???�동?�로 관리합?�다.",
            code: `const list = Lib.EasyList([
    { id: 1, text: '????1' },
    { id: 2, text: '????2' }
]);

// 배열 메서???�용
list.push({ id: 3, text: '????3' });
list.pop();

// forAll 메서?�로 모든 ??�� ?�정
list.forAll(item => {
    item.text += ' (?�료)';
});`
        }
    ];

    return examples;
}; 