import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { SliderExamples } from '../examples/SliderExamples';

const SliderDocs = () => {
  const examples = SliderExamples();
  return (
    <DocSection id="sliders" title="24. 슬라이더 (Slider)" description={<p>화면 측면에서 슬라이드 인 되는 패널.</p>}>
      <div id="slider-right" className="mb-8">
        <h3 className="text-lg font-medium mb-4">오른쪽</h3>
        <div>
          {examples[0]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[0]?.description}</div>
          <CodeBlock code={examples[0]?.code || ''} />
        </div>
      </div>
      <div id="slider-left" className="mb-8">
        <h3 className="text-lg font-medium mb-4">왼쪽</h3>
        <div>
          {examples[1]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[1]?.description}</div>
          <CodeBlock code={examples[1]?.code || ''} />
        </div>
      </div>
      <div id="slider-top" className="mb-8">
        <h3 className="text-lg font-medium mb-4">위쪽</h3>
        <div>
          {examples[2]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[2]?.description}</div>
          <CodeBlock code={examples[2]?.code || ''} />
        </div>
      </div>
      <div id="slider-bottom" className="mb-8">
        <h3 className="text-lg font-medium mb-4">아래쪽</h3>
        <div>
          {examples[3]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[3]?.description}</div>
          <CodeBlock code={examples[3]?.code || ''} />
        </div>
      </div>
    </DocSection>
  );
};

export default SliderDocs;

