/**
 * 파일명: ModalDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Modal 컴포넌트 문서
 */
import { basicExampleList, sizeExampleList, formExampleList, dragExampleList, positionExampleList } from '../examples/ModalExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

/**
 * @description Modal 문서 섹션을 구성하고 예제 목록을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const ModalDocs = () => {
  return <DocSection id="modals" title="30. 모달 (Modal)" description={<div className="space-y-2 text-sm text-slate-700">
                    <p>Modal 컴포넌트는 Header, Body, Footer 영역을 가진 팝업 대화상자입니다.</p>
                    <p>5가지 크기(sm, md, lg, xl, full)를 지원하며, slate/indigo 기반 표면·구분선·포커스 스타일을 제공합니다.</p>
                    <p>ESC 키, 배경 클릭, 포커스 이동 제한, 기본 접근성 이름, 선택적 드래그 이동을 지원합니다.</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                        <li><code>isOpen</code>: 열림 상태</li>
                        <li><code>onClose?</code>: 닫힘 콜백</li>
                        <li><code>size?</code>: 'sm' | 'md' | 'lg' | 'xl' | 'full'</li>
                        <li><code>draggable?</code>: 헤더 드래그 이동</li>
                        <li><code>closeOnBackdrop?</code>: 배경 클릭 시 닫힘</li>
                        <li><code>closeOnEsc?</code>: ESC 키로 닫힘</li>
                        <li><code>top?/left?</code>: 초기 위치 지정</li>
                        <li><code>className?</code>: 추가 Tailwind 클래스</li>
                        <li><code>children</code>: 모달 내부 콘텐츠</li>
                    </ul>
                </div>}>
            <div id="modal-basic" className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">기본 사용법</h3>
                <div className="grid grid-cols-1 gap-8">
                    <div>
                        {basicExampleList[0].component}
                        <div className="mt-2 text-sm text-slate-600">
                            {basicExampleList[0].description}
                        </div>
                        <CodeBlock code={basicExampleList[0].code} />
                    </div>
                </div>
            </div>

            <div id="modal-sizes" className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">모달 크기</h3>
                <div className="grid grid-cols-1 gap-8">
                    <div>
                        {sizeExampleList[0].component}
                        <div className="mt-2 text-sm text-slate-600">
                            {sizeExampleList[0].description}
                        </div>
                        <CodeBlock code={sizeExampleList[0].code} />
                    </div>
                </div>
            </div>

            <div id="modal-form" className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">폼이 포함된 모달</h3>
                <div className="grid grid-cols-1 gap-8">
                    <div>
                        {formExampleList[0].component}
                        <div className="mt-2 text-sm text-slate-600">
                            {formExampleList[0].description}
                        </div>
                        <CodeBlock code={formExampleList[0].code} />
                    </div>
                </div>
            </div>

            <div id="modal-drag" className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">드래그 가능한 모달</h3>
                <div className="grid grid-cols-1 gap-8">
                    <div>
                        {dragExampleList[0].component}
                        <div className="mt-2 text-sm text-slate-600">
                            {dragExampleList[0].description}
                        </div>
                        <CodeBlock code={dragExampleList[0].code} />
                    </div>
                </div>
            </div>

            <div id="modal-position" className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">모달 위치 지정</h3>
                <div className="grid grid-cols-1 gap-8">
                    <div>
                        {positionExampleList[0].component}
                        <div className="mt-2 text-sm text-slate-600">
                            {positionExampleList[0].description}
                        </div>
                        <CodeBlock code={positionExampleList[0].code} />
                    </div>
                </div>
            </div>
        </DocSection>;
};

export default ModalDocs;
