import * as Lib from '@/lib';

export const DataClassExamples = () => {
    const examples = [
        {
            component: (() => {
                const data = Lib.EasyObj({
                    name: '?çÍ∏∏??,
                    age: 20,
                    hobbies: ['?ÖÏÑú', '?¥Îèô'],
                    address: {
                        city: '?úÏö∏',
                        street: 'Í∞ïÎÇ®?ÄÎ°?
                    }
                });

                return (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Lib.Button onClick={() => data.age += 1}>
                                ?òÏù¥ Ï¶ùÍ?
                            </Lib.Button>
                            <Lib.Button onClick={() => data.hobbies.push('?¨Ìñâ')}>
                                Ï∑®Î? Ï∂îÍ?
                            </Lib.Button>
                            <Lib.Button onClick={() => data.address.city = 'Î∂Ä??}>
                                ?ÑÏãú Î≥ÄÍ≤?
                            </Lib.Button>
                        </div>
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>
                );
            })(),
            description: "EasyObj??Í∞ùÏ≤¥??Ï§ëÏ≤©???çÏÑ±ÍπåÏ? ?êÎèô?ºÎ°ú ?ÅÌÉúÎ•?Í¥ÄÎ¶¨Ìï©?àÎã§.",
            code: `const data = Lib.EasyObj({
    name: '?çÍ∏∏??,
    age: 20,
    hobbies: ['?ÖÏÑú', '?¥Îèô'],
    address: {
        city: '?úÏö∏',
        street: 'Í∞ïÎÇ®?ÄÎ°?
    }
});

// ?ÅÌÉú Î≥ÄÍ≤????êÎèô?ºÎ°ú Î¶¨Î†å?îÎßÅ
data.age += 1;
data.hobbies.push('?¨Ìñâ');
data.address.city = 'Î∂Ä??;`
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
                                ??™© Ï∂îÍ?
                            </Lib.Button>
                            <Lib.Button onClick={() => list.pop()}>
                                ÎßàÏ?Îß???™© ?úÍ±∞
                            </Lib.Button>
                            <Lib.Button onClick={() => list.forAll(item => {
                                item.text += ' (?ÑÎ£å)';
                            })}>
                                Î™®Îì† ??™© ?ÑÎ£å
                            </Lib.Button>
                        </div>
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
                            {JSON.stringify(list, null, 2)}
                        </pre>
                    </div>
                );
            })(),
            description: "EasyList??Î∞∞Ïó¥ Î©îÏÑú?úÎ? ÏßÄ?êÌïòÎ©?Í∞???™©???ÅÌÉú???êÎèô?ºÎ°ú Í¥ÄÎ¶¨Ìï©?àÎã§.",
            code: `const list = Lib.EasyList([
    { id: 1, text: '????1' },
    { id: 2, text: '????2' }
]);

// Î∞∞Ïó¥ Î©îÏÑú???¨Ïö©
list.push({ id: 3, text: '????3' });
list.pop();

// forAll Î©îÏÑú?úÎ°ú Î™®Îì† ??™© ?òÏ†ï
list.forAll(item => {
    item.text += ' (?ÑÎ£å)';
});`
        }
    ];

    return examples;
}; 