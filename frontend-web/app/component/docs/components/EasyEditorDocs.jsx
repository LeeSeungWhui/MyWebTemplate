/**
 * EasyEditorDocs.jsx
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
            <code>EasyEditor</code>는 Tiptap 기반 리치 텍스트 편집기로, EasyObj 바인딩과 컨트롤드 모드를 동시에 지원합니다.
            기본 직렬화는 JSON이며 <code>serialization="html" | "text"</code>로 출력 형태를 바꿀 수 있습니다.
            툴바에서는 글꼴 크기, 색상, 정렬, 링크, 이미지/파일 첨부, Editor/HTML 모드를 제공하며 확장 목록을 통해 기능을 늘릴 수 있습니다.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><code>dataObj</code> + <code>dataKey</code>: EasyObj 바운드 모드 (JSON이 기본 저장 포맷)</li>
            <li><code>value</code> + <code>onChange</code>: 컨트롤드 모드</li>
            <li><code>serialization?</code>: <code>'json' | 'html' | 'text'</code> (기본: <code>'json'</code>)</li>
            <li><code>extensions?</code>: Tiptap Extension 배열 (메모이즈되어 에디터가 재생성되지 않음)</li>
            <li><code>imageUploadUrl?</code>, <code>fileUploadUrl?</code>: 업로드 엔드포인트 힌트 (템플릿에선 Alert 안내)</li>
            <li><code>onUploadImage?</code>, <code>onUploadFile?</code>: 커스텀 업로드 함수 구현 지점</li>
            <li><code>toolbar?</code>: 툴바 표시 여부 (기본: <code>true</code>)</li>
            <li><code>status?</code>: <code>'idle' | 'loading' | 'error' | 'success'</code>, 테두리 상태를 제어</li>
            <li><code>readOnly?</code>: 읽기 전용 모드 (HTML 모드 및 툴바 비활성화)</li>
            <li>Editor/HTML 모드 토글을 통해 HTML을 직접 수정할 수 있고, 동시에 EasyObj에 반영됩니다.</li>
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
