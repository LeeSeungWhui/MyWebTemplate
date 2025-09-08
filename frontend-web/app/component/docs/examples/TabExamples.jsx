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
                    <Lib.Tab.Item title="ì²«ë²ˆì§???>
                        <div className="p-4">
                            ì²«ë²ˆì§???˜ ?´ìš©?…ë‹ˆ??
                        </div>
                    </Lib.Tab.Item>
                    <Lib.Tab.Item title="?ë²ˆì§???>
                        <div className="p-4">
                            ?ë²ˆì§???˜ ?´ìš©?…ë‹ˆ??
                        </div>
                    </Lib.Tab.Item>
                    <Lib.Tab.Item title="?¸ë²ˆì§???>
                        <div className="p-4">
                            ?¸ë²ˆì§???˜ ?´ìš©?…ë‹ˆ??
                        </div>
                    </Lib.Tab.Item>
                </Lib.Tab>
            ),
            description: "EasyObjë¥??¬ìš©??ê¸°ë³¸ ??,
            code: `const tabState = Lib.EasyObj({
    selectedTab: 0
});

<Lib.Tab dataObj={tabState} dataKey="selectedTab">
    <Lib.Tab.Item title="ì²«ë²ˆì§???>
        <div className="p-4">
            ì²«ë²ˆì§???˜ ?´ìš©?…ë‹ˆ??
        </div>
    </Lib.Tab.Item>
    <Lib.Tab.Item title="?ë²ˆì§???>
        <div className="p-4">
            ?ë²ˆì§???˜ ?´ìš©?…ë‹ˆ??
        </div>
    </Lib.Tab.Item>
    <Lib.Tab.Item title="?¸ë²ˆì§???>
        <div className="p-4">
            ?¸ë²ˆì§???˜ ?´ìš©?…ë‹ˆ??
        </div>
    </Lib.Tab.Item>
</Lib.Tab>`
        },
        {
            component: (() => {
                const [activeTab, setActiveTab] = useState(0);

                return (
                    <Lib.Tab tabIndex={activeTab} onChange={setActiveTab}>
                        <Lib.Tab.Item title="?„ë¡œ??>
                            <div className="p-4 space-y-2">
                                <h3 className="font-medium">?¬ìš©???„ë¡œ??/h3>
                                <p>useStateë¥??¬ìš©?????ˆì‹œ?…ë‹ˆ??</p>
                            </div>
                        </Lib.Tab.Item>
                        <Lib.Tab.Item title="?¤ì •">
                            <div className="p-4 space-y-2">
                                <h3 className="font-medium">?¤ì •</h3>
                                <p>tabIndex?€ onChange propsë¥??¬ìš©?©ë‹ˆ??</p>
                            </div>
                        </Lib.Tab.Item>
                    </Lib.Tab>
                );
            })(),
            description: "useStateë¥??¬ìš©????,
            code: `const [activeTab, setActiveTab] = useState(0);

<Lib.Tab tabIndex={activeTab} onChange={setActiveTab}>
    <Lib.Tab.Item title="?„ë¡œ??>
        <div className="p-4 space-y-2">
            <h3 className="font-medium">?¬ìš©???„ë¡œ??/h3>
            <p>useStateë¥??¬ìš©?????ˆì‹œ?…ë‹ˆ??</p>
        </div>
    </Lib.Tab.Item>
    <Lib.Tab.Item title="?¤ì •">
        <div className="p-4 space-y-2">
            <h3 className="font-medium">?¤ì •</h3>
            <p>tabIndex?€ onChange propsë¥??¬ìš©?©ë‹ˆ??</p>
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
                    <Lib.Tab.Item title="ì»¤ìŠ¤?€ ?¤í???>
                        <div className="p-4">
                            className prop?¼ë¡œ ì»¤ìŠ¤?€ ?¤í??¼ì„ ?ìš©?????ˆìŠµ?ˆë‹¤.
                        </div>
                    </Lib.Tab.Item>
                    <Lib.Tab.Item title="?ë²ˆì§?>
                        <div className="p-4">
                            Tailwind ?´ë˜?¤ë? ?¬ìš©?´ì„œ ?½ê²Œ ?¤í??¼ë§??ê°€?¥í•©?ˆë‹¤.
                        </div>
                    </Lib.Tab.Item>
                </Lib.Tab>
            ),
            description: "ì»¤ìŠ¤?€ ?¤í??¼ë§",
            code: `<Lib.Tab 
    className="bg-gray-100 rounded-lg p-4"
    dataObj={tabState} 
    dataKey="customTab"
>
    <Lib.Tab.Item title="ì»¤ìŠ¤?€ ?¤í???>
        <div className="p-4">
            className prop?¼ë¡œ ì»¤ìŠ¤?€ ?¤í??¼ì„ ?ìš©?????ˆìŠµ?ˆë‹¤.
        </div>
    </Lib.Tab.Item>
    <Lib.Tab.Item title="?ë²ˆì§?>
        <div className="p-4">
            Tailwind ?´ë˜?¤ë? ?¬ìš©?´ì„œ ?½ê²Œ ?¤í??¼ë§??ê°€?¥í•©?ˆë‹¤.
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
                            ???œëª©???„ì´ì½˜ê³¼ ?ìŠ¤?¸ë? ?¨ê»˜ ?¬ìš©?????ˆìŠµ?ˆë‹¤.
                        </div>
                    </Lib.Tab.Item>
                    <Lib.Tab.Item
                        title={
                            <div className="flex items-center gap-2">
                                <Lib.Icon icon="md:MdSettings" className="w-5 h-5" />
                                <span>?¤ì •</span>
                            </div>
                        }
                    >
                        <div className="p-4">
                            title prop??JSXë¥??„ë‹¬?˜ì—¬ ?ìœ ë¡?²Œ ì»¤ìŠ¤?°ë§ˆ?´ì§•??ê°€?¥í•©?ˆë‹¤.
                        </div>
                    </Lib.Tab.Item>
                </Lib.Tab>
            ),
            description: "?„ì´ì½˜ì´ ?ˆëŠ” ??,
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
            ???œëª©???„ì´ì½˜ê³¼ ?ìŠ¤?¸ë? ?¨ê»˜ ?¬ìš©?????ˆìŠµ?ˆë‹¤.
        </div>
    </Lib.Tab.Item>
    <Lib.Tab.Item 
        title={
            <div className="flex items-center gap-2">
                <Lib.Icon icon="md:MdSettings" className="w-5 h-5" />
                <span>?¤ì •</span>
            </div>
        }
    >
        <div className="p-4">
            title prop??JSXë¥??„ë‹¬?˜ì—¬ ?ìœ ë¡?²Œ ì»¤ìŠ¤?°ë§ˆ?´ì§•??ê°€?¥í•©?ˆë‹¤.
        </div>
    </Lib.Tab.Item>
</Lib.Tab>`
        }
    ];

    return examples;
}; 