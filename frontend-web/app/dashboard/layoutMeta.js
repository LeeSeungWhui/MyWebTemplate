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

/**
 * @description searchParams에서 키 값을 문자열로 안전 조회
 * 처리 규칙: URLSearchParams.get, 배열, 단일값 순으로 읽고 없으면 빈 문자열을 반환한다.
 * @updated 2026-02-27
 */
const pickQueryValue = (searchParams, key) => {
  if (!searchParams || !key) return "";
  if (typeof searchParams.get === "function") {
    return String(searchParams.get(key) || "");
  }
  if (Array.isArray(searchParams[key])) return String(searchParams[key][0] || "");
  if (searchParams[key] == null) return "";
  return String(searchParams[key]);
};

/**
 * @description 양의 정수 파라미터를 파싱하고 유효하지 않으면 기본값을 사용
 * 반환값: 1 이상 정수 또는 defaultValue.
 * @updated 2026-02-27
 */
const toPositiveInt = (rawValue, defaultValue = 1) => {
  const parsed = Number.parseInt(String(rawValue || ""), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return defaultValue;
  return parsed;
};

/**
 * @description pathname을 dashboard 메뉴 키(`dashboard/tasks/settings`)로 매핑
 * 반환값: 사이드바 활성 메뉴 결정에 사용하는 routeKey 문자열.
 * @updated 2026-02-27
 */
const resolveRouteKey = (pathname) => {
  const pathText = String(pathname || "");
  if (pathText.startsWith("/dashboard/tasks")) return "tasks";
  if (pathText.startsWith("/dashboard/settings")) return "settings";
  return "dashboard";
};

/**
 * @description 상태 필터 목록으로 tasks 서브메뉴 배열을 생성. 입력/출력 계약을 함께 명시
 * 처리 규칙: 빈 status는 전체 메뉴로 취급하고, 나머지는 status query href를 구성한다.
 * @updated 2026-02-27
 */
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

/**
 * @description routeKey에 대응하는 페이지 제목 텍스트를 선택
 * 반환값: 대시보드/작업/설정 중 하나의 타이틀 문자열.
 * @updated 2026-02-27
 */
const resolveTitle = (routeKey) => {
  if (routeKey === "tasks") return layoutMeta.title.tasks;
  if (routeKey === "settings") return layoutMeta.title.settings;
  return layoutMeta.title.dashboard;
};

/**
 * @description 설정 탭 값(profile/system)에 맞는 서브타이틀 문구를 선택
 * 반환값: system 탭이면 시스템 문구, 그 외에는 프로필 문구.
 * @updated 2026-02-27
 */
const resolveSettingsSubtitle = (tab) => {
  if (tab === "system") return layoutMeta.subtitle.settingsSystem;
  return layoutMeta.subtitle.settingsProfile;
};

/**
 * @description 작업 목록 필터 상태를 사람이 읽기 쉬운 한 줄 서브타이틀로 합성
 * 처리 규칙: status/sort/keyword/page가 유효할 때만 파트를 추가하고 `·`로 연결한다.
 * @updated 2026-02-27
 */
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
 * @description 현재 대시보드 경로/쿼리 기준으로 헤더/사이드바 메타를 계산. 입력/출력 계약을 함께 명시
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
