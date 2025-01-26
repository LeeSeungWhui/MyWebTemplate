import { InputExamples } from '../examples/InputExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const InputDocs = () => {
    const examples = InputExamples();  // 컴포넌트 실행

    return (
        <DocSection
            id="inputs"
            title="입력 (Input)"
            description={
                <div>
                    <p>Input 컴포넌트는 dataObj와 dataKey를 통해 양방향 바인딩을 지원합니다.</p>
                    <p>예: dataObj.email이 변경되면 input 값이 변경되고, input 값이 변경되면 dataObj.email이 자동으로 업데이트됩니다.</p>
                </div>
            }
        >
            <div id="input-basic" className="mb-8">
                <h3 className="text-lg font-medium mb-4">기본 입력</h3>
                <div className="grid grid-cols-3 gap-8">
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

            <div id="input-mask" className="mb-8">
                <h3 className="text-lg font-medium mb-4">마스크 입력</h3>
                <div className="grid grid-cols-3 gap-8">
                    {examples.slice(2, 4).map((example, index) => (
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

            <div id="input-filter" className="mb-8">
                <h3 className="text-lg font-medium mb-4">필터 입력</h3>
                <div className="grid grid-cols-3 gap-8">
                    {examples.slice(4).map((example, index) => (
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

export default InputDocs; 