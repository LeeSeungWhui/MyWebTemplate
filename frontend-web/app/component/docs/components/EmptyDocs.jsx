/**
 * 파일명: EmptyDocs.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Empty 컴포넌트 문서
 */
/**
 * 파일명: EmptyDocs.jsx
 * 설명: Empty 상태 컴포넌트 문서
 */
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { EmptyExamples } from '../examples/EmptyExamples';

const EmptyDocs = () => {
  const examples = EmptyExamples();
  return (
    <DocSection id="empties" title="26. 엠티 (Empty)" description={
      <div>
        <p>데이터가 없을 때 안내와 액션을 제공합니다.</p>
        <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
          <li><code>icon?</code>: 상단 아이콘 (react-icons)</li>
          <li><code>title?</code>: 제목 텍스트</li>
          <li><code>description?</code>: 부가 설명</li>
          <li><code>children?</code>: 추가 내용</li>
          <li><code>action?</code>: 버튼 등 액션 요소</li>
          <li><code>className?</code>: 추가 Tailwind 클래스</li>
        </ul>
      </div>
    }>
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

