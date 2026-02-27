/**
 * 파일명: tests/dashboard.view.test.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 대시보드 뷰 에러/빈상태 렌더링 테스트
 */

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/app/lib/runtime/api", () => ({
  apiJSON: vi.fn(),
}));

vi.mock("@/app/lib/component/EasyChart", () => ({
  __esModule: true,
  default: ({ title }) => <div data-testid={`chart-${title}`}>{title}</div>,
}));

vi.mock("@/app/lib/component/EasyTable", () => ({
  __esModule: true,
  default: ({ data, loading, empty }) => {
    let itemList = [];
    if (typeof data?.toJSON === "function") {
      itemList = data.toJSON();
    } else if (Array.isArray(data)) {
      itemList = data;
    }
    if (loading) return <div>loading</div>;
    if (!itemList.length) return <div>{empty}</div>;
    return <div>{itemList.length} rows</div>;
  },
}));

import { apiJSON } from "@/app/lib/runtime/api";
import DashboardView from "@/app/dashboard/view";
import { DASHBOARD_ERROR_KEY } from "@/app/dashboard/dataStrategy";

describe("dashboard view", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    pushMock.mockReset();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
  });

  test("초기 에러에 requestId/code가 있으면 화면에 함께 노출한다", () => {
    render(
      <DashboardView
        statList={[{ status: "ready", count: 1, amountSum: 1000 }]}
        dataList={[
          {
            id: 1,
            title: "테스트",
            status: "ready",
            amount: 1000,
            createdAt: "2026-02-23T00:00:00.000Z",
          },
        ]}
        initialError={{
          key: DASHBOARD_ERROR_KEY.INIT_FETCH_FAILED,
          code: "DASHBOARD_500",
          requestId: "rid-dashboard-init",
        }}
      />
    );

    expect(screen.getByText("대시보드 데이터를 불러오지 못했습니다.")).toBeInTheDocument();
    expect(screen.getByText("requestId: rid-dashboard-init")).toBeInTheDocument();
    expect(screen.getByText("code: DASHBOARD_500")).toBeInTheDocument();
    expect(apiJSON).not.toHaveBeenCalled();
  });

  test("CSR fetch 실패 시 에러 안내와 requestId/code를 노출한다", async () => {
    const fetchError = new Error("fetch failed");
    fetchError.code = "DASHBOARD_FETCH_FAIL";
    fetchError.requestId = "rid-dashboard-fetch";
    apiJSON.mockRejectedValue(fetchError);

    render(
      <DashboardView
        statList={[]}
        dataList={[]}
        initialError={null}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("대시보드 데이터를 불러오지 못했습니다.")).toBeInTheDocument();
    });
    expect(screen.getByText("requestId: rid-dashboard-fetch")).toBeInTheDocument();
    expect(screen.getByText("code: DASHBOARD_FETCH_FAIL")).toBeInTheDocument();
  });

  test("CSR fetch 지연 중에는 loading을 표시하고 완료 후 목록을 렌더링한다", async () => {
    let resolveStats;
    let resolveList;
    apiJSON
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveStats = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveList = resolve;
          }),
      );

    render(
      <DashboardView
        statList={[]}
        dataList={[]}
        initialError={null}
      />,
    );

    expect(screen.getByText("loading")).toBeInTheDocument();

    await act(async () => {
      resolveStats({
        result: { byStatus: [{ status: "ready", count: 1, amountSum: 1000 }] },
      });
      resolveList({
        result: {
          items: [
            {
              id: 1,
              title: "지연 테스트",
              status: "ready",
              amount: 1000,
              createdAt: "2026-02-23T00:00:00.000Z",
            },
          ],
        },
      });
    });

    await waitFor(() => {
      expect(screen.getByText("1 rows")).toBeInTheDocument();
    });
    expect(screen.queryByText("loading")).not.toBeInTheDocument();
  });

  test("타임아웃 실패 이후 재마운트하면 정상 응답으로 복구된다", async () => {
    const timeoutError = new Error("timeout");
    timeoutError.code = "DASHBOARD_TIMEOUT";
    timeoutError.requestId = "rid-dashboard-timeout";

    apiJSON
      .mockRejectedValueOnce(timeoutError)
      .mockRejectedValueOnce(timeoutError);

    const firstRender = render(
      <DashboardView
        statList={[]}
        dataList={[]}
        initialError={null}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("대시보드 데이터를 불러오지 못했습니다.")).toBeInTheDocument();
    });
    firstRender.unmount();

    apiJSON.mockReset();
    apiJSON
      .mockResolvedValueOnce({
        result: { byStatus: [{ status: "ready", count: 1, amountSum: 1000 }] },
      })
      .mockResolvedValueOnce({
        result: {
          items: [
            {
              id: 1,
              title: "복구 테스트",
              status: "ready",
              amount: 1000,
              createdAt: "2026-02-23T00:00:00.000Z",
            },
          ],
        },
      });

    render(
      <DashboardView
        statList={[]}
        dataList={[]}
        initialError={null}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("1 rows")).toBeInTheDocument();
    });
    expect(screen.queryByText("대시보드 데이터를 불러오지 못했습니다.")).not.toBeInTheDocument();
  });

  test("목록 0건이면 빈 상태 메시지를 표시한다", async () => {
    apiJSON
      .mockResolvedValueOnce({ result: { byStatus: [] } })
      .mockResolvedValueOnce({ result: { items: [] } });

    render(
      <DashboardView
        statList={[]}
        dataList={[]}
        initialError={null}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("업무가 없습니다.")).toBeInTheDocument();
    });
  });

  test("업무 바로가기 버튼이 상태 필터 경로로 이동한다", () => {
    render(
      <DashboardView
        statList={[
          { status: "running", count: 3, amountSum: 9000 },
          { status: "done", count: 5, amountSum: 15000 },
        ]}
        dataList={[
          {
            id: 1,
            title: "테스트",
            status: "running",
            amount: 1000,
            createdAt: "2026-02-23T00:00:00.000Z",
          },
        ]}
        initialError={null}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "전체 업무" }));
    expect(pushMock).toHaveBeenCalledWith("/dashboard/tasks");

    fireEvent.click(screen.getByRole("button", { name: "진행중 3건" }));
    expect(pushMock).toHaveBeenCalledWith("/dashboard/tasks?status=running");
  });
});
