/**
 * 파일명: DrawerDocs.jsx
 * 설명: Drawer 컴포넌트 문서
 */
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { DrawerExamples } from '../examples/DrawerExamples';

const DrawerDocs = () => {
  const examples = DrawerExamples();
  return (
    <DocSection id="drawers" title="24. 드로어 (Drawer)" description={
      <div>
        <p>화면 측면에서 슬라이드 인 되는 패널입니다. 외부 Collapse 탭과 리사이즈를 지원하며 숫자 크기(px) 설정이 가능합니다.</p>
        <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
          <li><code>isOpen</code>: 열림 상태</li>
          <li><code>onClose?</code>: 닫힘 콜백</li>
          <li><code>side?</code>: 위치 'right' | 'left' | 'top' | 'bottom'</li>
          <li><code>size?</code>: 패널 크기(px 또는 문자열)</li>
          <li><code>closeOnBackdrop?</code>: 배경 클릭 시 닫힘</li>
          <li><code>closeOnEsc?</code>: ESC 키로 닫힘</li>
          <li><code>resizable?</code>: 드래그로 크기 조절</li>
          <li><code>collapseButton?</code>: 접기 버튼 표시</li>
          <li><code>className?</code>: 추가 Tailwind 클래스</li>
          <li><code>children?</code>: 패널 내용</li>
        </ul>
      </div>
    }>
      <div id="drawer-right" className="mb-8">
        <h3 className="text-lg font-medium mb-4">오른쪽 (기본)</h3>
        <div>
          {examples[0]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[0]?.description}</div>
          <CodeBlock code={examples[0]?.code || ''} />
        </div>
      </div>
      <div id="drawer-right-sized" className="mb-8">
        <h3 className="text-lg font-medium mb-4">오른쪽 (size=360px)</h3>
        <div>
          {examples[1]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[1]?.description}</div>
          <CodeBlock code={examples[1]?.code || ''} />
        </div>
      </div>
      <div id="drawer-left" className="mb-8">
        <h3 className="text-lg font-medium mb-4">왼쪽 (size="420px")</h3>
        <div>
          {examples[2]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[2]?.description}</div>
          <CodeBlock code={examples[2]?.code || ''} />
        </div>
      </div>
      <div id="drawer-top" className="mb-8">
        <h3 className="text-lg font-medium mb-4">위쪽 (size=220px)</h3>
        <div>
          {examples[3]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[3]?.description}</div>
          <CodeBlock code={examples[3]?.code || ''} />
        </div>
      </div>
      <div id="drawer-bottom" className="mb-8">
        <h3 className="text-lg font-medium mb-4">아래쪽 (size="260")</h3>
        <div>
          {examples[4]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[4]?.description}</div>
          <CodeBlock code={examples[4]?.code || ''} />
        </div>
      </div>
      <div id="drawer-card" className="mb-8">
        <h3 className="text-lg font-medium mb-4">카드 샘플</h3>
        <div>
          {examples[5]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[5]?.description}</div>
          <CodeBlock code={examples[5]?.code || ''} />
        </div>
      </div>
      <div id="drawer-menu" className="mb-8">
        <h3 className="text-lg font-medium mb-4">메뉴 샘플</h3>
        <div>
          {examples[6]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[6]?.description}</div>
          <CodeBlock code={examples[6]?.code || ''} />
        </div>
      </div>
    </DocSection>
  );
};

export default DrawerDocs;
