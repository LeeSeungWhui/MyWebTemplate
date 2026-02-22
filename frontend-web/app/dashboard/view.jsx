"use client";
/**
 * 파일명: dashboard/view.jsx
 * 작성자: Codex
 * 갱신일: 2025-11-27
 * 설명: 대시보드 클라이언트 뷰
 */

import { useEffect, useMemo, useState } from "react";
import { useEasyList } from "@/app/lib/dataset/EasyList";
import Button from "@/app/lib/component/Button";
import Card from "@/app/lib/component/Card";
import EasyChart from "@/app/lib/component/EasyChart";
import EasyTable from "@/app/lib/component/EasyTable";
import Skeleton from "@/app/lib/component/Skeleton";
import Stat from "@/app/lib/component/Stat";
import { apiJSON } from "@/app/lib/runtime/api";
import { PAGE_MODE } from "./initData";

const CHART_HEIGHT = 180;
const DONUT_HEIGHT = 180;
const STATUS_LABELS = {
  ready: "준비",
  pending: "대기",
  running: "진행중",
  done: "완료",
  failed: "실패",
};

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

const toErrorState = (err, key) => {
  if (!err) return { key };
  return {
    key,
    code: err.code,
    requestId: err.requestId,
  };
};

const DashboardView = ({ statList, dataList, initialError }) => {
  const statsList = useEasyList(statList || []);
  const tableList = useEasyList(dataList || []);
  const [isLoading, setIsLoading] = useState(
    !statList?.length || !dataList?.length
  );
  const [error, setError] = useState(() => normalizeErrorState(initialError));
  const endpoints = PAGE_MODE.endPoints || {};
  const hasEndpoint = Boolean(endpoints.stats && endpoints.list);

  const fetchDashboard = async () => {
    if (!hasEndpoint) {
      setError(toErrorState(null, "ENDPOINT_MISSING"));
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
      setError(toErrorState(err, "FETCH_FAILED"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (statList?.length && dataList?.length) return;
    fetchDashboard();
  }, [statList, dataList, hasEndpoint]);

  const statCards = useMemo(() => {
    const byStatus = statsList.toJSON();
    const totalCount = byStatus.reduce((acc, row) => acc + (row.count ?? 0), 0);
    const totalAmount = byStatus.reduce(
      (acc, row) => acc + Number(row.amountSum ?? 0),
      0
    );
    const activeCount =
      byStatus.find((row) => row.status === "active")?.count ?? 0;
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
        label: "활성 상태",
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

  const tableData = tableList;

  const legendFontSize = 12;
  const errorText =
    error?.key === "ENDPOINT_MISSING"
      ? "엔드포인트가 설정되지 않았습니다."
      : error?.key === "INIT_FETCH_FAILED" || error?.key === "FETCH_FAILED"
      ? "대시보드 데이터를 불러오지 못했습니다."
      : null;

  return (
    <div className="space-y-2">
      {errorText ? (
        <section aria-label="오류 안내">
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
          </div>
        </section>
      ) : null}

      <section aria-label="지표 요약" className="grid gap-3 md:grid-cols-3">
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

      <section aria-label="차트 영역" className="grid gap-3 md:grid-cols-2">
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

      <section aria-label="업무 테이블">
        <Card
          title="최근 업무"
          actions={
            <Button size="sm" variant="secondary">
              전체보기
            </Button>
          }
        >
          <EasyTable
            data={tableData}
            loading={isLoading}
            columns={[
              { key: "title", header: "제목" },
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
