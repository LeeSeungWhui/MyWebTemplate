import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import EasyChart from "../app/lib/component/EasyChart.jsx";

vi.mock("recharts", () => ({
  Area: () => null,
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  Bar: () => null,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  CartesianGrid: () => null,
  Cell: () => null,
  ComposedChart: ({ children }) => <div data-testid="composed-chart">{children}</div>,
  Legend: ({ wrapperStyle }) => (
    <div data-testid="chart-legend" data-font-size={wrapperStyle?.fontSize} />
  ),
  Line: () => null,
  Pie: ({ children, label, labelLine, outerRadius }) => (
    <div
      data-testid="chart-pie"
      data-label-enabled={String(Boolean(label))}
      data-label-line={String(Boolean(labelLine))}
      data-outer-radius={outerRadius}
    >
      {children}
    </div>
  ),
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: ({ width }) => <div data-testid="chart-y-axis" data-width={width} />,
}));

describe("EasyChart responsive display contract", () => {
  const originalResizeObserver = globalThis.ResizeObserver;

  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      bottom: 220,
      height: 220,
      left: 0,
      right: 640,
      top: 0,
      width: 640,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    globalThis.ResizeObserver = class ResizeObserver {
      constructor(callback) {
        this.callback = callback;
      }

      observe() {
        this.callback();
      }

      disconnect() {}
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.ResizeObserver = originalResizeObserver;
  });

  it("applies explicit legend and Y-axis sizing", async () => {
    render(
      <EasyChart
        title="월별 추이"
        dataList={[{ label: "1월", amount: 1.2 }]}
        seriesList={[{ seriesId: "amount", seriesNm: "금액", dataKey: "amount" }]}
        legendFontSize={15}
        yAxisWidth={64}
      />,
    );

    expect(await screen.findByTestId("chart-y-axis")).toHaveAttribute("data-width", "64");
    expect(screen.getByTestId("chart-legend")).toHaveAttribute("data-font-size", "15px");
    expect(screen.getByText("월별 추이").closest(".rounded-xl")).toHaveClass("min-w-0");
  });

  it("keeps compact donut labels out of the legend region by default", async () => {
    render(
      <EasyChart
        title="상태 분포"
        dataList={[
          { label: "진행", value: 2 },
          { label: "완료", value: 4 },
        ]}
        seriesList={[{ seriesId: "value", seriesNm: "건수", dataKey: "value", type: "donut" }]}
        type="donut"
        height={180}
      />,
    );

    const pie = await screen.findByTestId("chart-pie");
    expect(pie).toHaveAttribute("data-label-enabled", "false");
    expect(pie).toHaveAttribute("data-label-line", "false");
    expect(pie).toHaveAttribute("data-outer-radius", "68%");
  });
});
