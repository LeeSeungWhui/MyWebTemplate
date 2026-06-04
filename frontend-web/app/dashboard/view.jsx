"use client";

/**
 * 파일명: dashboard/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
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

/**
 * @description 대시보드 요약 통계/차트/최근 목록 화면을 렌더링. 입력/출력 계약을 함께 명시
 * 처리 규칙: SSR 데이터가 있으면 즉시 사용하고, 없으면 API로 stats/list를 병렬 조회한다.
 */
const DashboardView = ({
  initialDataObj = {},
  initialErrorObj = {},
}) => {

  /* 1. 상수 ======================================================================================================================= */
  const chartHeight = 180;
  const donutHeight = 180;
  const statusOrderList = ["ready", "pending", "running", "done", "failed"];
  const summarySkeletonList = [0, 1, 2];
  const dashboardErrorKeyObj = {
    ENDPOINT_MISSING: "ENDPOINT_MISSING",
    INIT_FETCH_FAILED: "INIT_FETCH_FAILED",
  };
  const endpoints = PAGE_CONFIG.API || {};
  const hasEndpoint = Boolean(endpoints.stats && endpoints.list);

  /* 2. 데이터 ======================================================================================================================= */

  const router = useRouter();
  const { mode: pageMode, dataObj, errorObj, isLoading } = usePageData({
    pageConfig: PAGE_CONFIG,
    initialDataObj,
    initialErrorObj,
  });
  const numberLocale = LANG_KO.view.number.locale;
  const numberZeroText = LANG_KO.view.number.zeroText;
  const statList = dataObj?.stats?.result?.statusSummaryList || [];
  const dataList = dataObj?.list?.result?.dataTemplateList || [];
  const initialErrorValue = initialErrorObj?.stats || initialErrorObj?.list || null;
  let initialErrorState = null;
  if (initialErrorValue) {
    if (typeof initialErrorValue === "string") {
      initialErrorState = { key: initialErrorValue };
    } else if (typeof initialErrorValue === "object") {
      const candidateKey = String(
        initialErrorValue.key || initialErrorValue.message || "",
      ).toUpperCase();
      initialErrorState = {
        key: candidateKey === dashboardErrorKeyObj.ENDPOINT_MISSING
          ? dashboardErrorKeyObj.ENDPOINT_MISSING
          : dashboardErrorKeyObj.INIT_FETCH_FAILED,
        code: initialErrorValue.code,
        requestId: initialErrorValue.requestId,
      };
    } else {
      initialErrorState = { key: dashboardErrorKeyObj.INIT_FETCH_FAILED };
    }
  }
  let statsErrorState = null;
  if (errorObj?.stats) {
    if (typeof errorObj.stats === "string") {
      statsErrorState = { key: errorObj.stats };
    } else if (typeof errorObj.stats === "object") {
      const candidateKey = String(
        errorObj.stats.key || errorObj.stats.message || "",
      ).toUpperCase();
      statsErrorState = {
        key: candidateKey === dashboardErrorKeyObj.ENDPOINT_MISSING
          ? dashboardErrorKeyObj.ENDPOINT_MISSING
          : dashboardErrorKeyObj.INIT_FETCH_FAILED,
        code: errorObj.stats.code,
        requestId: errorObj.stats.requestId,
      };
    } else {
      statsErrorState = { key: dashboardErrorKeyObj.INIT_FETCH_FAILED };
    }
  }
  let listErrorState = null;
  if (errorObj?.list) {
    if (typeof errorObj.list === "string") {
      listErrorState = { key: errorObj.list };
    } else if (typeof errorObj.list === "object") {
      const candidateKey = String(
        errorObj.list.key || errorObj.list.message || "",
      ).toUpperCase();
      listErrorState = {
        key: candidateKey === dashboardErrorKeyObj.ENDPOINT_MISSING
          ? dashboardErrorKeyObj.ENDPOINT_MISSING
          : dashboardErrorKeyObj.INIT_FETCH_FAILED,
        code: errorObj.list.code,
        requestId: errorObj.list.requestId,
      };
    } else {
      listErrorState = { key: dashboardErrorKeyObj.INIT_FETCH_FAILED };
    }
  }
  const errorState = !hasEndpoint
    ? { key: dashboardErrorKeyObj.ENDPOINT_MISSING }
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
  const totalCount = statList.reduce((countSum, row) => countSum + (row.count ?? 0), 0);
  const totalAmount = statList.reduce(
    (amountSum, row) => amountSum + Number(row.amountSum ?? 0),
    0
  );
  const runningCount = statList.find((row) => row.status === "running")?.count ?? 0;
  const pendingCount = statList.find((row) => row.status === "pending")?.count ?? 0;
  const activeCount = runningCount + pendingCount;
  const totalCountNumber = Number(totalCount || 0);
  const totalCountText = Number.isNaN(totalCountNumber)
    ? numberZeroText
    : totalCountNumber.toLocaleString(numberLocale);
  const totalAmountNumber = Number(totalAmount || 0);
  const totalAmountText = Number.isNaN(totalAmountNumber)
    ? numberZeroText
    : totalAmountNumber.toLocaleString(numberLocale);
  const activeCountNumber = Number(activeCount || 0);
  const activeCountText = Number.isNaN(activeCountNumber)
    ? numberZeroText
    : activeCountNumber.toLocaleString(numberLocale);
  const statCardList = [
    {
      label: LANG_KO.view.stat.totalCount,
      value: totalCountText,
      delta: null,
      deltaType: "neutral",
    },
    {
      label: LANG_KO.view.stat.totalAmount,
      value: `${totalAmountText}`,
      delta: null,
      deltaType: "neutral",
    },
    {
      label: LANG_KO.view.stat.activeCount,
      value: activeCountText,
      delta: null,
      deltaType: "neutral",
    },
  ];

  const donutDataList = statList.map((row) => ({
    label: LANG_KO.view.statusLabelMap[row.status] || row.status || LANG_KO.view.unknown,
    value: row.count ?? 0,
  }));

  const byStatusMap = new Map(
    statList.map((row) => [String(row.status || ""), Number(row.count || 0)])
  );
  const statusQuickList = statusOrderList.map((status) => {
    const countNumber = Number(byStatusMap.get(status) || 0);
    const statusCountText = Number.isNaN(countNumber)
      ? numberZeroText
      : countNumber.toLocaleString(numberLocale);
    const statusQueryParams = new URLSearchParams();
    if (status && LANG_KO.view.statusLabelMap[status]) statusQueryParams.set("status", status);
    const queryString = statusQueryParams.toString();
    const statusTaskHref = queryString ? `/dashboard/tasks?${queryString}` : "/dashboard/tasks";

    return {
      status,
      label: LANG_KO.view.statusLabelMap[status],
      countText: statusCountText,
      href: statusTaskHref,
    };
  });

  const byMonthMap = new Map();
  dataList.forEach((taskItemObj) => {
    let monthKey = LANG_KO.view.unknown;
    if (taskItemObj.createdAt) {
      const date = new Date(taskItemObj.createdAt);
      if (!Number.isNaN(date.getTime())) {
        monthKey = `${date.getMonth() + 1}${LANG_KO.view.monthSuffix}`;
      }
    }
    const monthBucketObj = byMonthMap.get(monthKey) || { label: monthKey, count: 0, amount: 0 };
    monthBucketObj.count += 1;
    monthBucketObj.amount += Number(taskItemObj.amount || 0);
    byMonthMap.set(monthKey, monthBucketObj);
  });
  const lineDataList = Array.from(byMonthMap.values());

  const legendFontSize = 12;
  let errorText = null;
  if (errorState?.key === dashboardErrorKeyObj.ENDPOINT_MISSING) {
    errorText = LANG_KO.view.error.endpointMissing;
  } else if (errorState?.key === dashboardErrorKeyObj.INIT_FETCH_FAILED) {
    errorText = LANG_KO.view.error.fetchFailed;
  }

  /* 3. UI ========================================================================================================================= */

  // 없음

  /* 4. 팝업 ======================================================================================================================= */

  // 없음

  /* 5. 기타 ======================================================================================================================= */

  // 없음

  /* 6. 커스텀 훅 =================================================================================================================== */

  // 없음

  /* 7. 함수 ======================================================================================================================= */

  // 없음

  /* 8. useEffect ================================================================================================================== */

  // 없음

  /* 9. 내부 컴포넌트 ============================================================================================================== */

  // 없음

  /* 10. 렌더링 ==================================================================================================================== */
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
          ? summarySkeletonList.map((skeletonIndex) => (
              <div
                key={`stat-skeleton-${skeletonIndex}`}
                className="border rounded-lg p-4 bg-white shadow-sm"
              >
                <Skeleton variant="text" lines={2} />
                <Skeleton className="mt-4 h-7 w-2/3" />
              </div>
            ))
          : statCardList.map((statCardObj) => (
              <Stat key={statCardObj.label} {...statCardObj} className="p-1" />
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
          dataList={lineDataList}
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
          height={chartHeight}
          hideLegend={false}
          legendFontSize={legendFontSize}
        />

        <EasyChart
          title={LANG_KO.view.chart.statusTitle}
          dataList={donutDataList}
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
          height={donutHeight}
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
            {statusQuickList.map((statusQuickObj) => (
              <Button
                key={`quick-${statusQuickObj.status}`}
                size="sm"
                variant="secondary"
                onClick={() => router.push(statusQuickObj.href)}
              >
                {statusQuickObj.label} {statusQuickObj.countText}
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
                render: (row) => {
                  const statusQueryParams = new URLSearchParams();
                  if (row?.status && LANG_KO.view.statusLabelMap[row.status]) {
                    statusQueryParams.set("status", row.status);
                  }
                  const queryString = statusQueryParams.toString();
                  const href = queryString ? `/dashboard/tasks?${queryString}` : "/dashboard/tasks";
                  return (
                    <Link
                      href={href}
                      className="text-left text-blue-700 hover:underline"
                    >
                      {row?.title || "-"}
                    </Link>
                  );
                },
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
