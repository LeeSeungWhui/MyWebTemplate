/**
 * 파일명: sample/dashboard/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 공개 샘플 대시보드 페이지 정적 데이터
 */

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
  { label: "11월", count: 3, amount: 1850000 },
  { label: "12월", count: 5, amount: 2580000 },
  { label: "1월", count: 7, amount: 3340000 },
  { label: "2월", count: 9, amount: 4440000 },
];

export const RECENT_TASK_LIST = [
  {
    title: "랜딩 페이지 공개 퍼널 정리",
    status: "done",
    amount: 1200000,
    createdAt: "2026-02-20",
  },
  {
    title: "샘플 허브 카드 구성 보강",
    status: "running",
    amount: 880000,
    createdAt: "2026-02-21",
  },
  {
    title: "CRUD 검색/필터 UX 점검",
    status: "pending",
    amount: 740000,
    createdAt: "2026-02-21",
  },
  {
    title: "관리자 화면 탭 전환 QA",
    status: "ready",
    amount: 510000,
    createdAt: "2026-02-22",
  },
  {
    title: "포트폴리오 시각 구성 리뉴얼",
    status: "running",
    amount: 960000,
    createdAt: "2026-02-22",
  },
];

export const CTA_LINK_LIST = [
  { href: "/sample/crud", label: "CRUD 샘플 보기" },
  { href: "/sample/admin", label: "관리자 화면 보기" },
];
