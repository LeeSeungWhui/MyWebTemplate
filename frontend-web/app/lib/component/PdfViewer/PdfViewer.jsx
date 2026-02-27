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

// 한글설명: Viewer/Worker stay client-only to avoid node-canvas crashes under SSR
const Viewer = dynamic(() => import('@react-pdf-viewer/core').then((m) => m.Viewer), { ssr: false });
const Worker = dynamic(() => import('@react-pdf-viewer/core').then((m) => m.Worker), { ssr: false });

/**
 * @description 값이 Blob/File 계열 객체인지 판별한다.
 * 처리 규칙: object 타입이면서 `instanceof Blob|File`인 경우만 true를 반환한다.
 * @updated 2026-02-27
 */
const isBlobLike = (value) => value && typeof value === 'object' && (value instanceof Blob || value instanceof File);

/**
 * @description src 입력을 Viewer가 읽을 수 있는 URL 문자열로 변환한다.
 * 처리 규칙: string은 그대로, ArrayBuffer/Blob/File은 `URL.createObjectURL`로 변환한다.
 * @updated 2026-02-27
 */
const toObjectUrl = (src) => {
  if (!src) return null;
  if (typeof src === 'string') return src;
  if (src instanceof ArrayBuffer) {
    return URL.createObjectURL(new Blob([src], { type: 'application/pdf' }));
  }
  if (isBlobLike(src)) return URL.createObjectURL(src);
  return null;
};

/**
 * @description 문서 상태 기본값 객체를 생성한다.
 * 처리 규칙: currentPage/totalPages/zoom 기본 필드를 초기 페이지 기준으로 구성해 반환한다.
 * @updated 2026-02-27
 */
const initialDocumentState = (initialPage = 1) => ({
  currentPage: initialPage,
  totalPages: 0,
  zoom: 1,
});

/**
 * @description 초기 페이지 번호를 안전한 정수로 정규화한다.
 * 처리 규칙: 숫자가 아니거나 NaN이면 1, 1 미만 값은 1로 보정한다.
 * @updated 2026-02-27
 */
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
  // 한글설명: Initialize toolbar plugin at the top level (not inside another hook)
  const defaultLayoutPluginInstance = withToolbar
    ? defaultLayoutPlugin({ renderToolbar: (Toolbar) => <Toolbar /> })
    : null;

  const plugins = useMemo(() => (defaultLayoutPluginInstance ? [defaultLayoutPluginInstance] : []), [defaultLayoutPluginInstance]);

  // 한글설명: No dynamic import for plugin; created synchronously above.

  useEffect(() => {
    const nextFileUrl = toObjectUrl(src);
    setObjectUrl(nextFileUrl);
    return () => {
      if (nextFileUrl && typeof nextFileUrl === 'string' && nextFileUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(nextFileUrl);
        } catch {
          // 한글설명: Ignore revoke failures
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

  /**
   * @description 현재 PDF 뷰어 상태를 접근성 안내 문구로 생성한다.
   * 처리 규칙: error/source/loading/ready 상태 우선순위로 분기해 aria-live용 문자열을 반환한다.
   * @updated 2026-02-27
   */
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

  /**
   * @description 문서 로드 성공 이벤트를 반영한다.
   * 처리 규칙: loading을 해제하고 totalPages를 업데이트한 뒤 외부 onLoad 콜백을 호출한다.
   * @updated 2026-02-27
   */
  const handleDocumentLoad = (event) => {
    setIsLoading(false);
    setDocumentState((prev) => ({
      ...prev,
      totalPages: event?.doc?.numPages ?? prev.totalPages,
    }));
    onLoad?.(event);
  };

  /**
   * @description 문서 로드 실패 이벤트를 반영한다.
   * 처리 규칙: loading을 해제하고 viewerError를 저장한 뒤 외부 onError 콜백을 호출한다.
   * @updated 2026-02-27
   */
  const handleDocumentLoadFailed = (event) => {
    setIsLoading(false);
    setViewerError(event?.error ?? event);
    onError?.(event);
  };

  /**
   * @description 페이지 변경 이벤트를 상태에 반영한다.
   * 처리 규칙: currentPage를 1-based로 보정해 저장하고 totalPages도 함께 동기화한다.
   * @updated 2026-02-27
   */
  const handlePageChange = (event) => {
    setDocumentState((prev) => ({
      ...prev,
      currentPage: (event?.currentPage ?? 0) + 1,
      totalPages: event?.doc?.numPages ?? prev.totalPages,
    }));
  };

  /**
   * @description 확대/축소 이벤트를 상태에 반영한다.
   * 처리 규칙: 유효한 scale 값이 있을 때만 zoom 상태를 갱신한다.
   * @updated 2026-02-27
   */
  const handleZoom = (event) => {
    if (!event?.scale) return;
    setDocumentState((prev) => ({
      ...prev,
      zoom: event.scale,
    }));
  };

  /**
   * @description 에러 객체에서 HTTP 상태코드를 추출한다.
   * 처리 규칙: `status` 우선, 없으면 `statusCode`를 확인하고 둘 다 없으면 null을 반환한다.
   * @updated 2026-02-27
   */
  const errorStatusCode = (() => {
    const { status, statusCode } = viewerError ?? {};
    if (typeof status === 'number') return status;
    if (typeof statusCode === 'number') return statusCode;
    return null;
  })();

  /**
   * @description 에러 객체를 사용자 표시용 메시지로 변환한다.
   * 처리 규칙: string > message > name 순서로 fallback 하며 모두 없으면 기본 문구를 반환한다.
   * @updated 2026-02-27
   */
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
 * @description PdfViewer 컴포넌트 엔트리를 외부에 노출한다.
 * 처리 규칙: 상태/이벤트 핸들러가 연결된 PdfViewer 컴포넌트를 default export 한다.
 */
export default PdfViewer;
