import { TabExamples } from '../examples/TabExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const TabDocs = () => {
    const examples = TabExamples();

    return (
        <DocSection
            id="tabs"
            title="15. 탭 (Tab)"
            description={
                <div>
                    <p>Tab 컴포넌트는 Tab.Item을 사용하여 탭 패널을 구성합니다.</p>
                    <p>EasyObj를 사용하거나 일반 useState로도 상태 관리가 가능합니다.</p>
                    <p>className prop을 통해 커스텀 스타일링을 지원합니다.</p>
                </div>
            }
        >
            <div id="tab-basic" className="mb-8">
                <h3 className="text-lg font-medium mb-4">기본 사용법</h3>
                <div className="grid grid-cols-1 gap-8">
                    <div>
                        {examples[0].component}
                        <div className="mt-2 text-sm text-gray-600">
                            {examples[0].description}
                        </div>
                        <CodeBlock code={examples[0].code} />
                    </div>
                </div>
            </div>

            <div id="tab-controlled" className="mb-8">
                <h3 className="text-lg font-medium mb-4">제어 컴포넌트</h3>
                <div className="grid grid-cols-1 gap-8">
                    <div>
                        {examples[1].component}
                        <div className="mt-2 text-sm text-gray-600">
                            {examples[1].description}
                        </div>
                        <CodeBlock code={examples[1].code} />
                    </div>
                </div>
            </div>

            <div id="tab-styled" className="mb-8">
                <h3 className="text-lg font-medium mb-4">스타일링</h3>
                <div className="grid grid-cols-1 gap-8">
                    <div>
                        {examples[2].component}
                        <div className="mt-2 text-sm text-gray-600">
                            {examples[2].description}
                        </div>
                        <CodeBlock code={examples[2].code} />
                    </div>
                </div>
            </div>

            <div id="tab-icons" className="mb-8">
                <h3 className="text-lg font-medium mb-4">아이콘 탭</h3>
                <div className="grid grid-cols-1 gap-8">
                    <div>
                        {examples[3].component}
                        <div className="mt-2 text-sm text-gray-600">
                            {examples[3].description}
                        </div>
                        <CodeBlock code={examples[3].code} />
                    </div>
                </div>
            </div>
        </DocSection>
    );
};

export default TabDocs; 