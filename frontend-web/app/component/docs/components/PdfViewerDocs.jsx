/**
 * 파일명: PdfViewerDocs.jsx
 * 설명: PdfViewer 컴포넌트 문서
 */
import { PdfViewerExamples } from '../examples/PdfViewerExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const PdfViewerDocs = () => {
  const examples = PdfViewerExamples();
  return (
    <DocSection
      id="pdfviewer"
      title="32. PDF 뷰어 (PdfViewer)"
      description={
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            로컬 파일 또는 외부 URL의 PDF를 미리봅니다. public 폴더의 pdf-sample.pdf를 사용하면 기본 예제가 렌더링됩니다.
          </p>
          <ul className="list-disc pl-5">
            <li>Props: <code>src</code>(string|File|Blob|ArrayBuffer), <code>workerSrc?</code>, <code>withToolbar?</code></li>
            <li>외부 URL은 CORS가 허용되어야 합니다.</li>
          </ul>
        </div>
      }
    >
      <div className="space-y-10">
        {examples.map((e, i) => (
          <div key={i} id={e.anchor} className="space-y-3 scroll-mt-24">
            <div>{e.component}</div>
            <p className="text-sm text-gray-600">{e.description}</p>
            <CodeBlock code={e.code} />
          </div>
        ))}
      </div>
    </DocSection>
  );
};

export default PdfViewerDocs;

