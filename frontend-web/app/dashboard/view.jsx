"use client";
/**
 * 파일명: dashboard/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 대시보드 클라이언트 뷰
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEasyList } from "@/app/lib/dataset/EasyList";
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

const CHART_HEIGHT = 180;
const DONUT_HEIGHT = 180;
const STATUS_LABELS = {
  ready: "준비",
  pending: "대기",
  running: "진행중",
  done: "완료",
  failed: "실패",
};
const STATUS_ORDER = ["ready", "pending", "running", "done", "failed"];

const monthKey = (iso) => {
  if (!iso) return "알 수 없음";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "알 수 없음";
  const month = date.getMonth() + 1;
  return `${month}월`;
};

const formatCurrency = (value) => {
  const num = Number(value || 0);
  if (Number.isNaN(num)) return "0";
  return num.toLocaleString("ko-KR");
};

const resolveErrorText = (errorKey) => {
  if (errorKey === DASHBOARD_ERROR_KEY.ENDPOINT_MISSING) {
    return "엔드포인트가 설정되지 않았습니다.";
  }
  if (errorKey === DASHBOARD_ERROR_KEY.INIT_FETCH_FAILED) {
    return "대시보드 데이터를 불러오지 못했습니다.";
  }
  return null;
};

const createTasksPath = ({ status }) => {
  const params = new URLSearchParams();
  if (status && STATUS_LABELS[status]) params.set("status", status);
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

const DashboardView = ({ statList, dataList, initialError }) => {
  const router = useRouter();
  const statsList = useEasyList(statList || []);
  const tableList = useEasyList(dataList || []);
  const [isLoading, setIsLoading] = useState(() =>
    !isSsrMode(PAGE_MODE.MODE) || !statList?.length || !dataList?.length
  );
  const [error, setError] = useState(() => normalizeErrorState(initialError));
  const endpoints = PAGE_MODE.endPoints || {};
  const hasEndpoint = Boolean(endpoints.stats && endpoints.list);

  const fetchDashboard = async () => {
    if (!hasEndpoint) {
      setError(toErrorState(null, DASHBOARD_ERROR_KEY.ENDPOINT_MISSING));
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, listRes] = await Promise.all([
        apiJSON(endpoints.stats),
        apiJSON(endpoints.list),
      ]);
      statsList.copy(statsRes?.result?.byStatus || []);
      tableList.copy(listRes?.result?.items || []);
    } catch (err) {
      console.error("대시보드 데이터 조회 실패", err);
      setError(toErrorState(err, DASHBOARD_ERROR_KEY.INIT_FETCH_FAILED));
    } finally {
      setIsLoading(false);
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
        label: "전체 건수",
        value: totalCount.toLocaleString("ko-KR"),
        delta: null,
        deltaType: "neutral",
      },
      {
        label: "총 금액",
        value: `${formatCurrency(totalAmount)}`,
        delta: null,
        deltaType: "neutral",
      },
      {
        label: "진행 중",
        value: activeCount.toLocaleString("ko-KR"),
        delta: null,
        deltaType: "neutral",
      },
    ];
  }, [statsList]);

  const donutData = useMemo(() => {
    const byStatus = statsList.toJSON();
    return byStatus.map((row) => ({
      label: STATUS_LABELS[row.status] || row.status || "알 수 없음",
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
      label: STATUS_LABELS[status],
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
  const errorText = resolveErrorText(error?.key);

  return (
    <div className="space-y-2">
      <h1 className="sr-only">대시보드</h1>
      {errorText ? (
        <section role="region" aria-labelledby="dashboard-error-heading">
          <h2 id="dashboard-error-heading" className="sr-only">
            오류 안내
          </h2>
          <div
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            <div>{errorText}</div>
            {error?.requestId ? (
              <div className="mt-1 text-xs text-red-700/80">
                requestId: {error.requestId}
              </div>
            ) : null}
            {error?.code ? (
              <div className="mt-1 text-xs text-red-700/80">code: {error.code}</div>
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
          지표 요약
        </h2>
        {isLoading
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
          차트 영역
        </h2>
        <EasyChart
          title="가입/활성 추이"
          dataList={lineData}
          loading={isLoading}
          seriesList={[
            {
              seriesId: "count",
              seriesNm: "건수",
              dataKey: "count",
              color: "#2563eb",
            },
            {
              seriesId: "amount",
              seriesNm: "금액",
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
          title="상태 분포"
          dataList={donutData}
          loading={isLoading}
          seriesList={[
            {
              seriesId: "value",
              seriesNm: "건수",
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
          업무 테이블
        </h2>
        <Card title="업무 바로가기" className="mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => router.push("/dashboard/tasks")}
            >
              전체 업무
            </Button>
            {statusQuickList.map((item) => (
              <Button
                key={`quick-${item.status}`}
                size="sm"
                variant="secondary"
                onClick={() => router.push(item.href)}
              >
                {item.label} {item.count.toLocaleString("ko-KR")}건
              </Button>
            ))}
          </div>
        </Card>
        <Card
          title="최근 업무"
          actions={
            <Button size="sm" variant="secondary" onClick={() => router.push("/dashboard/tasks")}>
              전체보기
            </Button>
          }
        >
          <EasyTable
            data={tableList}
            loading={isLoading}
            columns={[
              {
                key: "title",
                header: "제목",
                render: (row) => (
                  <Link
                    href={createTasksPath({ status: row?.status })}
                    className="text-left text-blue-700 hover:underline"
                  >
                    {row?.title || "-"}
                  </Link>
                ),
              },
              { key: "status", header: "상태" },
              { key: "amount", header: "금액" },
              { key: "createdAt", header: "생성일" },
            ]}
            pageSize={4}
            empty={error ? "데이터를 불러오지 못했습니다." : "업무가 없습니다."}
          />
        </Card>
      </section>
    </div>
  );
};

export default DashboardView;
