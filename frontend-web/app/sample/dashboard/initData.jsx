/**
 * 파일명: sample/dashboard/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 공개 샘플 대시보드 페이지 정적 데이터
 */

import LANG_KO from "./lang.ko";

const { initData } = LANG_KO;

export const PAGE_MODE = {
  MODE: "STATIC",
  PUBLIC_PATH: "/sample/dashboard",
  READ_ONLY: true,
};

export const STATUS_SUMMARY_LIST = [
  { status: "ready", count: 4, amountSum: 1950000 },
  { status: "pending", count: 5, amountSum: 2670000 },
  { status: "running", count: 6, amountSum: 4120000 },
  { status: "done", count: 8, amountSum: 5230000 },
  { status: "failed", count: 1, amountSum: 240000 },
];

export const MONTHLY_TREND_LIST = [
  { label: initData.monthlyTrendLabels[0], count: 3, amount: 1850000 },
  { label: initData.monthlyTrendLabels[1], count: 5, amount: 2580000 },
  { label: initData.monthlyTrendLabels[2], count: 7, amount: 3340000 },
  { label: initData.monthlyTrendLabels[3], count: 9, amount: 4440000 },
];

export const RECENT_TASK_LIST = [
  {
    title: initData.recentTaskTitles[0],
    status: "done",
    amount: 1200000,
    createdAt: "2026-02-20",
  },
  {
    title: initData.recentTaskTitles[1],
    status: "running",
    amount: 880000,
    createdAt: "2026-02-21",
  },
  {
    title: initData.recentTaskTitles[2],
    status: "pending",
    amount: 740000,
    createdAt: "2026-02-21",
  },
  {
    title: initData.recentTaskTitles[3],
    status: "ready",
    amount: 510000,
    createdAt: "2026-02-22",
  },
  {
    title: initData.recentTaskTitles[4],
    status: "running",
    amount: 960000,
    createdAt: "2026-02-22",
  },
];

export const CTA_LINK_LIST = [
  { href: "/sample/crud", label: initData.ctaLabels.crud },
  { href: "/sample/admin", label: initData.ctaLabels.admin },
];

export const PAGE_CONFIG = {
  MODE: "CSR",
  API: {},
};
