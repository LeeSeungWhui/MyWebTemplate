/**
 * 파일명: PdfViewerExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-24
 * 설명: PdfViewer 컴포넌트 예제
 */
import * as Lib from '@/app/lib';
import { useState } from 'react';

/**
 * @description  PdfViewerExamples 구성 데이터를 반환한다. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 입력값과 상태를 검증해 UI/데이터 흐름을 안전하게 유지한다.
 */
export const PdfViewerExamples = () => {
  const [localFile, setLocalFile] = useState(null);
  const [remoteUrl, setRemoteUrl] = useState('');

  const examples = [
    {
      anchor: 'pdf-basic',
      component: (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">public/pdf-sample.pdf 파일이 제공되면 아래 뷰어가 렌더링됩니다.</p>
          <Lib.PdfViewer src={'/pdf-sample.pdf'} />
        </div>
      ),
      description: 'public 폴더의 pdf-sample.pdf 미리보기',
      code: `<Lib.PdfViewer src={'/pdf-sample.pdf'} />`,
    },
    {
      anchor: 'pdf-no-toolbar',
      component: (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">툴바 비활성화(페이지/검색/줌 UI 숨김)</p>
          <Lib.PdfViewer src={'/pdf-sample.pdf'} withToolbar={false} />
        </div>
      ),
      description: 'withToolbar=false 예시',
      code: `<Lib.PdfViewer src={'/pdf-sample.pdf'} withToolbar={false} />`,
    },
    {
      anchor: 'pdf-local',
      component: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input type="file" accept="application/pdf" onChange={(event) => setLocalFile(event.target.files?.[0] ?? null)} />
          </div>
          {localFile && <Lib.PdfViewer src={localFile} />}
        </div>
      ),
      description: '로컬 파일 선택 후 뷰어로 표시',
      code: `const [file, setFile] = useState(null);
<input type="file" accept="application/pdf" onChange={(event)=>setFile(event.target.files?.[0])} />
{file && <Lib.PdfViewer src={file} />}`,
    },
    {
      anchor: 'pdf-remote',
      component: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              className="w-full max-w-md border rounded px-2 py-1 text-sm"
              placeholder="https://example.com/sample.pdf"
              value={remoteUrl}
              onChange={(event) => setRemoteUrl(event.target.value)}
            />
          </div>
          {remoteUrl && <Lib.PdfViewer src={remoteUrl} />}
        </div>
      ),
      description: '원격 URL로 PDF 표시(서버 CORS 허용 필요)',
      code: `const [url, setUrl] = useState('');
<input value={url} onChange={(event)=>setUrl(event.target.value)} />
{url && <Lib.PdfViewer src={url} />}`,
    },
    {
      anchor: 'pdf-error',
      component: (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">오류 상태(404) 시 Empty 안내로 대체</p>
          <Lib.PdfViewer src={'/not-exists.pdf'} />
        </div>
      ),
      description: '404/네트워크 오류시 오류 안내 렌더링',
      code: `<Lib.PdfViewer src={'/not-exists.pdf'} />`,
    },
  ];

  return examples;
};
