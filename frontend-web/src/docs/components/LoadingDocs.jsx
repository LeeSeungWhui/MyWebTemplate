import { LoadingExamples } from '../examples/LoadingExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const LoadingDocs = () => {
    const examples = LoadingExamples();

    return (
        <DocSection
            id="loading"
            title="10. 로딩 스피너 (Loading)"
            description={
                <div>
                    <p>Loading 컴포넌트는 데이터 로딩 상태를 표시하는 스피너를 제공합니다.</p>
                    <p>전체 화면 로딩은 AppContext의 setLoading을 통해 제어합니다.</p>
                </div>
            }
        >
            <div id="loading-basic" className="mb-8">
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
        </DocSection>
    );
};

export default LoadingDocs; 