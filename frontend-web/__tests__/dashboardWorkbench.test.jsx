import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import DashboardView from "@/app/dashboard/view";

const pushMock = vi.fn();
const usePageDataMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/app/lib/hooks/usePageData", () => ({
  usePageData: (...args) => usePageDataMock(...args),
}));

vi.mock("@/app/lib/component/Button", () => ({
  default: ({ children, onClick }) => (
    <button type="button" onClick={onClick}>{children}</button>
  ),
}));

vi.mock("@/app/lib/component/Card", () => ({
  default: ({ title, actions, children }) => (
    <section>
      <h2>{title}</h2>
      {actions}
      {children}
    </section>
  ),
}));

vi.mock("@/app/lib/component/EasyChart", () => ({
  default: ({ title }) => <div data-testid="dashboard-chart">{title}</div>,
}));

vi.mock("@/app/lib/component/EasyTable", () => ({
  default: ({ data = [], empty }) => (
    <div data-testid="dashboard-table">{data.length ? `${data.length} rows` : empty}</div>
  ),
}));

vi.mock("@/app/lib/component/Skeleton", () => ({
  default: () => <div data-testid="dashboard-skeleton" />,
}));

vi.mock("@/app/lib/component/Stat", () => ({
  default: ({ label, value }) => <div>{label}: {value}</div>,
}));

describe("dashboard workbench overview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("통계·차트·최근 업무·빠른 이동을 렌더링한다", () => {
    usePageDataMock.mockReturnValue({
      mode: "SSR",
      dataObj: {
        stats: {
          result: {
            statusSummaryList: [
              { status: "ready", count: 2, amountSum: 10000 },
              { status: "running", count: 1, amountSum: 20000 },
            ],
          },
        },
        list: {
          result: {
            dataTemplateList: [
              { id: 1, title: "대시보드 검증", status: "ready", amount: 10000, createdAt: "2026-07-13T00:00:00Z" },
            ],
          },
        },
      },
      errorObj: {},
      isLoading: false,
    });

    render(<DashboardView initialDataObj={{}} initialErrorObj={{}} />);

    expect(screen.getByRole("heading", { name: "대시보드" })).toBeTruthy();
    expect(screen.getByText("전체 건수: 3")).toBeTruthy();
    expect(screen.getByText("진행 중: 1")).toBeTruthy();
    expect(screen.getAllByTestId("dashboard-chart")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "전체 업무" })).toBeTruthy();
    expect(screen.getByTestId("dashboard-table")).toHaveTextContent("1 rows");
    fireEvent.click(screen.getByRole("button", { name: "준비 2건" }));
    expect(pushMock).toHaveBeenCalledWith("/dashboard/tasks?status=ready");
  });

  test("API 실패 시 안전한 code와 requestId를 오류 영역에 표시한다", () => {
    usePageDataMock.mockReturnValue({
      mode: "SSR",
      dataObj: {},
      errorObj: {
        stats: {
          message: "private upstream detail must not render",
          code: "DASHBOARD_503_UNAVAILABLE",
          requestId: "rid-dashboard-safe-1",
        },
      },
      isLoading: false,
    });

    render(<DashboardView initialDataObj={{}} initialErrorObj={{}} />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("대시보드 데이터를 불러오지 못했습니다.");
    expect(alert).toHaveTextContent("DASHBOARD_503_UNAVAILABLE");
    expect(alert).toHaveTextContent("rid-dashboard-safe-1");
    expect(alert).not.toHaveTextContent("private upstream detail must not render");
  });
});
