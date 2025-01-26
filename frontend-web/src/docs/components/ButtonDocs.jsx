import { ButtonExamples } from '../examples/ButtonExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const ButtonDocs = () => {
    const examples = ButtonExamples();  // 컴포넌트 실행

    return (
        <DocSection
            id="buttons"
            title="버튼 (Button)"
            description={
                <div>
                    <p>Button 컴포넌트는 className prop을 통해 Tailwind CSS로 스타일을 커스터마이징할 수 있습니다.</p>
                    <p>기본 스타일을 유지하면서 추가적인 스타일을 적용하거나, 완전히 새로운 스타일을 정의할 수 있습니다.</p>
                </div>
            }
        >
            <div id="button-variants" className="mb-8">
                <h3 className="text-lg font-medium mb-4">버튼 종류</h3>
                <div className="grid grid-cols-4 gap-8">
                    {examples.slice(0, 9).map((example, index) => (
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

            <div id="button-sizes" className="mb-8">
                <h3 className="text-lg font-medium mb-4">버튼 크기</h3>
                <div className="grid grid-cols-4 gap-8">
                    {examples.slice(9).map((example, index) => (
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

export default ButtonDocs; 