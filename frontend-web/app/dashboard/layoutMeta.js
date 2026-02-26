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
import LANG_KO from "./lang.ko";

const { layoutMeta } = LANG_KO;
const MENU_TEMPLATE_LIST = layoutMeta.menuList.map((item) => ({ ...item }));

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
  if (Array.isArray(searchParams[key])) return String(searchParams[key][0] || "");
  if (searchParams[key] == null) return "";
  return String(searchParams[key]);
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
      subMenuNm: statusValue ? item.text : layoutMeta.tasksAllStatus,
      href,
      active: isActive,
    };
  });
};

const resolveTitle = (routeKey) => {
  if (routeKey === "tasks") return layoutMeta.title.tasks;
  if (routeKey === "settings") return layoutMeta.title.settings;
  return layoutMeta.title.dashboard;
};

const resolveSettingsSubtitle = (tab) => {
  if (tab === "system") return layoutMeta.subtitle.settingsSystem;
  return layoutMeta.subtitle.settingsProfile;
};

const resolveTasksSubtitle = ({ keyword, status, sort, page }) => {
  const partList = [layoutMeta.subtitle.tasksPrefix];
  if (status) {
    const statusLabel = STATUS_LABEL_MAP.get(status);
    if (statusLabel) {
      partList.push(`${layoutMeta.subtitle.statusPrefix}: ${statusLabel}`);
    }
  }
  if (sort) {
    const isDefaultSort = sort === DEFAULT_SORT;
    const sortLabel = SORT_LABEL_MAP.get(sort);
    if (!isDefaultSort && sortLabel) {
      partList.push(`${layoutMeta.subtitle.sortPrefix}: ${sortLabel}`);
    }
  }
  if (keyword) partList.push(`${layoutMeta.subtitle.keywordPrefix}: ${keyword}`);
  if (page > 1) partList.push(`${layoutMeta.subtitle.pagePrefix}: ${page}`);
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

  let subtitle = layoutMeta.subtitle.dashboard;
  if (routeKey === "tasks") {
    subtitle = resolveTasksSubtitle({ keyword, status, sort, page });
  } else if (routeKey === "settings") {
    subtitle = resolveSettingsSubtitle(tab);
  }

  return {
    title: resolveTitle(routeKey),
    subtitle,
    text: layoutMeta.welcomeText,
    menuList,
    subMenuList,
  };
};
