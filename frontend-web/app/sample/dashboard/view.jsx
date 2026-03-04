"use client";
/**
 * 파일명: sample/dashboard/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: 공개 샘플 대시보드 페이지 뷰(읽기 전용)
 */

import { useMemo } from "react";
import Link from "next/link";
import Card from "@/app/lib/component/Card";
import EasyChart from "@/app/lib/component/EasyChart";
import EasyTable from "@/app/lib/component/EasyTable";
import Stat from "@/app/lib/component/Stat";
import { useDemoSharedState } from "@/app/sample/demoSharedState";
import { normalizePageConfig } from "@/app/lib/runtime/pageData";
import { PAGE_CONFIG } from "./initData";
import { usePageData } from "@/app/lib/hooks/usePageData";
import LANG_KO from "./lang.ko";
import CRUD_LANG_KO from "@/app/sample/crud/lang.ko";

const CTA_LINK_LIST = [
  { href: "/sample/crud", label: LANG_KO.initData.ctaLabels.crud },
  { href: "/sample/admin", label: LANG_KO.initData.ctaLabels.admin },
];
const INITIAL_ROW_LIST = CRUD_LANG_KO.initData.rowList.map((item) => ({ ...item }));

/**
 * @description 공개 샘플 대시보드 화면을 렌더링. 입력/출력 계약을 함께 명시
 * 처리 규칙: CRUD shared state를 기반으로 통계/차트/최근 목록 파생 데이터를 계산해 표시한다.
 * @param {{ initialDataObj?: Object, initialErrorObj?: Object }} props
 */
const DemoDashboardView = ({ initialDataObj, initialErrorObj }) => {
  /* 1. 상수 ======================================================================================================================= */
  // 없음
  /* 2. 데이터 ======================================================================================================================= */
  const pageMode = normalizePageConfig(PAGE_CONFIG).MODE;
  usePageData({
    pageConfig: PAGE_CONFIG,
    initialDataObj,
    initialErrorObj,
  });

  const statusOrder = ["ready", "pending", "running", "done", "failed"];

  const dashboardHelper = {
    formatCurrency(value) {
      const num = Number(value || 0);
      if (Number.isNaN(num)) return LANG_KO.view.number.zeroText;
      return num.toLocaleString(LANG_KO.view.number.locale);
    },
    toStatusSummaryList(rowList) {
      return statusOrder.map((statusCode) => {
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
    },
    toMonthlyTrendList(rowList) {
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
            label: `${monthNo}${LANG_KO.view.monthSuffix}`,
            count: monthlyValue.count,
            amount: monthlyValue.amount,
          };
        });
    },
    toRecentTaskList(rowList) {
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
          status: rowItem?.status || LANG_KO.view.misc.defaultStatusCode,
          amount: Number(rowItem?.amount || 0),
          createdAt: rowItem?.createdAt || "-",
        }));
    },
  };

  const { value: rowList } = useDemoSharedState({
    stateKey: "demoCrudRows",
    initialValue: INITIAL_ROW_LIST,
  });
  const summaryList = dashboardHelper.toStatusSummaryList(rowList);
  const trendList = dashboardHelper.toMonthlyTrendList(rowList);
  const recentList = dashboardHelper.toRecentTaskList(rowList);

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
        label: LANG_KO.view.statLabel.totalCount,
        value: totalCount.toLocaleString("ko-KR"),
        deltaType: "neutral",
      },
      {
        label: LANG_KO.view.statLabel.totalAmount,
        value: dashboardHelper.formatCurrency(totalAmount),
        deltaType: "neutral",
      },
      {
        label: LANG_KO.view.statLabel.activePending,
        value: activeCount.toLocaleString("ko-KR"),
        deltaType: "neutral",
      },
    ];
  }, [summaryList]);

  const donutData = useMemo(
    () =>
      summaryList.map((item) => ({
        label: LANG_KO.view.statusLabelMap[item?.status] || item?.status || LANG_KO.view.unknown,
        value: Number(item?.count || 0),
      })),
    [summaryList],
  );

  const tableColumns = [
    { key: "title", header: LANG_KO.view.table.titleHeader, align: "left", width: "2fr" },
    {
      key: "status",
      header: LANG_KO.view.table.statusHeader,
      width: 120,
      render: (rowItem) =>
        LANG_KO.view.statusLabelMap[rowItem?.status] || rowItem?.status || "-",
    },
    {
      key: "amount",
      header: LANG_KO.view.table.amountHeader,
      width: 140,
      render: (rowItem) => dashboardHelper.formatCurrency(rowItem?.amount),
    },
    { key: "createdAt", header: LANG_KO.view.table.createdAtHeader, width: 120 },
  ];

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
    <div className="space-y-3" data-page-mode={pageMode}>
      <section className="grid gap-3 md:grid-cols-3">
        {statCardList.map((item) => (
          <Stat key={item.label} {...item} className="p-1" />
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <EasyChart
          title={LANG_KO.view.chart.trendTitle}
          dataList={trendList}
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
          height={180}
          legendFontSize={12}
        />
        <EasyChart
          title={LANG_KO.view.chart.statusTitle}
          dataList={donutData}
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
          height={180}
          legendFontSize={12}
          pieLabelFontSize={11}
        />
      </section>

      <section>
        <Card
          title={LANG_KO.view.card.recentTitle}
          subtitle={LANG_KO.view.card.recentSubtitle}
        >
          <EasyTable
            data={recentList}
            columns={tableColumns}
            pageSize={5}
            empty={LANG_KO.view.table.empty}
            rowKey={(rowItem, rowIndex) => rowItem?.title ?? rowIndex}
          />
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {CTA_LINK_LIST.map((ctaItem) => (
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
