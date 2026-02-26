"use client";
/**
 * 파일명: dashboard/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 대시보드 클라이언트 뷰
 */

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEasyList } from "@/app/lib/dataset/EasyList";
import EasyObj from "@/app/lib/dataset/EasyObj";
import Button from "@/app/lib/component/Button";
import Card from "@/app/lib/component/Card";
import EasyChart from "@/app/lib/component/EasyChart";
import EasyTable from "@/app/lib/component/EasyTable";
import Skeleton from "@/app/lib/component/Skeleton";
import Stat from "@/app/lib/component/Stat";
import { apiJSON } from "@/app/lib/runtime/api";
import { PAGE_MODE } from "./initData";
import {
  DASHBOARD_ERROR_KEY,
  isSsrMode,
  toErrorState,
} from "./dataStrategy";
import LANG_KO from "./lang.ko";

const CHART_HEIGHT = 180;
const DONUT_HEIGHT = 180;
const STATUS_ORDER = ["ready", "pending", "running", "done", "failed"];

/**
 * @description DashboardView export를 노출한다.
 */
const DashboardView = ({ statList, dataList, initialError }) => {
  const monthKey = (iso) => {
    if (!iso) return LANG_KO.view.unknown;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return LANG_KO.view.unknown;
    const month = date.getMonth() + 1;
    return `${month}${LANG_KO.view.monthSuffix}`;
  };
  const formatCurrency = (value) => {
    const num = Number(value || 0);
    if (Number.isNaN(num)) return "0";
    return num.toLocaleString("ko-KR");
  };
  const resolveErrorText = (errorKey) => {
    if (errorKey === DASHBOARD_ERROR_KEY.ENDPOINT_MISSING) {
      return LANG_KO.view.error.endpointMissing;
    }
    if (errorKey === DASHBOARD_ERROR_KEY.INIT_FETCH_FAILED) {
      return LANG_KO.view.error.fetchFailed;
    }
    return null;
  };
  const createTasksPath = ({ status }) => {
    const params = new URLSearchParams();
    if (status && LANG_KO.view.statusLabelMap[status]) params.set("status", status);
    return params.toString()
      ? `/dashboard/tasks?${params.toString()}`
      : "/dashboard/tasks";
  };
  const normalizeErrorState = (value) => {
    if (!value) return null;
    if (typeof value === "string") return { key: value };
    if (typeof value === "object") {
      return {
        key: value.key || "FETCH_FAILED",
        code: value.code,
        requestId: value.requestId,
      };
    }
    return { key: "FETCH_FAILED" };
  };
  const router = useRouter();
  const statsList = useEasyList(statList || []);
  const tableList = useEasyList(dataList || []);
  const ui = EasyObj(
    useMemo(
      () => ({
        isLoading:
          !isSsrMode(PAGE_MODE.MODE) || !statList?.length || !dataList?.length,
        error: normalizeErrorState(initialError),
      }),
      [],
    ),
  );
  const endpoints = PAGE_MODE.endPoints || {};
  const hasEndpoint = Boolean(endpoints.stats && endpoints.list);

  const fetchDashboard = async () => {
    if (!hasEndpoint) {
      ui.error = toErrorState(null, DASHBOARD_ERROR_KEY.ENDPOINT_MISSING);
      return;
    }
    ui.isLoading = true;
    ui.error = null;
    try {
      const [statsRes, listRes] = await Promise.all([
        apiJSON(endpoints.stats),
        apiJSON(endpoints.list),
      ]);
      const listResult = listRes?.result;
      const normalizedItems = Array.isArray(listResult)
        ? listResult
        : Array.isArray(listResult?.items)
          ? listResult.items
          : [];
      statsList.copy(statsRes?.result?.byStatus || []);
      tableList.copy(normalizedItems);
    } catch (err) {
      console.error(LANG_KO.view.error.fetchFailed, err);
      ui.error = toErrorState(err, DASHBOARD_ERROR_KEY.INIT_FETCH_FAILED);
    } finally {
      ui.isLoading = false;
    }
  };

  useEffect(() => {
    const hasSsrData = statList?.length && dataList?.length;
    if (isSsrMode(PAGE_MODE.MODE) && hasSsrData) return;
    fetchDashboard();
  }, [statList, dataList, hasEndpoint]);

  const statCards = useMemo(() => {
    const byStatus = statsList.toJSON();
    const totalCount = byStatus.reduce((acc, row) => acc + (row.count ?? 0), 0);
    const totalAmount = byStatus.reduce(
      (acc, row) => acc + Number(row.amountSum ?? 0),
      0
    );
    const runningCount = byStatus.find((row) => row.status === "running")?.count ?? 0;
    const pendingCount = byStatus.find((row) => row.status === "pending")?.count ?? 0;
    const activeCount = runningCount + pendingCount;
    return [
      {
        label: LANG_KO.view.stat.totalCount,
        value: totalCount.toLocaleString("ko-KR"),
        delta: null,
        deltaType: "neutral",
      },
      {
        label: LANG_KO.view.stat.totalAmount,
        value: `${formatCurrency(totalAmount)}`,
        delta: null,
        deltaType: "neutral",
      },
      {
        label: LANG_KO.view.stat.activeCount,
        value: activeCount.toLocaleString("ko-KR"),
        delta: null,
        deltaType: "neutral",
      },
    ];
  }, [statsList]);

  const donutData = useMemo(() => {
    const byStatus = statsList.toJSON();
    return byStatus.map((row) => ({
      label: LANG_KO.view.statusLabelMap[row.status] || row.status || LANG_KO.view.unknown,
      value: row.count ?? 0,
    }));
  }, [statsList]);

  const statusQuickList = useMemo(() => {
    const byStatus = statsList.toJSON();
    const byStatusMap = new Map(
      byStatus.map((row) => [String(row.status || ""), Number(row.count || 0)])
    );
    return STATUS_ORDER.map((status) => ({
      status,
      label: LANG_KO.view.statusLabelMap[status],
      count: byStatusMap.get(status) || 0,
      href: createTasksPath({ status }),
    }));
  }, [statsList]);

  const lineData = useMemo(() => {
    const items = tableList.toJSON();
    const byMonth = new Map();
    items.forEach((item) => {
      const key = monthKey(item.createdAt);
      const bucket = byMonth.get(key) || { label: key, count: 0, amount: 0 };
      bucket.count += 1;
      bucket.amount += Number(item.amount || 0);
      byMonth.set(key, bucket);
    });
    return Array.from(byMonth.values());
  }, [tableList]);

  const legendFontSize = 12;
  const errorText = resolveErrorText(ui.error?.key);

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
            {ui.error?.requestId ? (
              <div className="mt-1 text-xs text-red-700/80">
                requestId: {ui.error.requestId}
              </div>
            ) : null}
            {ui.error?.code ? (
              <div className="mt-1 text-xs text-red-700/80">code: {ui.error.code}</div>
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
        {ui.isLoading
          ? Array.from({ length: 3 }).map((_, idx) => (
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
          loading={ui.isLoading}
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
          loading={ui.isLoading}
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
                {item.label} {item.count.toLocaleString("ko-KR")}{LANG_KO.view.action.countSuffix}
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
            data={tableList}
            loading={ui.isLoading}
            columns={[
              {
                key: "title",
                header: LANG_KO.view.table.titleHeader,
                render: (row) => (
                  <Link
                    href={createTasksPath({ status: row?.status })}
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
            empty={ui.error ? LANG_KO.view.table.emptyWhenError : LANG_KO.view.table.emptyDefault}
          />
        </Card>
      </section>
    </div>
  );
};

export default DashboardView;
