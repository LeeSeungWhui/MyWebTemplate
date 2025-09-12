import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { SkeletonExamples } from '../examples/SkeletonExamples';
import Skeleton from '../../lib/component/Skeleton';

const SkeletonDocs = () => {
  const examples = SkeletonExamples();
  return (
    <DocSection id="skeletons" title="25. 스켈레톤 (Skeleton)" component={Skeleton} description={
      <div>
        <p>로딩 중 콘텐츠 구조를 힌트로 보여주는 플레이스홀더입니다.</p>
        <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
          <li><code>variant?</code>: 'rect' | 'text' | 'circle'</li>
          <li><code>lines?</code>: 텍스트 라인 수 (variant='text')</li>
          <li><code>circleSize?</code>: 원형 크기(px)</li>
          <li><code>className?</code>: 추가 Tailwind 클래스</li>
        </ul>
      </div>
    }>
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

