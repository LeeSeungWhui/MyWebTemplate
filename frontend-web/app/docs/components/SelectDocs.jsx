import { SelectExamples } from '../examples/SelectExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const SelectDocs = () => {
    const examples = SelectExamples();

    return (
        <DocSection
            id="selects"
            title="4. 선택 (Select)"
            description={
                <div>
                    <p>Select 컴포넌트는 dataList의 selected 속성을 통해 선택 상태를 관리합니다.</p>
                    <p>옵션 선택 시 해당 항목의 selected가 true로, 나머지는 false로 자동 변경됩니다.</p>
                </div>
            }
        >
            <div id="select-basic" className="mb-8">
                <h3 className="text-lg font-medium mb-4">기본 사용법</h3>
                <div className="grid grid-cols-2 gap-8">
                    {examples.slice(0, 2).map((example, index) => (
                        <div key={index}>
                            {example.component}
                            <div className="mt-2 text-sm text-gray-600">
                                {example.description}
                            </div>
                            <CodeBlock code={example.code} />
                        </div>
                    ))}
                </div>
            </div>

            <div id="select-states" className="mb-8">
                <h3 className="text-lg font-medium mb-4">상태</h3>
                <div className="grid grid-cols-2 gap-8">
                    {examples.slice(2).map((example, index) => (
                        <div key={index}>
                            {example.component}
                            <div className="mt-2 text-sm text-gray-600">
                                {example.description}
                            </div>
                            <CodeBlock code={example.code} />
                        </div>
                    ))}
                </div>
            </div>
        </DocSection>
    );
};

export default SelectDocs; 