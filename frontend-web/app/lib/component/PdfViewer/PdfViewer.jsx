"use client";

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import '@react-pdf-viewer/core/lib/styles/index.css';

// Load PDF Viewer only on client to avoid SSR requiring node-canvas
const Viewer = dynamic(() => import('@react-pdf-viewer/core').then((m) => m.Viewer), { ssr: false });
const Worker = dynamic(() => import('@react-pdf-viewer/core').then((m) => m.Worker), { ssr: false });

const isBlobLike = (v) => v && typeof v === 'object' && (v instanceof Blob || v instanceof File);

const toObjectUrl = (src) => {
  if (!src) return null;
  if (typeof src === 'string') return src;
  if (src instanceof ArrayBuffer) return URL.createObjectURL(new Blob([src], { type: 'application/pdf' }));
  if (isBlobLike(src)) return URL.createObjectURL(src);
  return null;
};

const PdfViewer = ({
  src,
  workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
  withToolbar = true,
  initialPage = 1,
  headers,
  style,
  className = '',
  onLoad,
  onError,
}) => {
  const [objectUrl, setObjectUrl] = useState(null);

  const fileUrl = useMemo(() => toObjectUrl(src), [src]);

  useEffect(() => {
    setObjectUrl(fileUrl);
    return () => {
      if (fileUrl && typeof fileUrl === 'string' && fileUrl.startsWith('blob:')) {
        try { URL.revokeObjectURL(fileUrl); } catch {}
      }
    };
  }, [fileUrl]);

  if (!objectUrl) {
    return (
      <div className={`w-full h-64 flex items-center justify-center text-gray-500 border rounded ${className}`} style={style}>
        PDF 소스를 지정하세요.
      </div>
    );
  }

  return (
    <div className={`w-full h-[70vh] border rounded overflow-hidden ${className}`} style={style}>
      <Worker workerUrl={workerSrc}>
        <Viewer
          fileUrl={objectUrl}
          httpHeaders={headers}
          defaultScale={1}
          initialPage={initialPage - 1}
          onDocumentLoad={(e) => onLoad?.(e)}
          onDocumentLoadFailed={(e) => onError?.(e)}
        />
      </Worker>
    </div>
  );
};

export default PdfViewer;

