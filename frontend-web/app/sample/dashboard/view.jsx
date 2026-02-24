"use client";
/**
 * 파일명: demo/dashboard/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 공개 샘플 대시보드 페이지 뷰(읽기 전용)
 */

import { useMemo } from "react";
import Link from "next/link";
import Card from "@/app/lib/component/Card";
import EasyChart from "@/app/lib/component/EasyChart";
import EasyTable from "@/app/lib/component/EasyTable";
import Stat from "@/app/lib/component/Stat";
import { useDemoSharedState } from "@/app/sample/demoSharedState";

const STATUS_LABEL_MAP = {
  ready: "준비",
  pending: "대기",
  running: "진행중",
  done: "완료",
  failed: "실패",
};

const STATUS_ORDER = ["ready", "pending", "running", "done", "failed"];

const formatCurrency = (value) => {
  const num = Number(value || 0);
  if (Number.isNaN(num)) return "0";
  return num.toLocaleString("ko-KR");
};

const toStatusSummaryList = (rowList) => {
  /**
   * @description CRUD 샘플 행 목록으로 상태 집계를 생성한다.
   * @updated 2026-02-23
   */
  return STATUS_ORDER.map((statusCode) => {
    const filteredRows = rowList.filter(
      (rowItem) => String(rowItem?.status || "") === statusCode,
    );
    return {
      status: statusCode,
      count: filteredRows.length,
      amountSum: filteredRows.reduce(
        (total, rowItem) => total + Number(rowItem?.amount || 0),
        0,
      ),
    };
  });
};

const toMonthlyTrendList = (rowList) => {
  /**
   * @description CRUD 샘플 행 목록으로 월별 추이 데이터를 생성한다.
   * @updated 2026-02-23
   */
  const monthlyMap = {};
  rowList.forEach((rowItem) => {
    const createdAt = String(rowItem?.createdAt || "");
    const matched = createdAt.match(/^(\d{4})-(\d{2})-\d{2}$/);
    if (!matched) return;
    const key = `${matched[1]}-${matched[2]}`;
    const prevValue = monthlyMap[key] || { count: 0, amount: 0 };
    monthlyMap[key] = {
      count: prevValue.count + 1,
      amount: prevValue.amount + Number(rowItem?.amount || 0),
    };
  });
  return Object.keys(monthlyMap)
    .sort()
    .map((monthKey) => {
      const monthNo = Number(monthKey.split("-")[1] || 0);
      const monthlyValue = monthlyMap[monthKey] || { count: 0, amount: 0 };
      return {
        label: `${monthNo}월`,
        count: monthlyValue.count,
        amount: monthlyValue.amount,
      };
    });
};

const toRecentTaskList = (rowList) => {
  /**
   * @description CRUD 샘플 행 목록으로 최근 업무 상위 5건을 구성한다.
   * @updated 2026-02-23
   */
  return [...rowList]
    .sort((rowA, rowB) => {
      const dateA = String(rowA?.createdAt || "");
      const dateB = String(rowB?.createdAt || "");
      if (dateA === dateB) {
        return Number(rowB?.id || 0) - Number(rowA?.id || 0);
      }
      return dateA < dateB ? 1 : -1;
    })
    .slice(0, 5)
    .map((rowItem) => ({
      title: rowItem?.title || "-",
      status: rowItem?.status || "ready",
      amount: Number(rowItem?.amount || 0),
      createdAt: rowItem?.createdAt || "-",
    }));
};

/**
 * @description 공개 샘플 대시보드 화면을 렌더링한다.
 * @param {{ initRows:Array, ctaList:Array }} props
 */
const DemoDashboardView = (props) => {
  const {
    initRows = [],
    ctaList = [],
  } = props;
  const { value: rowList } = useDemoSharedState({
    stateKey: "demoCrudRows",
    initialValue: initRows,
  });
  const summaryList = useMemo(() => toStatusSummaryList(rowList), [rowList]);
  const trendList = useMemo(() => toMonthlyTrendList(rowList), [rowList]);
  const recentList = useMemo(() => toRecentTaskList(rowList), [rowList]);

  const statCardList = useMemo(() => {
    const totalCount = summaryList.reduce(
      (total, item) => total + Number(item?.count || 0),
      0,
    );
    const totalAmount = summaryList.reduce(
      (total, item) => total + Number(item?.amountSum || 0),
      0,
    );
    const activeCount = summaryList.reduce((total, item) => {
      const status = String(item?.status || "");
      if (status === "running" || status === "pending") {
        return total + Number(item?.count || 0);
      }
      return total;
    }, 0);
    return [
      {
        label: "전체 건수",
        value: totalCount.toLocaleString("ko-KR"),
        deltaType: "neutral",
      },
      {
        label: "총 금액",
        value: formatCurrency(totalAmount),
        deltaType: "neutral",
      },
      {
        label: "진행 + 대기",
        value: activeCount.toLocaleString("ko-KR"),
        deltaType: "neutral",
      },
    ];
  }, [summaryList]);

  const donutData = useMemo(
    () =>
      summaryList.map((item) => ({
        label: STATUS_LABEL_MAP[item?.status] || item?.status || "알 수 없음",
        value: Number(item?.count || 0),
      })),
    [summaryList],
  );

  const tableColumns = useMemo(
    () => [
      { key: "title", header: "제목", align: "left", width: "2fr" },
      {
        key: "status",
        header: "상태",
        width: 120,
        render: (rowItem) =>
          STATUS_LABEL_MAP[rowItem?.status] || rowItem?.status || "-",
      },
      {
        key: "amount",
        header: "금액",
        width: 140,
        render: (rowItem) => formatCurrency(rowItem?.amount),
      },
      { key: "createdAt", header: "등록일", width: 120 },
    ],
    [],
  );

  return (
    <div className="space-y-3">
      <section className="grid gap-3 md:grid-cols-3">
        {statCardList.map((item) => (
          <Stat key={item.label} {...item} className="p-1" />
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <EasyChart
          title="월별 추이"
          dataList={trendList}
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
          height={180}
          legendFontSize={12}
        />
        <EasyChart
          title="상태 분포"
          dataList={donutData}
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
          height={180}
          legendFontSize={12}
          pieLabelFontSize={11}
        />
      </section>

      <section>
        <Card
          title="최근 업무"
          subtitle="공개 샘플 대시보드는 읽기 전용으로 제공합니다."
        >
          <EasyTable
            data={recentList}
            columns={tableColumns}
            pageSize={5}
            empty="표시할 업무가 없습니다."
            rowKey={(rowItem, rowIndex) => rowItem?.title ?? rowIndex}
          />
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {ctaList.map((ctaItem) => (
              <Link
                key={ctaItem.href}
                href={ctaItem.href}
                className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
              >
                {ctaItem.label}
              </Link>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
};

export default DemoDashboardView;
