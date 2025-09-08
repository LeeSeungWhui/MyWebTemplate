import { AlertExamples } from '../examples/AlertExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const AlertDocs = () => {
    const examples = AlertExamples();

    return (
        <DocSection
            id="alerts"
            title="11.알림 (Alert)"
            description={
                <div>
                    <p>Alert 컴포넌트는 AppContext의 showAlert를 통해 제어됩니다.</p>
                    <p>4가지 유형(info, success, warning, error)을 지원하며, 제목과 메시지를 설정할 수 있습니다.</p>
                </div>
            }
        >
            <div id="alert-basic" className="mb-8">
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

            <div id="alert-types" className="mb-8">
                <h3 className="text-lg font-medium mb-4">알림 유형</h3>
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

            <div id="alert-callback" className="mb-8">
                <h3 className="text-lg font-medium mb-4">콜백 함수</h3>
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

            <div id="alert-callback" className="mb-8">
                <h3 className="text-lg font-medium mb-4">포커스 관리</h3>
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

export default AlertDocs; 