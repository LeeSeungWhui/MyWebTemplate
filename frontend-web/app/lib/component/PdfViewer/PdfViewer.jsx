"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// Load PDF Viewer only on client to avoid SSR requiring node-canvas
const Viewer = dynamic(
  () => import("@react-pdf-viewer/core").then((m) => m.Viewer),
  { ssr: false },
);
const Worker = dynamic(
  () => import("@react-pdf-viewer/core").then((m) => m.Worker),
  { ssr: false },
);

const isBlobLike = (value) =>
  value &&
  typeof value === "object" &&
  (value instanceof Blob || value instanceof File);

const toObjectUrl = (src) => {
  if (!src) return null;
  if (typeof src === "string") return src;
  if (src instanceof ArrayBuffer) {
    return URL.createObjectURL(new Blob([src], { type: "application/pdf" }));
  }
  if (isBlobLike(src)) return URL.createObjectURL(src);
  return null;
};

const getErrorMessage = (error) => {
  if (!error) return "Failed to load the PDF document.";
  const status =
    error.status ?? error?.response?.status ?? error?.error?.status;
  if (status === 403) return "You do not have permission to view this PDF.";
  if (status === 404) return "The PDF file could not be found.";
  return (
    error.message ?? error?.response?.data?.message ?? "An unexpected error occurred."
  );
};

const PdfViewer = ({
  src,
  workerSrc = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js",
  withToolbar = true,
  initialPage = 1,
  headers,
  style,
  className = "",
  onLoad,
  onError,
  components,
}) => {
  const [objectUrl, setObjectUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const fileUrl = useMemo(() => toObjectUrl(src), [src]);
  const layoutPlugin = useMemo(
    () => (withToolbar ? defaultLayoutPlugin() : null),
    [withToolbar],
  );
  const WorkerComponent = components?.Worker ?? Worker;
  const ViewerComponent = components?.Viewer ?? Viewer;

  useEffect(() => {
    if (!fileUrl) {
      setObjectUrl(null);
      setIsLoading(false);
      setLoadError(null);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    setObjectUrl(fileUrl);

    return () => {
      if (fileUrl.startsWith?.("blob:")) {
        try {
          URL.revokeObjectURL(fileUrl);
        } catch {
          // noop - revoking failures are non-critical
        }
      }
    };
  }, [fileUrl]);

  const handleLoad = useCallback(
    (event) => {
      setIsLoading(false);
      setLoadError(null);
      onLoad?.(event);
    },
    [onLoad],
  );

  const handleError = useCallback(
    (event) => {
      setIsLoading(false);
      const error = event?.error ?? event;
      setLoadError(error);
      onError?.(event);
    },
    [onError],
  );

  if (!objectUrl) {
    return (
      <div
        className={`w-full h-64 flex items-center justify-center text-gray-500 border rounded ${className}`}
        style={style}
        role="status"
        aria-live="polite"
      >
        No PDF source provided.
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className={`w-full h-64 flex flex-col items-center justify-center gap-2 border rounded bg-red-50 text-red-700 p-4 ${className}`}
        style={style}
        role="alert"
        aria-live="assertive"
      >
        <p className="font-medium">Failed to load PDF.</p>
        <p className="text-sm text-red-600">{getErrorMessage(loadError)}</p>
      </div>
    );
  }

  return (
    <div
      className={`w-full h-[70vh] border rounded overflow-hidden relative ${className}`}
      style={style}
      aria-busy={isLoading || undefined}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-gray-600 text-sm">
          Loading PDF...
        </div>
      )}

      <WorkerComponent workerUrl={workerSrc}>
        <ViewerComponent
          fileUrl={objectUrl}
          httpHeaders={headers}
          defaultScale={1}
          initialPage={Math.max(initialPage - 1, 0)}
          onDocumentLoad={handleLoad}
          onDocumentLoadFailed={handleError}
          plugins={layoutPlugin ? [layoutPlugin] : undefined}
        />
      </WorkerComponent>
    </div>
  );
};

export default PdfViewer;
