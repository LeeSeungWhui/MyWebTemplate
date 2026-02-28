"use client";
/**
 * 파일명: sample/dashboard/view.jsx
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
import LANG_KO from "./lang.ko";

/**
 * @description 공개 샘플 대시보드 화면을 렌더링. 입력/출력 계약을 함께 명시
 * 처리 규칙: CRUD shared state를 기반으로 통계/차트/최근 목록 파생 데이터를 계산해 표시한다.
 * @param {{ initRows:Array, ctaList:Array }} props
 */
const DemoDashboardView = ({
  initRows = [],
  ctaList = [],
}) => {

  const statusOrder = ["ready", "pending", "running", "done", "failed"];

  /**
   * @description 금액 숫자를 로케일 포맷 문자열로 변환. 입력/출력 계약을 함께 명시
   * 반환값: NaN이면 0 텍스트, 정상값이면 locale 기반 숫자 문자열.
   * @updated 2026-02-27
   */
  const formatCurrency = (value) => {
    const num = Number(value || 0);
    if (Number.isNaN(num)) return LANG_KO.view.number.zeroText;
    return num.toLocaleString(LANG_KO.view.number.locale);
  };

  /**
   * @description 행 목록을 상태별 건수/합계 금액 요약 배열로 변환. 입력/출력 계약을 함께 명시
   * 반환값: statusOrder 순서가 보장된 `{status,count,amountSum}` 리스트.
   * @updated 2026-02-27
   */
  const toStatusSummaryList = (rowList) => {
    /**
     * @description CRUD 샘플 행 목록으로 상태 집계를 생성
     * 처리 규칙: statusOrder 순서로 순회하며 count/amountSum 누적 요약을 생성.
     * @updated 2026-02-23
     */
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
  };

  /**
   * @description 행 목록에서 월별 건수/금액 추이 데이터를 생성. 입력/출력 계약을 함께 명시
   * 처리 규칙: `YYYY-MM` 키로 집계 후 월 오름차순 정렬해 `n월` 라벨로 변환한다.
   * @updated 2026-02-27
   */
  const toMonthlyTrendList = (rowList) => {
    /**
     * @description CRUD 샘플 행 목록으로 월별 추이 데이터를 생성
     * 처리 규칙: createdAt를 YYYY-MM 기준으로 그룹화하고 월 오름차순 결과를 생성.
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
          label: `${monthNo}${LANG_KO.view.monthSuffix}`,
          count: monthlyValue.count,
          amount: monthlyValue.amount,
        };
      });
  };

  /**
   * @description 최근 생성일 기준 상위 5건 업무 목록 표 데이터 생성
   * 처리 규칙: createdAt 내림차순, 동률 시 id 내림차순으로 정렬한다.
   * @updated 2026-02-27
   */
  const toRecentTaskList = (rowList) => {
    /**
     * @description CRUD 샘플 행 목록으로 최근 업무 상위 5건을 구성
     * 처리 규칙: createdAt/id 내림차순 정렬 후 상위 5건으로 절단.
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
        status: rowItem?.status || LANG_KO.view.misc.defaultStatusCode,
        amount: Number(rowItem?.amount || 0),
        createdAt: rowItem?.createdAt || "-",
      }));
  };

  const { value: rowList } = useDemoSharedState({
    stateKey: "demoCrudRows",
    initialValue: initRows,
  });
  const summaryList = toStatusSummaryList(rowList);
  const trendList = toMonthlyTrendList(rowList);
  const recentList = toRecentTaskList(rowList);

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
        value: formatCurrency(totalAmount),
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
      render: (rowItem) => formatCurrency(rowItem?.amount),
    },
    { key: "createdAt", header: LANG_KO.view.table.createdAtHeader, width: 120 },
  ];

  return (
    <div className="space-y-3">
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
