/**
 * 파일명: TooltipDocs.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 툴팁 문서 섹션
 */
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { TooltipExamples } from '../examples/TooltipExamples';

/**
 * Tooltip 문서 섹션
 * @date 2025-09-13
 */
const TooltipDocs = () => {
  const examples = TooltipExamples();
  return (
    <DocSection id="tooltips" title="20. 툴팁 (Tooltip)" description={
      <div>
        <p>hover, focus 또는 클릭에 반응하는 간단한 툴팁입니다.</p>
        <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
          <li><code>content</code>: 툴팁 내용</li>
          <li><code>placement?</code>: 위치 'top' | 'bottom' | 'left' | 'right'</li>
          <li><code>trigger?</code>: 'hover' | 'click' | 'focus'</li>
          <li><code>delay?</code>: 표시 지연(ms)</li>
          <li><code>disabled?</code>: 비활성화 여부</li>
          <li><code>textDirection?</code>: 텍스트 방향 'lr' | 'tb'</li>
          <li><code>className?</code>: 추가 Tailwind 클래스</li>
          <li><code>children?</code>: 트리거 요소</li>
        </ul>
      </div>
    }>
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
