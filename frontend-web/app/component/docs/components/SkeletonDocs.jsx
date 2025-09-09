import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { SkeletonExamples } from '../examples/SkeletonExamples';

const SkeletonDocs = () => {
  const examples = SkeletonExamples();
  return (
    <DocSection id="skeletons" title="25. 스켈레톤 (Skeleton)" description={<p>로딩 중 콘텐츠 구조를 힌트로 보여주는 플레이스홀더.</p>}>
      <div id="skeleton-text" className="mb-8">
        <h3 className="text-lg font-medium mb-4">텍스트</h3>
        <div>
          {examples[0]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[0]?.description}</div>
          <CodeBlock code={examples[0]?.code || ''} />
        </div>
      </div>
      <div id="skeleton-composed" className="mb-8">
        <h3 className="text-lg font-medium mb-4">아바타 + 텍스트</h3>
        <div>
          {examples[1]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[1]?.description}</div>
          <CodeBlock code={examples[1]?.code || ''} />
        </div>
      </div>
      <div id="skeleton-card" className="mb-8">
        <h3 className="text-lg font-medium mb-4">카드 스켈레톤</h3>
        <div>
          {examples[2]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[2]?.description}</div>
          <CodeBlock code={examples[2]?.code || ''} />
        </div>
      </div>
    </DocSection>
  );
};

export default SkeletonDocs;

