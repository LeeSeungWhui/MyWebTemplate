/**
 * 파일명: dashboard/layoutMeta.js
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 대시보드 레이아웃(헤더/사이드바) 경로·쿼리 메타 계산 유틸
 */

import {
  DEFAULT_SORT,
  SORT_FILTER_LIST,
  STATUS_FILTER_LIST,
} from "./tasks/initData";

const MENU_TEMPLATE_LIST = [
  {
    menuId: "dashboard",
    menuNm: "대시보드",
    href: "/dashboard",
    icon: "ri:RiDashboardLine",
  },
  {
    menuId: "tasks",
    menuNm: "업무 관리",
    href: "/dashboard/tasks",
    icon: "ri:RiListCheck3",
  },
  {
    menuId: "settings",
    menuNm: "설정",
    href: "/dashboard/settings",
    icon: "ri:RiSettings3Line",
  },
];

const STATUS_LABEL_MAP = new Map(
  STATUS_FILTER_LIST.filter((item) => item.value).map((item) => [
    String(item.value),
    String(item.text),
  ])
);

const SORT_LABEL_MAP = new Map(
  SORT_FILTER_LIST.map((item) => [String(item.value), String(item.text)])
);

const pickQueryValue = (searchParams, key) => {
  if (!searchParams || !key) return "";
  if (typeof searchParams.get === "function") {
    return String(searchParams.get(key) || "");
  }
  const rawValue = searchParams[key];
  if (Array.isArray(rawValue)) return String(rawValue[0] || "");
  if (rawValue == null) return "";
  return String(rawValue);
};

const toPositiveInt = (rawValue, defaultValue = 1) => {
  const parsed = Number.parseInt(String(rawValue || ""), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return defaultValue;
  return parsed;
};

const resolveRouteKey = (pathname) => {
  const pathText = String(pathname || "");
  if (pathText.startsWith("/dashboard/tasks")) return "tasks";
  if (pathText.startsWith("/dashboard/settings")) return "settings";
  return "dashboard";
};

const buildTasksSubMenuList = ({ status }) => {
  return STATUS_FILTER_LIST.map((item) => {
    const statusValue = String(item.value || "");
    const href = statusValue
      ? `/dashboard/tasks?status=${encodeURIComponent(statusValue)}`
      : "/dashboard/tasks";
    const isActive = statusValue ? status === statusValue : !status;
    return {
      menuId: "tasks",
      subMenuId: statusValue || "all",
      subMenuNm: statusValue ? item.text : "전체 상태",
      href,
      active: isActive,
    };
  });
};

const resolveTitle = (routeKey) => {
  if (routeKey === "tasks") return "업무 관리";
  if (routeKey === "settings") return "설정";
  return "대시보드";
};

const resolveSettingsSubtitle = (tab) => {
  if (tab === "system") return "대시보드 > 설정 > 시스템 설정";
  return "대시보드 > 설정 > 내 프로필";
};

const resolveTasksSubtitle = ({ keyword, status, sort, page }) => {
  const partList = ["대시보드 > 업무 관리"];
  if (status) {
    const statusLabel = STATUS_LABEL_MAP.get(status);
    if (statusLabel) {
      partList.push(`상태: ${statusLabel}`);
    }
  }
  if (sort) {
    const isDefaultSort = sort === DEFAULT_SORT;
    const sortLabel = SORT_LABEL_MAP.get(sort);
    if (!isDefaultSort && sortLabel) {
      partList.push(`정렬: ${sortLabel}`);
    }
  }
  if (keyword) partList.push(`검색: ${keyword}`);
  if (page > 1) partList.push(`페이지: ${page}`);
  return partList.join(" · ");
};

/**
 * @description 현재 대시보드 경로/쿼리 기준으로 헤더/사이드바 메타를 계산한다.
 * @param {Object} params
 * @param {string} params.pathname 현재 pathname
 * @param {URLSearchParams|Object} params.searchParams 현재 search params
 * @returns {{ title:string, subtitle:string, text:string, menuList:Array, subMenuList:Array }}
 */
export const resolveDashboardLayoutMeta = ({ pathname, searchParams }) => {
  const routeKey = resolveRouteKey(pathname);
  const keyword = pickQueryValue(searchParams, "q").trim();
  const status = pickQueryValue(searchParams, "status").trim().toLowerCase();
  const sort = pickQueryValue(searchParams, "sort").trim().toLowerCase() || DEFAULT_SORT;
  const page = toPositiveInt(pickQueryValue(searchParams, "page"), 1);
  const tab = pickQueryValue(searchParams, "tab").trim().toLowerCase();

  const menuList = MENU_TEMPLATE_LIST.map((item) => ({
    ...item,
    active: item.menuId === routeKey,
  }));

  const subMenuList = routeKey === "tasks"
    ? buildTasksSubMenuList({ status })
    : [];

  let subtitle = "대시보드 > 요약";
  if (routeKey === "tasks") {
    subtitle = resolveTasksSubtitle({ keyword, status, sort, page });
  } else if (routeKey === "settings") {
    subtitle = resolveSettingsSubtitle(tab);
  }

  return {
    title: resolveTitle(routeKey),
    subtitle,
    text: "어서오세요.",
    menuList,
    subMenuList,
  };
};
