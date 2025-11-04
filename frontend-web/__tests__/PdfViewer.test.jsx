import React, { useEffect } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import PdfViewer from "../app/lib/component/PdfViewer/PdfViewer.jsx";

vi.mock("@react-pdf-viewer/default-layout", () => ({
  defaultLayoutPlugin: () => ({ name: "default-layout-plugin" }),
}));

const StubWorker = ({ children }) => <div data-testid="stub-worker">{children}</div>;

const createStubViewer = ({ fail, onProps } = {}) => {
  const StubViewer = (props) => {
    const { onDocumentLoad, onDocumentLoadFailed } = props;

    useEffect(() => {
      if (fail) {
        onDocumentLoadFailed?.(fail);
      } else {
        onDocumentLoad?.({ pagesCount: 1 });
      }
    }, [fail, onDocumentLoad, onDocumentLoadFailed]);

    onProps?.(props);

    return <div data-testid="stub-viewer" />;
  };

  return StubViewer;
};

describe("PdfViewer", () => {
  it("shows fallback when no src is provided", () => {
    render(<PdfViewer />);
    expect(screen.getByRole("status")).toHaveTextContent("No PDF source provided.");
  });

  it("attaches toolbar plugins when withToolbar is true", async () => {
    let capturedProps;
    const Viewer = createStubViewer({
      onProps: (props) => {
        capturedProps = props;
      },
    });

    render(
      <PdfViewer
        src="https://example.com/sample.pdf"
        components={{ Viewer, Worker: StubWorker }}
      />,
    );

    await waitFor(() => expect(screen.getByTestId("stub-viewer")).toBeInTheDocument());
    expect(capturedProps.plugins).toBeDefined();
    expect(capturedProps.plugins).toHaveLength(1);
  });

  it("omits toolbar plugins when withToolbar is false", async () => {
    let capturedProps;
    const Viewer = createStubViewer({
      onProps: (props) => {
        capturedProps = props;
      },
    });

    render(
      <PdfViewer
        src="https://example.com/sample.pdf"
        withToolbar={false}
        components={{ Viewer, Worker: StubWorker }}
      />,
    );

    await waitFor(() => expect(screen.getByTestId("stub-viewer")).toBeInTheDocument());
    expect(capturedProps.plugins).toBeUndefined();
  });

  it("renders an alert when loading fails with 404", async () => {
    const Viewer = createStubViewer({
      fail: { error: { status: 404 } },
    });

    render(
      <PdfViewer
        src="https://example.com/missing.pdf"
        components={{ Viewer, Worker: StubWorker }}
      />,
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Failed to load PDF.");
    expect(alert).toHaveTextContent("The PDF file could not be found.");
  });
});
