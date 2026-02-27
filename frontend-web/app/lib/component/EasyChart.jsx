"use client";
/**
 * 파일명: EasyChart.jsx
 * 작성자: LSH
 * 갱신일: 2025-11-27
 * 설명: Recharts 기반 대시보드 차트 카드 래퍼
 */

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useRef, useState } from "react";
import Card from "./Card";
import Skeleton from "./Skeleton";
import Empty from "./Empty";
import { COMMON_COMPONENT_LANG_KO } from "@/app/common/i18n/lang.ko";

const palette = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#0ea5e9",
  "#14b8a6",
];
const defaultMargin = { top: 12, right: 20, left: 10, bottom: 12 };
const donutMargin = { top: 36, right: 16, bottom: 24, left: 16 };

/**
 * @description 입력 데이터가 EasyList/배열처럼 순회 가능한 구조인지 판별
 * 반환값: size API 또는 배열 타입이면 true.
 * @updated 2026-02-27
 */
const isListLike = (list) =>
  !!list && (typeof list.size === "function" || Array.isArray(list));

/**
 * @description 배열 또는 EasyList류 입력을 실제 배열로 평탄화하는 데이터 어댑터.
 * 처리 규칙: 배열은 그대로 반환하고, list-like는 size/get 기반으로 새 배열을 구성한다.
 * @updated 2026-02-27
 */
const toArray = (list) => {
  if (Array.isArray(list)) return list;
  if (isListLike(list)) {
    const size = typeof list.size === "function" ? list.size() : 0;
    return Array.from({ length: size }, (unusedItem, idx) =>
      typeof list.get === "function" ? list.get(idx) : undefined,
    );
  }
  return [];
};

/**
 * @description 카드 스타일을 유지한 Recharts 래퍼 컴포넌트.
 * @param {Object} props
 * 처리 규칙: 데이터/시리즈 입력을 정규화하고 loading/error/empty 상태 우선순위로 본문 UI를 분기한다.
 * @returns {JSX.Element}
 * @updated 2026-02-28
 */
const EasyChart = ({
  title,
  subtitle,
  dataList,
  data,
  xKey = "label",
  seriesList,
  series,
  type = "line",
  height = 260,
  actions,
  loading = false,
  status,
  errorText,
  empty = COMMON_COMPONENT_LANG_KO.easyChart.empty,
  hideLegend = false,
  legendFontSize = 12,
  pieLabelFontSize = 12,
  xLabelFormatter,
  yLabelFormatter,
  className = "",
  cardProps = {},
}) => {

  const [isClient, setIsClient] = useState(false);
  const chartHostRef = useRef(null);
  const [hostSize, setHostSize] = useState({ width: 0, height: 0 });
  const dataSource = dataList ?? data ?? [];
  const seriesSource = seriesList ?? series ?? [];
  const resolvedSeries = useMemo(() => {
    return toArray(seriesSource)
      .map((item, idx) => ({
        key: item.seriesId ?? item.key ?? item.dataKey,
        name: item.seriesNm ?? item.name ?? item.label ?? item.dataKey,
        color: item.color || palette[idx % palette.length],
        type: item.type || type,
        stackId: item.stackId,
        strokeWidth: item.strokeWidth,
        dot: item.dot,
      }))
      .filter((item) => item.key);
  }, [seriesSource, type]);

  const resolvedData = toArray(dataSource);

  const hasSeries = resolvedSeries.length > 0;
  const chartType = resolvedSeries[0]?.type || type;
  const isPie = chartType === "pie";
  const isDonut = chartType === "donut";
  const isEmpty = resolvedData.length === 0 || status === "empty";
  const isLoading = loading || status === "loading";
  const isError = status === "error";
  const useComposed = resolvedSeries.some((seriesItem) => seriesItem.type && seriesItem.type !== type);
  const pieValueKey = resolvedSeries[0]?.key;
  const hasHostSize = hostSize.width > 0 && hostSize.height > 0;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return undefined;
    if (!chartHostRef.current) return undefined;

    /**
     * @description 차트 호스트 DOM 크기를 읽어 내부 width/height 상태를 동기화
     * 처리 규칙: 이전 크기와 동일하면 상태 갱신을 생략해 불필요한 렌더를 방지한다.
     * @updated 2026-02-27
     */
    const updateHostSize = () => {
      if (!chartHostRef.current) return;
      const rect = chartHostRef.current.getBoundingClientRect();
      const nextSize = {
        width: Math.round(rect.width || 0),
        height: Math.round(rect.height || 0),
      };
      setHostSize((prevSize) => {
        if (
          prevSize.width === nextSize.width &&
          prevSize.height === nextSize.height
        ) {
          return prevSize;
        }
        return nextSize;
      });
    };

    updateHostSize();
    if (typeof ResizeObserver === "undefined") {
      const rafId = window.requestAnimationFrame(updateHostSize);
      return () => window.cancelAnimationFrame(rafId);
    }

    const observer = new ResizeObserver(() => {
      updateHostSize();
    });
    observer.observe(chartHostRef.current);
    return () => observer.disconnect();
  }, [isClient, height, isPie, isDonut]);

  const ChartComponent =
    useComposed && hasSeries
      ? ComposedChart
      : type === "bar"
        ? BarChart
        : type === "area"
          ? AreaChart
          : LineChart;

  /**
   * @description resolvedSeries 정의를 Recharts 시리즈 컴포넌트(Line/Bar/Area)로 치환하는 렌더러.
   * 반환값: 현재 차트 타입과 시리즈 옵션이 반영된 JSX 배열 또는 null.
   * @updated 2026-02-27
   */
  const renderSeries = () => {
    if (!hasSeries) return null;
    return resolvedSeries.map((seriesItem, idx) => {
      const key = seriesItem.key || seriesItem.name || `series-${idx}`;
      const common = {
        name: seriesItem.name,
        dataKey: seriesItem.key,
        stroke: seriesItem.color,
        fill: seriesItem.color,
        strokeWidth: seriesItem.strokeWidth || 2,
      };
      let targetType = type;
      if (isPie || isDonut) {
        targetType = chartType;
      } else if (useComposed) {
        targetType = seriesItem.type;
      }
      if (targetType === "bar") {
        return (
          <Bar
            key={key}
            {...common}
            stackId={seriesItem.stackId}
            radius={[4, 4, 0, 0]}
          />
        );
      }
      if (targetType === "area") {
        return (
          <Area key={key} {...common} type="monotone" fillOpacity={0.12} />
        );
      }
      if (targetType === "pie" || targetType === "donut") {
        return null;
      }
      return (
        <Line
          key={key}
          {...common}
          type="monotone"
          dot={seriesItem.dot ?? false}
          activeDot={{ r: 4 }}
        />
      );
    });
  };

  /**
   * @description 로딩/에러/빈상태/차트 본문 우선순위에 따라 카드 본문을 결정하는 렌더러.
   * 처리 규칙: loading > error > no-series > empty > chart 순으로 우선순위를 적용한다.
   * @updated 2026-02-27
   */
  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="space-y-4" aria-live="polite">
          <Skeleton variant="text" lines={2} />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      );
    }
    if (isError) {
      return (
        <div
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {errorText ||
            COMMON_COMPONENT_LANG_KO.easyChart.loadFailed}
        </div>
      );
    }
    if (!hasSeries) {
      return (
        <div
          className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"
          role="status"
        >
          {COMMON_COMPONENT_LANG_KO.easyChart.seriesRequired}
        </div>
      );
    }
    if (!isClient) {
      return (
        <div style={{ height, minWidth: 0 }} className="min-w-0 w-full pt-1" />
      );
    }
    if (isEmpty) {
      return typeof empty === "string" ? (
        <Empty title={empty} className="bg-gray-50" />
      ) : (
        empty
      );
    }
    if (isPie || isDonut) {
      if (!pieValueKey) {
        return (
          <div
            className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"
            role="status"
          >
            {COMMON_COMPONENT_LANG_KO.easyChart.seriesRequired}
          </div>
        );
      }

      /**
       * @description 파이/도넛 섹터 라벨 텍스트(`이름 값 (퍼센트)`) 생성 렌더러.
       * 반환값: 중앙 정렬된 `<text>` SVG 노드.
       * @updated 2026-02-27
       */
      const renderPieLabel = (pieLabelProps) => {
        const { name, value, percent, x: xCoord, y: yCoord } = pieLabelProps;
        const pct = Math.round((percent || 0) * 100);
        return (
          <text
            x={xCoord}
            y={yCoord}
            fill="#374151"
            fontSize={pieLabelFontSize}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {`${name ?? ""} ${value} (${pct}%)`}
          </text>
        );
      };

      const pieHeight = Math.max(height, 180);
      return (
        <div
          ref={chartHostRef}
          style={{ height: pieHeight, minWidth: 0 }}
          className="min-w-0 w-full"
        >
          {hasHostSize ? (
            <PieChart
              width={hostSize.width}
              height={hostSize.height}
              margin={donutMargin}
            >
              <Tooltip
                contentStyle={{ borderRadius: 8, borderColor: "#e5e7eb" }}
                labelStyle={{ color: "#111827", fontWeight: 600 }}
              />
              {!hideLegend && (
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{
                    paddingTop: 6,
                    bottom: 8,
                    fontSize: legendFontSize,
                  }}
                  iconType="circle"
                  iconSize={10}
                />
              )}
              <Pie
                data={resolvedData}
                dataKey={pieValueKey}
                nameKey={xKey}
                innerRadius={isDonut ? "55%" : undefined}
                outerRadius={isDonut ? "82%" : "80%"}
                paddingAngle={isDonut ? 3 : 0}
                labelLine={!isDonut}
                label={renderPieLabel}
              >
                {resolvedData.map((unusedItem, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={
                      resolvedSeries[idx]?.color ||
                      palette[idx % palette.length]
                    }
                    stroke={isDonut ? "#ffffff" : undefined}
                    strokeWidth={isDonut ? 1.4 : undefined}
                  />
                ))}
              </Pie>
            </PieChart>
          ) : null}
        </div>
      );
    }
    return (
      <div
        ref={chartHostRef}
        style={{ height, minWidth: 0 }}
        className="min-w-0 w-full"
      >
        {hasHostSize ? (
          <ChartComponent
            data={resolvedData}
            margin={defaultMargin}
            width={hostSize.width}
            height={hostSize.height}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tickFormatter={xLabelFormatter}
              tick={{ fontSize: 12, fill: "#6b7280" }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tickFormatter={yLabelFormatter}
              tick={{ fontSize: 12, fill: "#6b7280" }}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, borderColor: "#e5e7eb" }}
              labelStyle={{ color: "#111827", fontWeight: 600 }}
              formatter={(value, name) => [value, name]}
              labelFormatter={xLabelFormatter}
            />
            {!hideLegend && (
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{
                  paddingTop: 6,
                  bottom: 8,
                  fontSize: legendFontSize,
                }}
                iconType="circle"
                iconSize={10}
              />
            )}
            {renderSeries()}
          </ChartComponent>
        ) : null}
      </div>
    );
  };

  return (
    <Card
      title={title}
      subtitle={subtitle}
      actions={actions}
      className={`h-full ${className}`.trim()}
      bodyClassName="space-y-2"
      {...cardProps}
    >
      {renderBody()}
    </Card>
  );
};

/**
 * @description Card 래퍼와 상태 분기(loading/error/empty)를 포함한 EasyChart 컴포넌트를 외부에 노출
 * 반환값: EasyChart 컴포넌트 export.
 */
export default EasyChart;
