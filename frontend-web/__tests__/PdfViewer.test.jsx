/**
 * 파일명: PdfViewer.test.jsx
 * 작성자: LSH
 * 갱신일: 2025-11-04
 * 설명: PdfViewer 컴포넌트의 렌더링 및 오류 처리 동작 검증
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PdfViewer from '../app/lib/component/PdfViewer/PdfViewer.jsx';
import { COMMON_COMPONENT_LANG_KO } from '../app/common/i18n/lang.ko';

const defaultLayoutPluginMock = vi.hoisted(() => vi.fn(() => {
  const ReactLib = require('react');
  ReactLib.useMemo(() => ({ created: true }), []);
  return {
    name: 'default-layout-plugin',
    instanceId: Symbol('default-layout-plugin'),
  };
}));
const pluginIdentityMap = vi.hoisted(() => new Map());
const viewerInitialPageHistory = vi.hoisted(() => []);

vi.mock('next/dynamic', () => {
  const ReactLib = require('react');
  return {
    __esModule: true,
    default: (importer) => {
      const DynamicComponent = (props) => {
        const [Component, setComponent] = ReactLib.useState(null);

        ReactLib.useEffect(() => {
          let mounted = true;
          importer().then((loaded) => {
            if (!mounted) return;
            const Resolved = loaded?.default ?? loaded;
            setComponent(() => Resolved);
          });
          return () => {
            mounted = false;
          };
        }, []);

        if (!Component) return null;
        return <Component {...props} />;
      };
      return DynamicComponent;
    },
  };
});

vi.mock('@react-pdf-viewer/core', () => {
  const ReactLib = require('react');

  const Viewer = ({
    fileUrl,
    httpHeaders,
    initialPage,
    onDocumentLoad,
    onPageChange,
    onZoom,
    plugins = [],
    renderError,
  }) => {
    const shouldRenderError = Boolean(fileUrl?.includes('error'));
    viewerInitialPageHistory.push(initialPage);
    const plugin = plugins[0];
    if (plugin && !pluginIdentityMap.has(plugin.instanceId)) {
      pluginIdentityMap.set(plugin.instanceId, pluginIdentityMap.size + 1);
    }

    ReactLib.useEffect(() => {
      if (!fileUrl || shouldRenderError) return;
      onDocumentLoad?.({ doc: { numPages: 3 } });
      onPageChange?.({ currentPage: initialPage, doc: { numPages: 3 } });
      onZoom?.({ scale: 1.25 });
    }, [fileUrl, initialPage, shouldRenderError]);

    if (shouldRenderError) {
      return renderError?.({ message: '403 Forbidden', status: 403 }) ?? null;
    }

    return (
      <div
        data-testid="mock-viewer"
        data-plugins={plugins.length}
        data-plugin-id={plugin ? pluginIdentityMap.get(plugin.instanceId) : ''}
        data-initial-page={initialPage}
        data-headers={JSON.stringify(httpHeaders ?? {})}
      >
        mock-viewer
      </div>
    );
  };

  const Worker = ({ children }) => <div data-testid="mock-worker">{children}</div>;

  return {
    __esModule: true,
    Viewer,
    Worker,
  };
});

vi.mock('@react-pdf-viewer/default-layout', () => ({
  __esModule: true,
  defaultLayoutPlugin: defaultLayoutPluginMock,
}));

describe('PdfViewer', () => {
  const originalCreateObjectUrl = URL.createObjectURL;
  const originalRevokeObjectUrl = URL.revokeObjectURL;
  const createObjectUrlMock = vi.fn();
  const revokeObjectUrlMock = vi.fn();

  beforeEach(() => {
    defaultLayoutPluginMock.mockClear();
    pluginIdentityMap.clear();
    viewerInitialPageHistory.length = 0;
    createObjectUrlMock.mockReset();
    revokeObjectUrlMock.mockReset();
    createObjectUrlMock.mockImplementation((source) => `blob:mock-${source?.size ?? source?.byteLength ?? 'source'}-${createObjectUrlMock.mock.calls.length}`);
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectUrlMock });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectUrlMock });
  });

  afterAll(() => {
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: originalCreateObjectUrl });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: originalRevokeObjectUrl });
  });

  it('renders viewer, updates page data, and clears loading state', async () => {
    render(<PdfViewer src="document.pdf" withToolbar={false} />);

    await waitFor(() => {
      const region = screen.getByRole('document', { name: COMMON_COMPONENT_LANG_KO.pdfViewer.ariaLabel });
      expect(region).toHaveAttribute('data-page', '1');
      expect(region).toHaveAttribute('data-page-count', '3');
      expect(region).toHaveAttribute('data-zoom', '1.25');
    });

    const viewer = await waitFor(() => screen.getByTestId('mock-viewer'));
    expect(viewer.dataset.plugins).toBe('0');
    expect(defaultLayoutPluginMock).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByText(COMMON_COMPONENT_LANG_KO.pdfViewer.loadingText)).not.toBeInTheDocument();
    });
  });

  it('shows empty state with status when document fails to load', async () => {
    render(<PdfViewer src="error-document.pdf" withToolbar={false} />);

    const emptyState = await screen.findByText(new RegExp(COMMON_COMPONENT_LANG_KO.pdfViewer.loadFailedTitle));
    expect(emptyState).toBeInTheDocument();

    await waitFor(() => {
      const viewerRegion = screen.getByRole('document', { name: COMMON_COMPONENT_LANG_KO.pdfViewer.ariaLabel });
      expect(viewerRegion).toHaveAttribute('aria-busy', 'false');
    });

    expect(screen.queryByText(COMMON_COMPONENT_LANG_KO.pdfViewer.loadingText)).not.toBeInTheDocument();
    expect(emptyState.closest('[data-status-code]')).toHaveAttribute('data-status-code', '403');
  });

  it('binds default-layout toolbar plugin when enabled', async () => {
    render(<PdfViewer src="toolbar.pdf" />);

    await waitFor(() => {
      expect(defaultLayoutPluginMock).toHaveBeenCalled();
    });

    const viewer = await waitFor(() => screen.getByTestId('mock-viewer'));
    expect(viewer.dataset.plugins).toBe('1');
    expect(defaultLayoutPluginMock).toHaveBeenCalled();
  });

  it('keeps one toolbar plugin identity across load, page, zoom, src, and error rerenders', async () => {
    const { rerender } = render(<PdfViewer src="first.pdf" />);

    const firstViewer = await screen.findByTestId('mock-viewer');
    await waitFor(() => {
      expect(screen.getByRole('document')).toHaveAttribute('data-page-count', '3');
      expect(screen.getByRole('document')).toHaveAttribute('data-zoom', '1.25');
    });
    expect(firstViewer.dataset.pluginId).toBe('1');
    const callCountAfterLoad = defaultLayoutPluginMock.mock.calls.length;
    expect(callCountAfterLoad).toBeGreaterThan(1);

    rerender(<PdfViewer src="second.pdf" />);
    const secondViewer = await screen.findByTestId('mock-viewer');
    expect(secondViewer.dataset.pluginId).toBe('1');
    expect(defaultLayoutPluginMock.mock.calls.length).toBeGreaterThan(callCountAfterLoad);

    rerender(<PdfViewer src="error-second.pdf" />);
    await screen.findByText(new RegExp(COMMON_COMPONENT_LANG_KO.pdfViewer.loadFailedTitle));
    expect(defaultLayoutPluginMock.mock.calls.length).toBeGreaterThan(callCountAfterLoad);
  });

  it('renders a clear missing-source state without creating a toolbar plugin when disabled', () => {
    render(<PdfViewer withToolbar={false} />);

    expect(screen.getByText(COMMON_COMPONENT_LANG_KO.pdfViewer.missingSourceTitle)).toBeInTheDocument();
    expect(screen.getByRole('document')).toHaveAttribute('aria-busy', 'false');
    expect(defaultLayoutPluginMock).toHaveBeenCalled();
    expect(createObjectUrlMock).not.toHaveBeenCalled();
  });

  it('normalizes initialPage, passes headers, and forwards load callbacks', async () => {
    const onLoad = vi.fn();
    render(<PdfViewer src="secured.pdf" initialPage={3.8} headers={{ Authorization: 'Bearer test' }} onLoad={onLoad} />);

    await waitFor(() => expect(screen.getByTestId('mock-viewer')).toHaveAttribute('data-initial-page', '2'));
    expect(screen.getByTestId('mock-viewer')).toHaveAttribute('data-headers', JSON.stringify({ Authorization: 'Bearer test' }));
    await waitFor(() => expect(onLoad).toHaveBeenCalledWith(expect.objectContaining({ doc: { numPages: 3 } })));
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('document')).toHaveAttribute('data-page', '3');
  });

  it('fires onLoad again when the same URL is detached and reattached', async () => {
    const onLoad = vi.fn();
    const { rerender } = render(<PdfViewer src="same.pdf" initialPage={3} onLoad={onLoad} />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-viewer')).toHaveAttribute('data-initial-page', '2');
      expect(onLoad).toHaveBeenCalledTimes(1);
    });

    rerender(<PdfViewer src={null} initialPage={3} onLoad={onLoad} />);
    await screen.findByText(COMMON_COMPONENT_LANG_KO.pdfViewer.missingSourceTitle);

    rerender(<PdfViewer src="same.pdf" initialPage={3} onLoad={onLoad} />);
    await waitFor(() => {
      expect(screen.getByTestId('mock-viewer')).toHaveAttribute('data-initial-page', '2');
      expect(onLoad).toHaveBeenCalledTimes(2);
    });
  });

  it.each([
    ['Infinity', Number.POSITIVE_INFINITY, '0', '1'],
    ['NaN', Number.NaN, '0', '1'],
    ['negative', -4, '0', '1'],
    ['fractional', 2.9, '1', '2'],
  ])('normalizes %s initialPage to a finite positive page', async (_label, initialPage, expectedIndex, expectedPage) => {
    render(<PdfViewer src="boundary.pdf" initialPage={initialPage} withToolbar={false} />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-viewer')).toHaveAttribute('data-initial-page', expectedIndex);
      expect(screen.getByRole('document')).toHaveAttribute('data-page-count', '3');
      expect(screen.getByRole('document')).toHaveAttribute('data-page', expectedPage);
    });
    expect(screen.getByRole('document')).toHaveAttribute('data-page', expectedPage);
    expect(screen.getByRole('document')).toHaveAttribute('data-page-count', '3');
  });

  it('starts safely at index zero, then clamps an oversized initialPage to the loaded document', async () => {
    render(<PdfViewer src="short.pdf" initialPage={99} />);

    await waitFor(() => expect(screen.getByTestId('mock-viewer')).toHaveAttribute('data-initial-page', '2'));
    expect(viewerInitialPageHistory[0]).toBe(0);
    expect(viewerInitialPageHistory).toContain(2);
    const viewerRegion = screen.getByRole('document');
    expect(viewerRegion).toHaveAttribute('data-page', '3');
    expect(viewerRegion).toHaveAttribute('data-page-count', '3');
    expect(screen.getAllByText(
      COMMON_COMPONENT_LANG_KO.pdfViewer.pageStatusTemplate
        .replace('{totalPages}', '3')
        .replace('{currentPage}', '3')
        .replace('{zoomPercent}', '125'),
    ).length).toBeGreaterThan(0);
  });

  it('forwards viewer errors once with the original error payload', async () => {
    const onError = vi.fn();
    render(<PdfViewer src="error-secured.pdf" onError={onError} />);

    await screen.findByText(new RegExp(COMMON_COMPONENT_LANG_KO.pdfViewer.loadFailedTitle));
    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    expect(onError).toHaveBeenCalledWith({ error: expect.objectContaining({ message: '403 Forbidden', status: 403 }) });
    expect(defaultLayoutPluginMock).toHaveBeenCalled();
  });

  it.each([
    ['File', () => new File(['pdf'], 'sample.pdf', { type: 'application/pdf' })],
    ['Blob', () => new Blob(['pdf'], { type: 'application/pdf' })],
    ['ArrayBuffer', () => new ArrayBuffer(8)],
  ])('creates and revokes an object URL for %s sources', async (_sourceName, createSource) => {
    const source = createSource();
    const { unmount } = render(<PdfViewer src={source} withToolbar={false} />);

    await screen.findByTestId('mock-viewer');
    expect(createObjectUrlMock).toHaveBeenCalledTimes(1);
    unmount();
    expect(revokeObjectUrlMock).toHaveBeenCalledWith(createObjectUrlMock.mock.results[0].value);
  });

  it('does not create or revoke object URLs for string sources', async () => {
    const { unmount } = render(<PdfViewer src="/public.pdf" withToolbar={false} />);

    await screen.findByTestId('mock-viewer');
    unmount();
    expect(createObjectUrlMock).not.toHaveBeenCalled();
    expect(revokeObjectUrlMock).not.toHaveBeenCalled();
  });
});
