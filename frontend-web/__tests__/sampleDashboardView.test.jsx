import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DemoDashboardView from "../app/sample/dashboard/view.jsx";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>,
}));

vi.mock("@/app/lib/hooks/usePageData", () => ({
  usePageData: () => ({
    mode: "SSR",
    isLoading: false,
    dataObj: {
      dashboard: {
        result: {
          statusSummaryList: [
            { status: "running", count: 2, amountSum: 2400000 },
            { status: "done", count: 4, amountSum: 4800000 },
          ],
          trendList: [
            { label: "1월", count: 2, amount: 1200000 },
            { label: "2월", count: 4, amount: 2400000 },
          ],
          recentList: [{ id: 1, title: "샘플", status: "done", amount: 1200000, createdAt: "2026-07-09T00:00:00.000Z" }],
        },
      },
    },
  }),
}));

vi.mock("@/app/lib/component/EasyChart", () => ({
  default: ({ dataList, height, seriesList, showPieLabels, title, yAxisWidth }) => (
    <div
      data-testid={`chart-${title}`}
      data-chart-list={JSON.stringify(dataList)}
      data-height={height}
      data-series-list={JSON.stringify(seriesList)}
      data-show-pie-labels={String(showPieLabels)}
      data-y-axis-width={yAxisWidth}
    />
  ),
}));

vi.mock("@/app/lib/component/EasyTable", () => ({
  default: ({ mobileScrollHint }) => <div data-testid="recent-table" data-mobile-scroll-hint={mobileScrollHint} />,
}));

vi.mock("@/app/lib/component/Stat", () => ({
  default: ({ label, value }) => <div>{label}: {value}</div>,
}));

describe("public sample dashboard display contract", () => {
  it("uses readable chart units and the mobile table affordance", () => {
    render(<DemoDashboardView initialDataObj={{}} initialErrorObj={{}} />);

    const trendChart = screen.getByTestId("chart-월별 업무 추이");
    const statusChart = screen.getByTestId("chart-업무 상태 분포");
    const recentTable = screen.getByTestId("recent-table");

    expect(trendChart).toHaveAttribute("data-height", "220");
    expect(trendChart).toHaveAttribute("data-y-axis-width", "48");
    expect(JSON.parse(trendChart.dataset.chartList)[0].amountMillion).toBe(1.2);
    expect(JSON.parse(trendChart.dataset.seriesList)[1]).toMatchObject({
      dataKey: "amountMillion",
      seriesNm: "예산(백만원)",
    });
    expect(screen.getByText("대기·진행 업무: 2")).toBeInTheDocument();
    expect(statusChart).toHaveAttribute("data-show-pie-labels", "false");
    expect(recentTable.dataset.mobileScrollHint).toContain("좌우로 스크롤");
  });
});
