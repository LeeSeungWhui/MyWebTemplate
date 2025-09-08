import * as Lib from '@/lib';
import { useState } from 'react';

export const TabExamples = () => {
    const tabState = Lib.EasyObj({
        selectedTab: 0
    });

    const examples = [
        {
            component: (
                <Lib.Tab dataObj={tabState} dataKey="selectedTab">
                    <Lib.Tab.Item title="첫번�???>
                        <div className="p-4">
                            첫번�???�� ?�용?�니??
                        </div>
                    </Lib.Tab.Item>
                    <Lib.Tab.Item title="?�번�???>
                        <div className="p-4">
                            ?�번�???�� ?�용?�니??
                        </div>
                    </Lib.Tab.Item>
                    <Lib.Tab.Item title="?�번�???>
                        <div className="p-4">
                            ?�번�???�� ?�용?�니??
                        </div>
                    </Lib.Tab.Item>
                </Lib.Tab>
            ),
            description: "EasyObj�??�용??기본 ??,
            code: `const tabState = Lib.EasyObj({
    selectedTab: 0
});

<Lib.Tab dataObj={tabState} dataKey="selectedTab">
    <Lib.Tab.Item title="첫번�???>
        <div className="p-4">
            첫번�???�� ?�용?�니??
        </div>
    </Lib.Tab.Item>
    <Lib.Tab.Item title="?�번�???>
        <div className="p-4">
            ?�번�???�� ?�용?�니??
        </div>
    </Lib.Tab.Item>
    <Lib.Tab.Item title="?�번�???>
        <div className="p-4">
            ?�번�???�� ?�용?�니??
        </div>
    </Lib.Tab.Item>
</Lib.Tab>`
        },
        {
            component: (() => {
                const [activeTab, setActiveTab] = useState(0);

                return (
                    <Lib.Tab tabIndex={activeTab} onChange={setActiveTab}>
                        <Lib.Tab.Item title="?�로??>
                            <div className="p-4 space-y-2">
                                <h3 className="font-medium">?�용???�로??/h3>
                                <p>useState�??�용?????�시?�니??</p>
                            </div>
                        </Lib.Tab.Item>
                        <Lib.Tab.Item title="?�정">
                            <div className="p-4 space-y-2">
                                <h3 className="font-medium">?�정</h3>
                                <p>tabIndex?� onChange props�??�용?�니??</p>
                            </div>
                        </Lib.Tab.Item>
                    </Lib.Tab>
                );
            })(),
            description: "useState�??�용????,
            code: `const [activeTab, setActiveTab] = useState(0);

<Lib.Tab tabIndex={activeTab} onChange={setActiveTab}>
    <Lib.Tab.Item title="?�로??>
        <div className="p-4 space-y-2">
            <h3 className="font-medium">?�용???�로??/h3>
            <p>useState�??�용?????�시?�니??</p>
        </div>
    </Lib.Tab.Item>
    <Lib.Tab.Item title="?�정">
        <div className="p-4 space-y-2">
            <h3 className="font-medium">?�정</h3>
            <p>tabIndex?� onChange props�??�용?�니??</p>
        </div>
    </Lib.Tab.Item>
</Lib.Tab>`
        },
        {
            component: (
                <Lib.Tab
                    className="bg-gray-100 rounded-lg p-4"
                    dataObj={tabState}
                    dataKey="customTab"
                >
                    <Lib.Tab.Item title="커스?� ?��???>
                        <div className="p-4">
                            className prop?�로 커스?� ?��??�을 ?�용?????�습?�다.
                        </div>
                    </Lib.Tab.Item>
                    <Lib.Tab.Item title="?�번�?>
                        <div className="p-4">
                            Tailwind ?�래?��? ?�용?�서 ?�게 ?��??�링??가?�합?�다.
                        </div>
                    </Lib.Tab.Item>
                </Lib.Tab>
            ),
            description: "커스?� ?��??�링",
            code: `<Lib.Tab 
    className="bg-gray-100 rounded-lg p-4"
    dataObj={tabState} 
    dataKey="customTab"
>
    <Lib.Tab.Item title="커스?� ?��???>
        <div className="p-4">
            className prop?�로 커스?� ?��??�을 ?�용?????�습?�다.
        </div>
    </Lib.Tab.Item>
    <Lib.Tab.Item title="?�번�?>
        <div className="p-4">
            Tailwind ?�래?��? ?�용?�서 ?�게 ?��??�링??가?�합?�다.
        </div>
    </Lib.Tab.Item>
</Lib.Tab>`
        },
        {
            component: (
                <Lib.Tab dataObj={tabState} dataKey="iconTab">
                    <Lib.Tab.Item
                        title={
                            <div className="flex items-center gap-2">
                                <Lib.Icon icon="md:MdHome" className="w-5 h-5" />
                                <span>??/span>
                            </div>
                        }
                    >
                        <div className="p-4">
                            ???�목???�이콘과 ?�스?��? ?�께 ?�용?????�습?�다.
                        </div>
                    </Lib.Tab.Item>
                    <Lib.Tab.Item
                        title={
                            <div className="flex items-center gap-2">
                                <Lib.Icon icon="md:MdSettings" className="w-5 h-5" />
                                <span>?�정</span>
                            </div>
                        }
                    >
                        <div className="p-4">
                            title prop??JSX�??�달?�여 ?�유�?�� 커스?�마?�징??가?�합?�다.
                        </div>
                    </Lib.Tab.Item>
                </Lib.Tab>
            ),
            description: "?�이콘이 ?�는 ??,
            code: `<Lib.Tab dataObj={tabState} dataKey="iconTab">
    <Lib.Tab.Item 
        title={
            <div className="flex items-center gap-2">
                <Lib.Icon icon="md:MdHome" className="w-5 h-5" />
                <span>??/span>
            </div>
        }
    >
        <div className="p-4">
            ???�목???�이콘과 ?�스?��? ?�께 ?�용?????�습?�다.
        </div>
    </Lib.Tab.Item>
    <Lib.Tab.Item 
        title={
            <div className="flex items-center gap-2">
                <Lib.Icon icon="md:MdSettings" className="w-5 h-5" />
                <span>?�정</span>
            </div>
        }
    >
        <div className="p-4">
            title prop??JSX�??�달?�여 ?�유�?�� 커스?�마?�징??가?�합?�다.
        </div>
    </Lib.Tab.Item>
</Lib.Tab>`
        }
    ];

    return examples;
}; 