import * as Lib from '@/lib';

export const ButtonExamples = () => {
    const examples = [
        {
            component: <Lib.Button>ê¸°ë³¸ ë²„íŠ¼</Lib.Button>,
            description: "ê¸°ë³¸ ë²„íŠ¼ (Primary)",
            code: "<Lib.Button>ê¸°ë³¸ ë²„íŠ¼</Lib.Button>"
        },
        {
            component: <Lib.Button variant="secondary">Secondary</Lib.Button>,
            description: "Secondary ë²„íŠ¼",
            code: '<Lib.Button variant="secondary">Secondary</Lib.Button>'
        },
        {
            component: <Lib.Button variant="outline">Outline</Lib.Button>,
            description: "Link 스타일 버튼",
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                그라디언트
            description: "커스텀 버튼",
    className="bg-gradient-to-r from-purple-500 to-pink-500
    hover:from-purple-600 hover:to-pink-600">
    그라디언트
                검색
            description: "아이콘이 있는 버튼",
    검색
        },
        {
            description: "비활성화 버튼",
};
        },
        {
            component: <Lib.Button variant="warning">Warning</Lib.Button>,
            description: "Warning ë²„íŠ¼",
            code: '<Lib.Button variant="warning">Warning</Lib.Button>'
        },
        {
            component: <Lib.Button variant="link">Link Button</Lib.Button>,
            description: "Link ?¤í???ë²„íŠ¼",
            code: '<Lib.Button variant="link">Link Button</Lib.Button>'
        },
        {
            component: <Lib.Button variant="dark">Dark</Lib.Button>,
            description: "Dark ë²„íŠ¼",
            code: '<Lib.Button variant="dark">Dark</Lib.Button>'
        },
        {
            component: <Lib.Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 
                hover:from-purple-600 hover:to-pink-600"
            >
                ê·¸ë¼?°ì´??
            </Lib.Button>,
            description: "ì»¤ìŠ¤?€ ë²„íŠ¼",
            code: `<Lib.Button
    className="bg-gradient-to-r from-purple-500 to-pink-500 
    hover:from-purple-600 hover:to-pink-600"
>
    ê·¸ë¼?°ì´??
</Lib.Button>`
        },
        {
            component: <Lib.Button>
                <Lib.Icon icon="ri:RiSearchLine" className="w-5 h-5 mr-2" />
                ê²€??
            </Lib.Button>,
            description: "?„ì´ì½˜ì´ ?ˆëŠ” ë²„íŠ¼",
            code: `<Lib.Button>
    <Lib.Icon icon="ri:RiSearchLine" className="w-5 h-5 mr-2" />
    ê²€??
</Lib.Button>`
        },
        {
            component: <Lib.Button disabled>Disabled</Lib.Button>,
            description: "ë¹„í™œ?±í™” ë²„íŠ¼",
            code: '<Lib.Button disabled>Disabled</Lib.Button>'
        },
        {
            component: <Lib.Button size="sm">Small</Lib.Button>,
            description: "Small ë²„íŠ¼",
            code: '<Lib.Button size="sm">Small</Lib.Button>'
        },
        {
            component: <Lib.Button size="md">Medium</Lib.Button>,
            description: "Medium ë²„íŠ¼",
            code: '<Lib.Button size="md">Medium</Lib.Button>'
        },
        {
            component: <Lib.Button size="lg">Large</Lib.Button>,
            description: "Large ë²„íŠ¼",
            code: '<Lib.Button size="lg">Large</Lib.Button>'
        },

    ];

    return examples;
}; 