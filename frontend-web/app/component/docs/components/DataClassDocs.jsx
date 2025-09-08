import { DataClassExamples } from '../examples/DataClassExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const DataClassDocs = () => {
    const examples = DataClassExamples();

    return (
        <DocSection
            id="dataclass"
            title="1. 데이터 클래스 (Data Class)"
            description={
                <div>
                    <p>EasyObj와 EasyList는 React에서 복잡한 상태 관리를 단순화하는 데이터 클래스입니다.</p>
                    <p>객체나 배열의 중첩된 속성까지 자동으로 상태를 관리하며, 직관적인 방식으로 데이터를 조작할 수 있습니다.</p>
                    <p>useState와 달리 상태 변경 시 setter 함수를 호출할 필요가 없으며, 불변성을 자동으로 관리합니다.</p>
                </div>
            }
        >
            <div id="dataclass-easyobj" className="mb-8">
                <h3 className="text-lg font-medium mb-4">EasyObj</h3>
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

            <div id="dataclass-easylist" className="mb-8">
                <h3 className="text-lg font-medium mb-4">EasyList</h3>
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
        </DocSection>
    );
};

export default DataClassDocs; 