import { RadioboxExamples } from '../examples/RadioboxExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const RadioboxDocs = () => {
    const examples = RadioboxExamples();

    return (
        <DocSection
            id="radioboxes"
            title="7. 라디오박스 (Radiobox)"
            description={
                <div>
                    <p>Radiobox 컴포넌트는 dataObj와 dataKey를 통해 양방향 바인딩을 지원합니다.</p>
                    <p>같은 name을 가진 라디오박스 그룹에서 선택된 value가 dataObj에 저장됩니다.</p>
                    <p>name prop이 없을 경우 dataKey 또는 label을 name으로 사용합니다.</p>
                </div>
            }
        >
            <div id="radiobox-basic" className="mb-8">
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

            <div id="radiobox-variants" className="mb-8">
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

export default RadioboxDocs; 