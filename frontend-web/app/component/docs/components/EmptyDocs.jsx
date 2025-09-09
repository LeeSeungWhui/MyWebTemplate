import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { EmptyExamples } from '../examples/EmptyExamples';

const EmptyDocs = () => {
  const examples = EmptyExamples();
  return (
    <DocSection id="empties" title="26. 엠티 (Empty)" description={<p>데이터가 없을 때 안내와 액션을 제공.</p>}>
      <div id="empty-basic" className="mb-8">
        <h3 className="text-lg font-medium mb-4">기본</h3>
        <div>
          {examples[0]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[0]?.description}</div>
          <CodeBlock code={examples[0]?.code || ''} />
        </div>
      </div>
      <div id="empty-action" className="mb-8">
        <h3 className="text-lg font-medium mb-4">설명/액션</h3>
        <div>
          {examples[1]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[1]?.description}</div>
          <CodeBlock code={examples[1]?.code || ''} />
        </div>
      </div>
    </DocSection>
  );
};

export default EmptyDocs;

