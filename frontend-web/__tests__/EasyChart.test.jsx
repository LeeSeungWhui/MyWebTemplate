import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import EasyChart from "../app/lib/component/EasyChart.jsx";

vi.mock("recharts", () => ({
  Area: () => null,
  AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
  Bar: () => null,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  CartesianGrid: () => null,
  Cell: ({ fill }) => <span data-testid="chart-cell" data-fill={fill} />,
  ComposedChart: ({ children }) => <div data-testid="composed-chart">{children}</div>,
  Legend: ({ wrapperStyle }) => (
    <div data-testid="chart-legend" data-font-size={wrapperStyle?.fontSize} />
  ),
  Line: () => null,
  Pie: ({ children, data, dataKey, label, labelLine, nameKey, outerRadius }) => (
    <div
      data-testid="chart-pie"
      data-chart-data={JSON.stringify(data)}
      data-data-key={dataKey}
      data-label-enabled={String(Boolean(label))}
      data-label-line={String(Boolean(labelLine))}
      data-name-key={nameKey}
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

  it("renders an explicit empty state before the missing-series warning", () => {
    render(
      <EasyChart
        title="빈 차트"
        dataList={[]}
        seriesList={[]}
        status="empty"
        empty={<div data-testid="custom-empty">데이터 없음</div>}
      />,
    );

    expect(screen.getByTestId("custom-empty")).toHaveTextContent("데이터 없음");
  });

  it("exposes loading as a live busy status", () => {
    render(<EasyChart title="로딩 차트" loading />);

    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
  });

  it("represents every pie series as its own correctly colored aggregate slice", async () => {
    render(
      <EasyChart
        title="다중 파이"
        type="pie"
        dataList={[
          { label: "1월", signups: 10, active: 5 },
          { label: "2월", signups: 20, active: 7 },
        ]}
        seriesList={[
          { dataKey: "signups", name: "가입자", type: "pie", color: "#111111" },
          { dataKey: "active", name: "활성", type: "pie", color: "#222222" },
        ]}
      />,
    );

    const pie = await screen.findByTestId("chart-pie");
    expect(pie).toHaveAttribute("data-data-key", "__easyChartValue");
    expect(pie).toHaveAttribute("data-name-key", "__easyChartName");
    expect(JSON.parse(pie.getAttribute("data-chart-data"))).toEqual([
      {
        __easyChartColor: "#111111",
        __easyChartName: "가입자",
        __easyChartValue: 30,
      },
      {
        __easyChartColor: "#222222",
        __easyChartName: "활성",
        __easyChartValue: 12,
      },
    ]);
    expect(screen.getAllByTestId("chart-cell").map((cell) => cell.dataset.fill)).toEqual([
      "#111111",
      "#222222",
    ]);
  });

  it("preserves row-category slices for a single pie series", async () => {
    const sourceData = [
      { label: "진행", amount: 2 },
      { label: "완료", amount: 4 },
    ];
    render(
      <EasyChart
        title="단일 파이"
        type="pie"
        dataList={sourceData}
        seriesList={[{ dataKey: "amount", name: "건수", type: "pie", color: "#333333" }]}
      />,
    );

    const pie = await screen.findByTestId("chart-pie");
    expect(pie).toHaveAttribute("data-data-key", "amount");
    expect(pie).toHaveAttribute("data-name-key", "label");
    expect(JSON.parse(pie.getAttribute("data-chart-data"))).toEqual(sourceData);
    expect(screen.getAllByTestId("chart-cell")).toHaveLength(2);
  });
});
