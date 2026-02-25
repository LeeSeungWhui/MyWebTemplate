/**
 * 파일명: sample/layoutMeta.js
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 공개 샘플 레이아웃(헤더/사이드바) 메타 계산 유틸
 */

import LANG_KO from "./lang.ko";

const { layoutMeta } = LANG_KO;
const MENU_TEMPLATE_LIST = layoutMeta.menuList.map((item) => ({ ...item }));

const resolveRouteKey = (pathname) => {
  const pathText = String(pathname || "");
  if (pathText === "/sample") return "demo";
  if (pathText.startsWith("/sample/dashboard")) return "dashboard";
  if (pathText.startsWith("/sample/crud")) return "crud";
  if (pathText.startsWith("/sample/form")) return "form";
  if (pathText.startsWith("/sample/admin")) return "admin";
  return "demo";
};

const resolveTitle = (routeKey) => {
  if (routeKey === "demo") return layoutMeta.title.demo;
  if (routeKey === "dashboard") return layoutMeta.title.dashboard;
  if (routeKey === "form") return layoutMeta.title.form;
  if (routeKey === "admin") return layoutMeta.title.admin;
  return layoutMeta.title.default;
};

const resolveSubtitle = (routeKey) => {
  if (routeKey === "demo") return layoutMeta.subtitle.demo;
  if (routeKey === "dashboard") return layoutMeta.subtitle.dashboard;
  if (routeKey === "form") return layoutMeta.subtitle.form;
  if (routeKey === "admin") return layoutMeta.subtitle.admin;
  return layoutMeta.subtitle.default;
};

/**
 * @description 현재 공개 샘플 경로 기준으로 헤더/사이드바 메타를 계산한다.
 * @param {string} pathname 현재 pathname
 * @returns {{ title:string, subtitle:string, text:string, menuList:Array }}
 */
export const resolveDemoLayoutMeta = (pathname) => {
  const routeKey = resolveRouteKey(pathname);
  const menuList = MENU_TEMPLATE_LIST.map((item) => ({
    ...item,
    active: item.menuId === routeKey,
  }));

  return {
    title: resolveTitle(routeKey),
    subtitle: resolveSubtitle(routeKey),
    text: layoutMeta.helperText,
    menuList,
  };
};
