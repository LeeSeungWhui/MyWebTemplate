/**
 * 파일명: EasyEditorDocs.jsx
 * 작성자: Codex
 * 설명: EasyEditor 컴포넌트 문서
 */
import { EasyEditorExamples } from '../examples/EasyEditorExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const EasyEditorDocs = () => {
  const examples = EasyEditorExamples();

  return (
    <DocSection
      id="editors"
      title="31. 리치 에디터 (EasyEditor)"
      description={
        <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <p>
            <code>EasyEditor</code>는 Tiptap 기반 리치 텍스트 편집기입니다. EasyObj 바인딩과 컨트롤드 모드를 동시에 지원하며,
            기본적으로 JSON 형태로 문서를 직렬화합니다. <code>serialization="html"</code> 또는 <code>"text"</code>로
            직렬화 유형을 변경할 수 있습니다.
          </p>
          <ul className="list-disc pl-5">
            <li><code>dataObj</code> + <code>dataKey</code>: EasyObj 바운드 모드 (JSON 직렬화가 기본)</li>
            <li><code>value</code> + <code>onChange</code>: 컨트롤드 모드</li>
            <li><code>serialization?</code>: <code>'json' | 'html' | 'text'</code> (기본: <code>'json'</code>)</li>
            <li><code>onUploadImage?</code>: 이미지 파일을 업로드하고 URL을 반환하는 비동기 함수</li>
            <li><code>toolbar?</code>: 툴바 표시 여부 (기본: <code>true</code>)</li>
            <li><code>status?</code>: <code>'idle' | 'loading' | 'error' | 'success'</code>, 테두리 스타일을 제어</li>
            <li><code>readOnly?</code>: 읽기 전용 모드</li>
          </ul>
        </div>
      }
    >
      <div className="space-y-10">
        {examples.map((example, index) => (
          <div
            key={index}
            id={example.anchor}
            className="space-y-3 scroll-mt-24"
          >
            <div>{example.component}</div>
            <p className="text-sm text-gray-600">{example.description}</p>
            <CodeBlock code={example.code} />
          </div>
        ))}
      </div>
    </DocSection>
  );
};

export default EasyEditorDocs;
