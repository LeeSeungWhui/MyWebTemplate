"use client";
/**
 * 파일명: EasyChart.jsx
 * 작성자: Codex
 * 갱신일: 2025-11-26
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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import Card from "./Card";
import Skeleton from "./Skeleton";
import Empty from "./Empty";

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
const isListLike = (list) =>
  !!list && (typeof list.size === "function" || Array.isArray(list));
const toArray = (list) => {
  if (Array.isArray(list)) return list;
  if (isListLike(list)) {
    const size = typeof list.size === "function" ? list.size() : 0;
    return Array.from({ length: size }, (_, idx) =>
      typeof list.get === "function" ? list.get(idx) : undefined
    );
  }
  return [];
};

/**
 * @description 카드 스타일을 유지한 Recharts 래퍼
 * @param {Object} props
 * @param {string} [props.title] 카드 타이틀
 * @param {string} [props.subtitle] 카드 서브 타이틀
 * @param {Array|Object} [props.dataList] EasyList/배열 차트 데이터
 * @param {string} [props.xKey] X축 데이터 키
 * @param {Array|Object} [props.seriesList] EasyList/배열 시리즈 { seriesId|key|dataKey, seriesNm|label|name, color, type, stackId, strokeWidth, dot }
 * @param {string} [props.type] 기본 시리즈 타입(line|bar|area)
 * @param {number} [props.height] 차트 높이(px)
 * @param {React.ReactNode} [props.actions] 카드 우측 액션 영역
 * @param {boolean} [props.loading] 로딩 여부
 * @param {string} [props.status] 상태값(loading|error|empty) - loading과 병행 시 loading 우선
 * @param {string} [props.errorText] 에러 메시지
 * @param {React.ReactNode|string} [props.empty] 빈 상태 메시지/노드
 * @param {boolean} [props.hideLegend] 범례 숨김 여부
 * @param {number} [props.legendFontSize=12] 범례 폰트 크기(px)
 * @param {number} [props.pieLabelFontSize=12] 파이/도넛 라벨 폰트 크기(px)
 * @param {Function} [props.xLabelFormatter] X축 라벨 포맷터
 * @param {Function} [props.yLabelFormatter] Y축 라벨 포맷터
 * @param {string} [props.className] 카드 추가 클래스
 * @param {Object} [props.cardProps] Card에 전달할 추가 prop
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
  empty = "표시할 데이터가 없습니다.",
  hideLegend = false,
  legendFontSize = 12,
  pieLabelFontSize = 12,
  xLabelFormatter,
  yLabelFormatter,
  className = "",
  cardProps = {},
}) => {
  const [isClient, setIsClient] = useState(false);
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

  const resolvedData = useMemo(() => toArray(dataSource), [dataSource]);

  const hasSeries = resolvedSeries.length > 0;
  const chartType = resolvedSeries[0]?.type || type;
  const isPie = chartType === "pie";
  const isDonut = chartType === "donut";
  const isEmpty = resolvedData.length === 0 || status === "empty";
  const isLoading = loading || status === "loading";
  const isError = status === "error";
  const useComposed = resolvedSeries.some((s) => s.type && s.type !== type);
  const pieValueKey = resolvedSeries[0]?.key;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const ChartComponent =
    useComposed && hasSeries
      ? ComposedChart
      : type === "bar"
      ? BarChart
      : type === "area"
      ? AreaChart
      : LineChart;

  const renderSeries = () => {
    if (!hasSeries) return null;
    return resolvedSeries.map((s, idx) => {
      const key = s.key || s.name || `series-${idx}`;
      const common = {
        name: s.name,
        dataKey: s.key,
        stroke: s.color,
        fill: s.color,
        strokeWidth: s.strokeWidth || 2,
      };
      const targetType =
        isPie || isDonut ? chartType : useComposed ? s.type : type;
      if (targetType === "bar") {
        return (
          <Bar
            key={key}
            {...common}
            stackId={s.stackId}
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
          dot={s.dot ?? false}
          activeDot={{ r: 4 }}
        />
      );
    });
  };

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
            "데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."}
        </div>
      );
    }
    if (!hasSeries) {
      return (
        <div
          className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"
          role="status"
        >
          시리즈 설정이 필요합니다. dataKey와 라벨을 전달해 주세요.
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
            시리즈 설정이 필요합니다. dataKey와 라벨을 전달해 주세요.
          </div>
        );
      }
      const renderPieLabel = ({ name, value, percent, x, y }) => {
        const pct = Math.round((percent || 0) * 100);
        return (
          <text
            x={x}
            y={y}
            fill="#374151"
            fontSize={pieLabelFontSize}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {`${name ?? ""} ${value} (${pct}%)`}
          </text>
        );
      };

      return (
        <div style={{ height, minWidth: 0 }} className="min-w-0 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Tooltip
                contentStyle={{ borderRadius: 8, borderColor: "#e5e7eb" }}
                labelStyle={{ color: "#111827", fontWeight: 600 }}
              />
              {!hideLegend && (
                <Legend
                  wrapperStyle={{ paddingTop: 8, fontSize: legendFontSize }}
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
                {resolvedData.map((_, idx) => (
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
          </ResponsiveContainer>
        </div>
      );
    }
    return (
      <div style={{ height, minWidth: 0 }} className="min-w-0 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <ChartComponent data={resolvedData} margin={defaultMargin}>
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
                wrapperStyle={{ paddingTop: 8, fontSize: legendFontSize }}
                iconType="circle"
                iconSize={10}
              />
            )}
            {renderSeries()}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Card
      title={title}
      subtitle={subtitle}
      actions={actions}
      className={`h-full ${className}`.trim()}
      bodyClassName="space-y-4"
      {...cardProps}
    >
      {renderBody()}
    </Card>
  );
};

export default EasyChart;
