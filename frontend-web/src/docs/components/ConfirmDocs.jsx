import { ConfirmExamples } from '../examples/ConfirmExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const ConfirmDocs = () => {
    const examples = ConfirmExamples();

    return (
        <DocSection
            id="confirms"
            title="12. 확인 (Confirm)"
            description={
                <div>
                    <p>Confirm 컴포넌트는 AppContext의 showConfirm을 통해 제어됩니다.</p>
                    <p>Promise를 반환하며, 사용자의 선택(확인: true, 취소: false)을 then으로 받을 수 있습니다.</p>
                    <p>3가지 유형(info, warning, danger)을 지원하며, 제목과 버튼 텍스트를 설정할 수 있습니다.</p>
                </div>
            }
        >
            <div id="confirm-basic" className="mb-8">
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

            <div id="confirm-types" className="mb-8">
                <h3 className="text-lg font-medium mb-4">확인 대화상자 유형</h3>
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

            <div id="confirm-callback" className="mb-8">
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

            <div id="confirm-focus" className="mb-8">
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

export default ConfirmDocs; 