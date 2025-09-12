import { LoadingExamples } from '../examples/LoadingExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import Loading from '@/lib/component/Loading';

const LoadingDocs = () => {
    const examples = LoadingExamples();

    return (
        <DocSection
            id="loading"
            title="10. 로딩 스피너 (Loading)"
            component={Loading} description={
                <div>
                    <p>Loading 컴포넌트는 데이터 로딩 상태를 표시하는 스피너를 제공합니다.</p>
                    <p>전체 화면 로딩은 전역 스토어(useSharedStore)의 setLoading으로 제어합니다.</p>
                    <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
                        <li>별도 props 없이 전체 화면 중앙에 표시</li>
                    </ul>
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
