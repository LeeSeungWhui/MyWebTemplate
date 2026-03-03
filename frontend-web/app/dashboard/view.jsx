"use client";
/**
 * 파일명: dashboard/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-03
 * 설명: 대시보드 클라이언트 뷰
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePageData } from "@/app/lib/hooks/usePageData";
import Button from "@/app/lib/component/Button";
import Card from "@/app/lib/component/Card";
import EasyChart from "@/app/lib/component/EasyChart";
import EasyTable from "@/app/lib/component/EasyTable";
import Skeleton from "@/app/lib/component/Skeleton";
import Stat from "@/app/lib/component/Stat";
import { PAGE_CONFIG } from "./initData";
import LANG_KO from "./lang.ko";
import {
  CHART_HEIGHT,
  DONUT_HEIGHT,
  STATUS_ORDER,
  DASHBOARD_ERROR_KEY,
  normalizeStatusList,
  normalizeDashboardItems,
  monthKey,
  formatNumber,
  formatCurrency,
  resolveErrorText,
  createTasksPath,
  normalizeErrorState,
} from "./viewHelper";

/**
 * @description 대시보드 요약 통계/차트/최근 목록 화면을 렌더링. 입력/출력 계약을 함께 명시
 * 처리 규칙: SSR 데이터가 있으면 즉시 사용하고, 없으면 API로 stats/list를 병렬 조회한다.
 */
const DashboardView = ({
  initialDataObj = {},
  initialErrorObj = {},
}) => {
  const router = useRouter();
  const { mode: pageMode, dataObj, errorObj, isLoading } = usePageData({
    pageConfig: PAGE_CONFIG,
    initialDataObj,
    initialErrorObj,
  });
  const endpoints = PAGE_CONFIG.API || {};
  const hasEndpoint = Boolean(endpoints.stats && endpoints.list);
  const statList = normalizeStatusList(dataObj?.stats);
  const dataList = normalizeDashboardItems(dataObj?.list);
  const initialErrorState = normalizeErrorState(
    initialErrorObj?.stats || initialErrorObj?.list || null,
    DASHBOARD_ERROR_KEY,
  );
  const statsErrorState = normalizeErrorState(errorObj?.stats, DASHBOARD_ERROR_KEY);
  const listErrorState = normalizeErrorState(errorObj?.list, DASHBOARD_ERROR_KEY);
  const errorState = !hasEndpoint
    ? { key: DASHBOARD_ERROR_KEY.ENDPOINT_MISSING }
    : statsErrorState || listErrorState || initialErrorState;
  const hasLoadedSnapshot =
    Object.prototype.hasOwnProperty.call(dataObj || {}, "stats")
    || Object.prototype.hasOwnProperty.call(dataObj || {}, "list")
    || Boolean(errorObj?.stats || errorObj?.list);
  const shouldForceLoading =
    String(pageMode || "").toUpperCase() === "CSR"
    && !isLoading
    && !errorState
    && !hasLoadedSnapshot
    && statList.length === 0
    && dataList.length === 0;
  const loading = isLoading || shouldForceLoading;
  const byStatus = statList;
  const totalCount = byStatus.reduce((acc, row) => acc + (row.count ?? 0), 0);
  const totalAmount = byStatus.reduce(
    (acc, row) => acc + Number(row.amountSum ?? 0),
    0
  );
  const runningCount = byStatus.find((row) => row.status === "running")?.count ?? 0;
  const pendingCount = byStatus.find((row) => row.status === "pending")?.count ?? 0;
  const activeCount = runningCount + pendingCount;
  const statCards = [
    {
      label: LANG_KO.view.stat.totalCount,
      value: formatNumber(totalCount, LANG_KO.view.number),
      delta: null,
      deltaType: "neutral",
    },
    {
      label: LANG_KO.view.stat.totalAmount,
      value: `${formatCurrency(totalAmount, LANG_KO.view.number)}`,
      delta: null,
      deltaType: "neutral",
    },
    {
      label: LANG_KO.view.stat.activeCount,
      value: formatNumber(activeCount, LANG_KO.view.number),
      delta: null,
      deltaType: "neutral",
    },
  ];

  const donutData = byStatus.map((row) => ({
    label: LANG_KO.view.statusLabelMap[row.status] || row.status || LANG_KO.view.unknown,
    value: row.count ?? 0,
  }));

  const byStatusMap = new Map(
    byStatus.map((row) => [String(row.status || ""), Number(row.count || 0)])
  );
  const statusQuickList = STATUS_ORDER.map((status) => ({
    status,
    label: LANG_KO.view.statusLabelMap[status],
    count: byStatusMap.get(status) || 0,
    href: createTasksPath({
      status,
      statusLabelMap: LANG_KO.view.statusLabelMap,
    }),
  }));

  const items = dataList;
  const byMonth = new Map();
  items.forEach((item) => {
    const key = monthKey(item.createdAt, LANG_KO.view);
    const bucket = byMonth.get(key) || { label: key, count: 0, amount: 0 };
    bucket.count += 1;
    bucket.amount += Number(item.amount || 0);
    byMonth.set(key, bucket);
  });
  const lineData = Array.from(byMonth.values());

  const legendFontSize = 12;
  const errorText = resolveErrorText(
    errorState?.key,
    LANG_KO.view.error,
    DASHBOARD_ERROR_KEY,
  );

  return (
    <div className="space-y-2">
      <h1 className="sr-only">{LANG_KO.layoutMeta.title.dashboard}</h1>
      {errorText ? (
        <section role="region" aria-labelledby="dashboard-error-heading">
          <h2 id="dashboard-error-heading" className="sr-only">
            {LANG_KO.view.error.sectionAriaLabel}
          </h2>
          <div
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            <div>{errorText}</div>
            {errorState?.requestId ? (
              <div className="mt-1 text-xs text-red-700/80">
                {LANG_KO.view.error.requestIdLabel}: {errorState.requestId}
              </div>
            ) : null}
            {errorState?.code ? (
              <div className="mt-1 text-xs text-red-700/80">
                {LANG_KO.view.error.codeLabel}: {errorState.code}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section
        role="region"
        aria-labelledby="dashboard-summary-heading"
        className="grid gap-3 md:grid-cols-3"
      >
        <h2 id="dashboard-summary-heading" className="sr-only">
          {LANG_KO.view.chart.summaryAriaLabel}
        </h2>
        {loading
          ? Array.from({ length: 3 }).map((_item, idx) => (
              <div
                key={`stat-skeleton-${idx}`}
                className="border rounded-lg p-4 bg-white shadow-sm"
              >
                <Skeleton variant="text" lines={2} />
                <Skeleton className="mt-4 h-7 w-2/3" />
              </div>
            ))
          : statCards.map((item) => (
              <Stat key={item.label} {...item} className="p-1" />
            ))}
      </section>

      <section
        role="region"
        aria-labelledby="dashboard-chart-heading"
        className="grid gap-3 md:grid-cols-2"
      >
        <h2 id="dashboard-chart-heading" className="sr-only">
          {LANG_KO.view.chart.chartAriaLabel}
        </h2>
        <EasyChart
          title={LANG_KO.view.chart.trendTitle}
          dataList={lineData}
          loading={loading}
          seriesList={[
            {
              seriesId: "count",
              seriesNm: LANG_KO.view.chart.seriesCount,
              dataKey: "count",
              color: "#2563eb",
            },
            {
              seriesId: "amount",
              seriesNm: LANG_KO.view.chart.seriesAmount,
              dataKey: "amount",
              color: "#10b981",
            },
          ]}
          xKey="label"
          type="line"
          height={CHART_HEIGHT}
          hideLegend={false}
          legendFontSize={legendFontSize}
        />

        <EasyChart
          title={LANG_KO.view.chart.statusTitle}
          dataList={donutData}
          loading={loading}
          seriesList={[
            {
              seriesId: "value",
              seriesNm: LANG_KO.view.chart.seriesCount,
              dataKey: "value",
              type: "donut",
            },
          ]}
          xKey="label"
          type="donut"
          height={DONUT_HEIGHT}
          hideLegend={false}
          legendFontSize={legendFontSize}
          pieLabelFontSize={11}
        />
      </section>

      <section role="region" aria-labelledby="dashboard-table-heading">
        <h2 id="dashboard-table-heading" className="sr-only">
          {LANG_KO.view.chart.tableAriaLabel}
        </h2>
        <Card title={LANG_KO.view.card.quickTitle} className="mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => router.push("/dashboard/tasks")}
            >
              {LANG_KO.view.action.allTasks}
            </Button>
            {statusQuickList.map((item) => (
              <Button
                key={`quick-${item.status}`}
                size="sm"
                variant="secondary"
                onClick={() => router.push(item.href)}
              >
                {item.label} {formatNumber(item.count, LANG_KO.view.number)}
                {LANG_KO.view.action.countSuffix}
              </Button>
            ))}
          </div>
        </Card>
        <Card
          title={LANG_KO.view.card.recentTitle}
          actions={
            <Button size="sm" variant="secondary" onClick={() => router.push("/dashboard/tasks")}>
              {LANG_KO.view.action.viewAll}
            </Button>
          }
        >
          <EasyTable
            data={dataList}
            loading={loading}
            columns={[
              {
                key: "title",
                header: LANG_KO.view.table.titleHeader,
                render: (row) => (
                  <Link
                    href={createTasksPath({
                      status: row?.status,
                      statusLabelMap: LANG_KO.view.statusLabelMap,
                    })}
                    className="text-left text-blue-700 hover:underline"
                  >
                    {row?.title || "-"}
                  </Link>
                ),
              },
              { key: "status", header: LANG_KO.view.table.statusHeader },
              { key: "amount", header: LANG_KO.view.table.amountHeader },
              { key: "createdAt", header: LANG_KO.view.table.createdAtHeader },
            ]}
            pageSize={4}
            empty={errorState ? LANG_KO.view.table.emptyWhenError : LANG_KO.view.table.emptyDefault}
          />
        </Card>
      </section>
    </div>
  );
};

export default DashboardView;
