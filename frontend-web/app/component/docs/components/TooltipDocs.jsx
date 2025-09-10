/**
 * 파일명: TooltipDocs.jsx
 * 작성자: ChatGPT
 * 갱신일: 2025-02-14
 * 설명: 툴팁 문서 섹션
 */
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { TooltipExamples } from '../examples/TooltipExamples';

const TooltipDocs = () => {
  const examples = TooltipExamples();
  return (
    <DocSection id="tooltips" title="23. 툴팁 (Tooltip)" description={<p>hover/focus/클릭에 반응하는 간단한 툴팁.</p>}>
      <div id="tooltip-basic" className="mb-8">
        <h3 className="text-lg font-medium mb-4">기본</h3>
        <div>
          {examples[0]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[0]?.description}</div>
          <CodeBlock code={examples[0]?.code || ''} />
        </div>
      </div>
      <div id="tooltip-placement" className="mb-8">
        <h3 className="text-lg font-medium mb-4">방향</h3>
        <div>
          {examples[1]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[1]?.description}</div>
          <CodeBlock code={examples[1]?.code || ''} />
        </div>
      </div>
      <div id="tooltip-trigger" className="mb-8">
        <h3 className="text-lg font-medium mb-4">트리거</h3>
        <div>
          {examples[2]?.component}
          <div className="mt-2 text-sm text-gray-600">{examples[2]?.description}</div>
          <CodeBlock code={examples[2]?.code || ''} />
        </div>
      </div>
    </DocSection>
  );
};

export default TooltipDocs;

