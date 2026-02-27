"use client";
/**
 * 파일명: dashboard/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 대시보드 클라이언트 뷰
 */

import { useEffect } from "react";
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
 * @description 대시보드 요약 통계/차트/최근 목록 화면을 렌더링. 입력/출력 계약을 함께 명시
 * 처리 규칙: SSR 데이터가 있으면 즉시 사용하고, 없으면 API로 stats/list를 병렬 조회한다.
 */
const DashboardView = ({ statList, dataList, initialError }) => {

  /**
   * @description 날짜 문자열에서 월 라벨(`n월`)을 계산
   * 실패 동작: 비어 있거나 파싱 실패한 입력은 unknown 라벨을 반환한다.
   * @updated 2026-02-27
   */
  const monthKey = (iso) => {
    if (!iso) return LANG_KO.view.unknown;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return LANG_KO.view.unknown;
    const month = date.getMonth() + 1;
    return `${month}${LANG_KO.view.monthSuffix}`;
  };

  /**
   * @description 숫자 값을 로케일 기준 문자열로 포맷
   * 반환값: NaN 입력은 0 텍스트를 반환하고, 정상 입력은 locale 문자열을 반환한다.
   * @updated 2026-02-27
   */
  const formatNumber = (value) => {
    const num = Number(value || 0);
    if (Number.isNaN(num)) return LANG_KO.view.number.zeroText;
    return num.toLocaleString(LANG_KO.view.number.locale);
  };

  /**
   * @description 금액 숫자를 통계 카드용 문자열로 포맷
   * 처리 규칙: 현재는 formatNumber 정책을 동일하게 재사용한다.
   * @updated 2026-02-27
   */
  const formatCurrency = (value) => {
    return formatNumber(value);
  };

  /**
   * @description 에러 키를 사용자 노출 메시지로 매핑. 입력/출력 계약을 함께 명시
   * 반환값: 매핑된 메시지 또는 null.
   * @updated 2026-02-27
   */
  const resolveErrorText = (errorKey) => {
    if (errorKey === DASHBOARD_ERROR_KEY.ENDPOINT_MISSING) {
      return LANG_KO.view.error.endpointMissing;
    }
    if (errorKey === DASHBOARD_ERROR_KEY.INIT_FETCH_FAILED) {
      return LANG_KO.view.error.fetchFailed;
    }
    return null;
  };

  /**
   * @description 상태 필터를 포함한 `/dashboard/tasks` 이동 경로를 생성
   * 반환값: status query 포함 여부가 반영된 href 문자열.
   * @updated 2026-02-27
   */
  const createTasksPath = ({ status }) => {

    const params = new URLSearchParams();
    if (status && LANG_KO.view.statusLabelMap[status]) params.set("status", status);
    return params.toString()
      ? `/dashboard/tasks?${params.toString()}`
      : "/dashboard/tasks";
  };

  /**
   * @description 다양한 에러 표현(string/object/null)을 공통 shape로 정규화. 입력/출력 계약을 함께 명시
   * 반환값: `{key, code, requestId}` 구조 또는 null.
   * @updated 2026-02-27
   */
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
  const dashboardDataList = useEasyList(dataList || []);
  const ui = EasyObj({
    isLoading:
      !isSsrMode(PAGE_MODE.MODE) || !statList?.length || !dataList?.length,
    error: normalizeErrorState(initialError),
  });
  const endpoints = PAGE_MODE.endPoints || {};
  const hasEndpoint = Boolean(endpoints.stats && endpoints.list);

  /**
   * @description 대시보드 API(stats/list)를 조회하고 EasyList 모델을 동기화
   * 실패 동작: 조회 실패 시 ui.error에 표준 에러 상태를 저장하고 로딩을 종료한다.
   * @updated 2026-02-27
   */
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
      dashboardDataList.copy(normalizedItems);
    } catch (err) {
      console.error(LANG_KO.view.error.fetchFailed, err);
      ui.error = toErrorState(err, DASHBOARD_ERROR_KEY.INIT_FETCH_FAILED);
    } finally {
      ui.isLoading = false;
    }
  };

  useEffect(() => {
    const hasSsrData = statList?.length && dataList?.length;
    if (isSsrMode(PAGE_MODE.MODE) && hasSsrData) {
      statsList.copy(statList || []);
      dashboardDataList.copy(dataList || []);
      ui.isLoading = false;
      return;
    }
    fetchDashboard();
  }, [statList, dataList, hasEndpoint]);

  const byStatus = statsList.toJSON();
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
      value: formatNumber(totalCount),
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
      value: formatNumber(activeCount),
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
    href: createTasksPath({ status }),
  }));

  const items = dashboardDataList.toJSON();
  const byMonth = new Map();
  items.forEach((item) => {
    const key = monthKey(item.createdAt);
    const bucket = byMonth.get(key) || { label: key, count: 0, amount: 0 };
    bucket.count += 1;
    bucket.amount += Number(item.amount || 0);
    byMonth.set(key, bucket);
  });
  const lineData = Array.from(byMonth.values());

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
                {LANG_KO.view.error.requestIdLabel}: {ui.error.requestId}
              </div>
            ) : null}
            {ui.error?.code ? (
              <div className="mt-1 text-xs text-red-700/80">
                {LANG_KO.view.error.codeLabel}: {ui.error.code}
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
        {ui.isLoading
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
                {item.label} {formatNumber(item.count)}
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
            data={dashboardDataList}
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
