import { CheckButtonExamples } from '../examples/CheckButtonExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const CheckButtonDocs = () => {
    const examples = CheckButtonExamples();

    return (
        <DocSection
            id="checkbuttons"
            title="6. 체크버튼 (CheckButton)"
            description={
                <div>
                    <p>CheckButton 컴포넌트는 Checkbox와 동일한 방식으로 dataObj와 dataKey를 통해 양방향 바인딩을 지원합니다.</p>
                    <p>버튼 형태로 체크박스 기능을 제공합니다.</p>
                    <p>name prop이 없을 경우 dataKey 또는 children을 name으로 사용합니다.</p>
                </div>
            }
        >
            <div id="checkbutton-basic" className="mb-8">
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

            <div id="checkbutton-variants" className="mb-8">
                <h3 className="text-lg font-medium mb-4">색상 변형</h3>
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

export default CheckButtonDocs; 