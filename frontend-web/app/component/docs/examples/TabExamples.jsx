/**
 * 파일명: TabExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Tab 컴포넌트 예제
 */
import * as Lib from '@/app/lib';
import { useState } from 'react';

export const TabExamples = () => {
    const tabState = Lib.EasyObj({
        selectedTab: 0
    });

    const examples = [
        {
            component: (
                <Lib.Tab dataObj={tabState} dataKey="selectedTab">
                    <Lib.Tab.Item title="첫번째 탭">
                        <div className="p-4">
                            첫번째 탭의 내용입니다.
                        </div>
                    </Lib.Tab.Item>
                    <Lib.Tab.Item title="두번째 탭">
                        <div className="p-4">
                            두번째 탭의 내용입니다.
                        </div>
                    </Lib.Tab.Item>
                    <Lib.Tab.Item title="세번째 탭">
                        <div className="p-4">
                            세번째 탭의 내용입니다.
                        </div>
                    </Lib.Tab.Item>
                </Lib.Tab>
            ),
            description: "EasyObj를 사용한 기본 탭",
            code: `const tabState = Lib.EasyObj({
    selectedTab: 0
});

<Lib.Tab dataObj={tabState} dataKey="selectedTab">
    <Lib.Tab.Item title="첫번째 탭">
        <div className="p-4">
            첫번째 탭의 내용입니다.
        </div>
    </Lib.Tab.Item>
    <Lib.Tab.Item title="두번째 탭">
        <div className="p-4">
            두번째 탭의 내용입니다.
        </div>
    </Lib.Tab.Item>
    <Lib.Tab.Item title="세번째 탭">
        <div className="p-4">
            세번째 탭의 내용입니다.
        </div>
    </Lib.Tab.Item>
</Lib.Tab>`
        },
        {
            component: (() => {
                const [activeTab, setActiveTab] = useState(0);

                return (
                    <Lib.Tab tabIndex={activeTab} onChange={setActiveTab}>
                        <Lib.Tab.Item title="프로필">
                            <div className="p-4 space-y-2">
                                <h3 className="font-medium">사용자 프로필</h3>
                                <p>useState를 사용한 탭 예시입니다.</p>
                            </div>
                        </Lib.Tab.Item>
                        <Lib.Tab.Item title="설정">
                            <div className="p-4 space-y-2">
                                <h3 className="font-medium">설정</h3>
                                <p>tabIndex와 onChange props를 사용합니다.</p>
                            </div>
                        </Lib.Tab.Item>
                    </Lib.Tab>
                );
            })(),
            description: "useState를 사용한 탭",
            code: `const [activeTab, setActiveTab] = useState(0);

<Lib.Tab tabIndex={activeTab} onChange={setActiveTab}>
    <Lib.Tab.Item title="프로필">
        <div className="p-4 space-y-2">
            <h3 className="font-medium">사용자 프로필</h3>
            <p>useState를 사용한 탭 예시입니다.</p>
        </div>
    </Lib.Tab.Item>
    <Lib.Tab.Item title="설정">
        <div className="p-4 space-y-2">
            <h3 className="font-medium">설정</h3>
            <p>tabIndex와 onChange props를 사용합니다.</p>
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
                    <Lib.Tab.Item title="커스텀 스타일">
                        <div className="p-4">
                            className prop으로 커스텀 스타일을 적용할 수 있습니다.
                        </div>
                    </Lib.Tab.Item>
                    <Lib.Tab.Item title="두번째">
                        <div className="p-4">
                            Tailwind 클래스를 사용해서 쉽게 스타일링이 가능합니다.
                        </div>
                    </Lib.Tab.Item>
                </Lib.Tab>
            ),
            description: "커스텀 스타일링",
            code: `<Lib.Tab 
    className="bg-gray-100 rounded-lg p-4"
    dataObj={tabState} 
    dataKey="customTab"
>
    <Lib.Tab.Item title="커스텀 스타일">
        <div className="p-4">
            className prop으로 커스텀 스타일을 적용할 수 있습니다.
        </div>
    </Lib.Tab.Item>
    <Lib.Tab.Item title="두번째">
        <div className="p-4">
            Tailwind 클래스를 사용해서 쉽게 스타일링이 가능합니다.
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
                                <span>홈</span>
                            </div>
                        }
                    >
                        <div className="p-4">
                            탭 제목에 아이콘과 텍스트를 함께 사용할 수 있습니다.
                        </div>
                    </Lib.Tab.Item>
                    <Lib.Tab.Item
                        title={
                            <div className="flex items-center gap-2">
                                <Lib.Icon icon="md:MdSettings" className="w-5 h-5" />
                                <span>설정</span>
                            </div>
                        }
                    >
                        <div className="p-4">
                            title prop에 JSX를 전달하여 자유롭게 커스터마이징이 가능합니다.
                        </div>
                    </Lib.Tab.Item>
                </Lib.Tab>
            ),
            description: "아이콘이 있는 탭",
            code: `<Lib.Tab dataObj={tabState} dataKey="iconTab">
    <Lib.Tab.Item 
        title={
            <div className="flex items-center gap-2">
                <Lib.Icon icon="md:MdHome" className="w-5 h-5" />
                <span>홈</span>
            </div>
        }
    >
        <div className="p-4">
            탭 제목에 아이콘과 텍스트를 함께 사용할 수 있습니다.
        </div>
    </Lib.Tab.Item>
    <Lib.Tab.Item 
        title={
            <div className="flex items-center gap-2">
                <Lib.Icon icon="md:MdSettings" className="w-5 h-5" />
                <span>설정</span>
            </div>
        }
    >
        <div className="p-4">
            title prop에 JSX를 전달하여 자유롭게 커스터마이징이 가능합니다.
        </div>
    </Lib.Tab.Item>
</Lib.Tab>`
        }
    ];

    return examples;
}; 