import { ToastExamples } from '../examples/ToastExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import Toast from '@/lib/component/Toast';

const ToastDocs = () => {
    const examples = ToastExamples();

    return (
        <DocSection
            id="toasts"
            title="13. 토스트 (Toast)"
            component={Toast} description={
                <div>
                    <p>Toast 컴포넌트는 전역 스토어(useSharedStore)의 showToast로 제어합니다.</p>
                    <p>4가지 유형(info, success, warning, error)을 지원하며, 6가지 위치에 표시할 수 있습니다.</p>
                    <p>지속 시간을 설정할 수 있으며, 자동 닫기와 수동 닫기를 지원합니다.</p>
                    <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
                        <li><code>message</code>: 표시할 내용</li>
                        <li><code>type?</code>: 스타일 유형</li>
                        <li><code>position?</code>: 화면 위치</li>
                        <li><code>onClose?</code>: 닫힘 콜백</li>
                        <li><code>className?</code>: 추가 Tailwind 클래스</li>
                    </ul>
                </div>
            }
        >
            <div id="toast-basic" className="mb-8">
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

            <div id="toast-types" className="mb-8">
                <h3 className="text-lg font-medium mb-4">토스트 유형</h3>
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

            <div id="toast-positions" className="mb-8">
                <h3 className="text-lg font-medium mb-4">토스트 위치</h3>
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

            <div id="toast-duration" className="mb-8">
                <h3 className="text-lg font-medium mb-4">토스트 지속 시간</h3>
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

export default ToastDocs; 
