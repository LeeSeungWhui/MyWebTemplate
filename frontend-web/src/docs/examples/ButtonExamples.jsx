import * as Lib from '@/lib';

export const ButtonExamples = () => {
    const examples = [
        {
            component: <Lib.Button>기본 버튼</Lib.Button>,
            description: "기본 버튼 (Primary)",
            code: "<Lib.Button>기본 버튼</Lib.Button>"
        },
        {
            component: <Lib.Button variant="secondary">Secondary</Lib.Button>,
            description: "Secondary 버튼",
            code: '<Lib.Button variant="secondary">Secondary</Lib.Button>'
        },
        {
            component: <Lib.Button variant="outline">Outline</Lib.Button>,
            description: "Outline 버튼",
            code: '<Lib.Button variant="outline">Outline</Lib.Button>'
        },
        {
            component: <Lib.Button variant="ghost">Ghost</Lib.Button>,
            description: "Ghost 버튼",
            code: '<Lib.Button variant="ghost">Ghost</Lib.Button>'
        },
        {
            component: <Lib.Button variant="danger">Danger</Lib.Button>,
            description: "Danger 버튼",
            code: '<Lib.Button variant="danger">Danger</Lib.Button>'
        },
        {
            component: <Lib.Button variant="success">Success</Lib.Button>,
            description: "Success 버튼",
            code: '<Lib.Button variant="success">Success</Lib.Button>'
        },
        {
            component: <Lib.Button variant="warning">Warning</Lib.Button>,
            description: "Warning 버튼",
            code: '<Lib.Button variant="warning">Warning</Lib.Button>'
        },
        {
            component: <Lib.Button variant="link">Link Button</Lib.Button>,
            description: "Link 스타일 버튼",
            code: '<Lib.Button variant="link">Link Button</Lib.Button>'
        },
        {
            component: <Lib.Button variant="dark">Dark</Lib.Button>,
            description: "Dark 버튼",
            code: '<Lib.Button variant="dark">Dark</Lib.Button>'
        },
        {
            component: <Lib.Button size="sm">Small</Lib.Button>,
            description: "Small 버튼",
            code: '<Lib.Button size="sm">Small</Lib.Button>'
        },
        {
            component: <Lib.Button size="lg">Large</Lib.Button>,
            description: "Large 버튼",
            code: '<Lib.Button size="lg">Large</Lib.Button>'
        },
        {
            component: <Lib.Button disabled>Disabled</Lib.Button>,
            description: "비활성화 버튼",
            code: '<Lib.Button disabled>Disabled</Lib.Button>'
        },
        {
            component: <Lib.Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                그라데이션 버튼
            </Lib.Button>,
            description: "커스텀 스타일링",
            code: `<Lib.Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
        그라데이션 버튼
    </Lib.Button>`
        }
    ];

    return examples;
}; 