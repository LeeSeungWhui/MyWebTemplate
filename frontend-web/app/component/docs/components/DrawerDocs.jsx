import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { DrawerExamples } from '../examples/DrawerExamples';

const DrawerDocs = () => {
  const examples = DrawerExamples();
  return (
    <DocSection id="drawers" title="24. 드로워 (Drawer)" description={<p>화면 측면에서 슬라이드 인 되는 패널.</p>}>
      <div id="drawer-right" className="mb-8">
        <h3 className="text-lg font-medium mb-4">오른쪽</h3>
        <div>
          {examples[0]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[0]?.description}</div>
          <CodeBlock code={examples[0]?.code || ''} />
        </div>
      </div>
      <div id="drawer-left" className="mb-8">
        <h3 className="text-lg font-medium mb-4">왼쪽</h3>
        <div>
          {examples[1]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[1]?.description}</div>
          <CodeBlock code={examples[1]?.code || ''} />
        </div>
      </div>
    </DocSection>
  );
};

export default DrawerDocs;

