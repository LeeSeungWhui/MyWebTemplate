/**
 * 파일명: PdfViewerDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: PdfViewer 컴포넌트 문서
 */
import { pdfViewerExampleList } from '../examples/PdfViewerExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

/**
 * @description PdfViewer 문서 섹션을 구성하고 예제 목록을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const PdfViewerDocs = () => {
  return <DocSection id="pdfviewer" title="33. PDF 뷰어 (PdfViewer)" description={<div className="space-y-3 rounded-xl bg-slate-50/80 p-5 text-sm text-slate-700 ring-1 ring-slate-900/5">
          <p>로컬 파일 또는 외부 URL의 PDF를 미리봅니다. public/pdf-sample.pdf 예제가 포함되어 있습니다.</p>
          <ul className="list-disc space-y-1 pl-5 text-slate-500">
            <li>Props: <code className="rounded bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">src</code>(string|File|Blob|ArrayBuffer), <code className="rounded bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">workerSrc?</code>, <code className="rounded bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">withToolbar?</code></li>
            <li>외부 URL은 CORS 허용이 필요합니다.</li>
          </ul>
        </div>}>
      <div className="space-y-10">
        {pdfViewerExampleList.map((exampleItem, index) => <div key={exampleItem.anchor} id={exampleItem.anchor} className="space-y-4 scroll-mt-24">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Example {index + 1}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">{exampleItem.description}</p>
            </div>
            <div className="rounded-2xl bg-slate-50/80 p-5 shadow-sm ring-1 ring-slate-900/5">
              {exampleItem.component}
            </div>
            <CodeBlock code={exampleItem.code} />
          </div>)}
      </div>
    </DocSection>;
};

export default PdfViewerDocs;
