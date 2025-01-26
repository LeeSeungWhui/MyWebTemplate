import { RadioButtonExamples } from '../examples/RadioButtonExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const RadioButtonDocs = () => {
    const examples = RadioButtonExamples();

    return (
        <DocSection
            id="radiobuttons"
            title="8. 라디오버튼 (RadioButton)"
            description={
                <div>
                    <p>RadioButton 컴포넌트는 Radiobox와 동일한 방식으로 dataObj와 dataKey를 통해 양방향 바인딩을 지원합니다.</p>
                    <p>버튼 형태로 라디오박스 기능을 제공합니다.</p>
                    <p>name prop이 없을 경우 dataKey 또는 children을 name으로 사용합니다.</p>
                </div>
            }
        >
            <div id="radiobutton-basic" className="mb-8">
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

            <div id="radiobutton-variants" className="mb-8">
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

export default RadioButtonDocs; 