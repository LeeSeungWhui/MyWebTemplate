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
    <DocSection id="drawers" title="24. 드로어 (Drawer)" description={<p>화면 측면에서 슬라이드 인 되는 패널. 외부 Collapse 탭과 리사이즈 지원, 숫자 size(px) 지원.</p>}>
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
