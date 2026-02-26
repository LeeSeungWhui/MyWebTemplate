"use client";
/**
 * 파일명: PdfViewer.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-24
 * 설명: PDF 렌더링 컴포넌트
 */

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import Empty from '../Empty.jsx';
import { COMMON_COMPONENT_LANG_KO } from '@/app/common/i18n/lang.ko';

// Viewer/Worker stay client-only to avoid node-canvas crashes under SSR
const Viewer = dynamic(() => import('@react-pdf-viewer/core').then((m) => m.Viewer), { ssr: false });
const Worker = dynamic(() => import('@react-pdf-viewer/core').then((m) => m.Worker), { ssr: false });

const isBlobLike = (value) => value && typeof value === 'object' && (value instanceof Blob || value instanceof File);

const toObjectUrl = (src) => {
  if (!src) return null;
  if (typeof src === 'string') return src;
  if (src instanceof ArrayBuffer) {
    return URL.createObjectURL(new Blob([src], { type: 'application/pdf' }));
  }
  if (isBlobLike(src)) return URL.createObjectURL(src);
  return null;
};

const initialDocumentState = (initialPage = 1) => ({
  currentPage: initialPage,
  totalPages: 0,
  zoom: 1,
});

const normalizeInitialPage = (page) => {
  if (typeof page !== 'number' || Number.isNaN(page)) return 1;
  return page < 1 ? 1 : Math.floor(page);
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
  const normalizedInitialPage = normalizeInitialPage(initialPage);
  const [objectUrl, setObjectUrl] = useState(null);
  const [viewerError, setViewerError] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(src));
  const [documentState, setDocumentState] = useState(() => initialDocumentState(normalizedInitialPage));
  // Initialize toolbar plugin at the top level (not inside another hook)
  const defaultLayoutPluginInstance = withToolbar
    ? defaultLayoutPlugin({ renderToolbar: (Toolbar) => <Toolbar /> })
    : null;

  const plugins = useMemo(() => (defaultLayoutPluginInstance ? [defaultLayoutPluginInstance] : []), [defaultLayoutPluginInstance]);

  // No dynamic import for plugin; created synchronously above.

  useEffect(() => {
    const nextFileUrl = toObjectUrl(src);
    setObjectUrl(nextFileUrl);
    return () => {
      if (nextFileUrl && typeof nextFileUrl === 'string' && nextFileUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(nextFileUrl);
        } catch {
          // Ignore revoke failures
        }
      }
    };
  }, [src]);

  useEffect(() => {
    if (!objectUrl) {
      setIsLoading(false);
      return;
    }
    setViewerError(null);
    setIsLoading(true);
    setDocumentState(initialDocumentState(normalizedInitialPage));
  }, [objectUrl, normalizedInitialPage]);

  const describeDocumentStatus = () => {
    if (viewerError) return COMMON_COMPONENT_LANG_KO.pdfViewer.loadFailedStatus;
    if (!objectUrl) return COMMON_COMPONENT_LANG_KO.pdfViewer.sourceUnavailableStatus;
    if (isLoading || documentState.totalPages === 0) {
      return COMMON_COMPONENT_LANG_KO.pdfViewer.loadingStatus;
    }
    if (documentState.totalPages > 0) {
      const zoomPercent = Math.round(documentState.zoom * 100);
      return `총 ${documentState.totalPages}페이지 중 ${documentState.currentPage}페이지, 확대 ${zoomPercent}%`;
    }
    return COMMON_COMPONENT_LANG_KO.pdfViewer.readyStatus;
  };

  const handleDocumentLoad = (event) => {
    setIsLoading(false);
    setDocumentState((prev) => ({
      ...prev,
      totalPages: event?.doc?.numPages ?? prev.totalPages,
    }));
    onLoad?.(event);
  };

  const handleDocumentLoadFailed = (event) => {
    setIsLoading(false);
    setViewerError(event?.error ?? event);
    onError?.(event);
  };

  const handlePageChange = (event) => {
    setDocumentState((prev) => ({
      ...prev,
      currentPage: (event?.currentPage ?? 0) + 1,
      totalPages: event?.doc?.numPages ?? prev.totalPages,
    }));
  };

  const handleZoom = (event) => {
    if (!event?.scale) return;
    setDocumentState((prev) => ({
      ...prev,
      zoom: event.scale,
    }));
  };

  const errorStatusCode = (() => {
    const { status, statusCode } = viewerError ?? {};
    if (typeof status === 'number') return status;
    if (typeof statusCode === 'number') return statusCode;
    return null;
  })();

  const errorMessage = (() => {
    if (!viewerError) return null;
    if (typeof viewerError === 'string') return viewerError;
    if (viewerError?.message) return viewerError.message;
    if (viewerError?.name) return `${viewerError.name} error`;
    return COMMON_COMPONENT_LANG_KO.pdfViewer.loadFailedDescription;
  })();

  const shouldRenderViewer = Boolean(objectUrl) && !viewerError;
  const showMissingSource = !viewerError && !objectUrl && !isLoading;

  return (
    <div
      className={`relative w-full h-[70vh] border rounded overflow-hidden bg-white ${className}`.trim()}
      style={style}
      role="document"
      aria-label={COMMON_COMPONENT_LANG_KO.pdfViewer.ariaLabel}
      aria-busy={isLoading ? 'true' : 'false'}
      data-page={documentState.currentPage}
      data-page-count={documentState.totalPages}
      data-zoom={documentState.zoom.toFixed(2)}
    >
      <span className="sr-only" aria-live="polite">
        {describeDocumentStatus()}
      </span>

      {isLoading && !viewerError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75 backdrop-blur-sm" aria-hidden="true">
          <div className="flex flex-col items-center gap-3 text-gray-600">
            <svg
              className="h-6 w-6 animate-spin text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="text-sm font-medium">{COMMON_COMPONENT_LANG_KO.pdfViewer.loadingText}</span>
          </div>
        </div>
      )}

      {viewerError && (
        <div className="flex h-full w-full items-center justify-center bg-gray-50 px-6 py-8">
          <Empty
            className="max-w-sm"
            title={errorStatusCode
              ? `${COMMON_COMPONENT_LANG_KO.pdfViewer.loadFailedTitle} (HTTP ${errorStatusCode})`
              : COMMON_COMPONENT_LANG_KO.pdfViewer.loadFailedTitle}
            description={errorMessage ?? COMMON_COMPONENT_LANG_KO.pdfViewer.loadFailedDescription}
            data-status-code={errorStatusCode ?? undefined}
          />
        </div>
      )}

      {showMissingSource && (
        <div className="flex h-full w-full items-center justify-center bg-gray-50 px-6 py-8">
          <Empty
            className="max-w-sm"
            title={COMMON_COMPONENT_LANG_KO.pdfViewer.missingSourceTitle}
            description={COMMON_COMPONENT_LANG_KO.pdfViewer.missingSourceDescription}
          />
        </div>
      )}

      {shouldRenderViewer && (
        <Worker workerUrl={workerSrc}>
          <Viewer
            fileUrl={objectUrl}
            httpHeaders={headers}
            defaultScale={1}
            initialPage={normalizedInitialPage - 1}
            onDocumentLoad={handleDocumentLoad}
            onDocumentLoadFailed={handleDocumentLoadFailed}
            onPageChange={handlePageChange}
            onZoom={handleZoom}
            plugins={plugins}
          />
        </Worker>
      )}
    </div>
  );
};

/**
 * @description PdfViewer export를 노출한다.
 */
export default PdfViewer;
