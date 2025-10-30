/**
 * 파일명: PdfViewerExamples.jsx
 * 설명: PdfViewer 컴포넌트 예제
 */
import * as Lib from '@/app/lib';
import { useState } from 'react';

export const PdfViewerExamples = () => {
  const [localFile, setLocalFile] = useState(null);
  const [remoteUrl, setRemoteUrl] = useState('');

  const examples = [
    {
      anchor: 'pdf-basic',
      component: (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">public/SAMPLE.pdf 파일을 제공하면 아래 뷰어로 렌더링됩니다.</p>
          <Lib.PdfViewer src={'/SAMPLE.pdf'} />
        </div>
      ),
      description: 'public 폴더의 SAMPLE.pdf 렌더링',
      code: `<Lib.PdfViewer src={'/SAMPLE.pdf'} />`,
    },
    {
      anchor: 'pdf-local',
      component: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input type="file" accept="application/pdf" onChange={(e) => setLocalFile(e.target.files?.[0] ?? null)} />
          </div>
          {localFile && <Lib.PdfViewer src={localFile} />}
        </div>
      ),
      description: '로컬 파일 선택 후 뷰어로 표시',
      code: `const [file, setFile] = useState(null);
<input type="file" accept="application/pdf" onChange={(e)=>setFile(e.target.files?.[0])} />
{file && <Lib.PdfViewer src={file} />}`,
    },
    {
      anchor: 'pdf-remote',
      component: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              className="border rounded px-2 py-1 text-sm w-[360px]"
              placeholder="https://example.com/sample.pdf"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
            />
          </div>
          {remoteUrl && <Lib.PdfViewer src={remoteUrl} />}
        </div>
      ),
      description: '원격 URL로 PDF 표시(서버 CORS 허용 필요)',
      code: `const [url, setUrl] = useState('');
<input value={url} onChange={(e)=>setUrl(e.target.value)} />
{url && <Lib.PdfViewer src={url} />}`,
    },
  ];

  return examples;
};

