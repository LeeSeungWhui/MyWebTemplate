/**
 * 파일명: demo/layoutMeta.js
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 공개 샘플 레이아웃(헤더/사이드바) 메타 계산 유틸
 */

const MENU_TEMPLATE_LIST = [
  {
    menuId: "demo",
    menuNm: "샘플 허브",
    href: "/sample",
    icon: "ri:RiApps2Line",
  },
  {
    menuId: "dashboard",
    menuNm: "샘플 대시보드",
    href: "/sample/dashboard",
    icon: "ri:RiBarChart2Line",
  },
  {
    menuId: "crud",
    menuNm: "CRUD 관리",
    href: "/sample/crud",
    icon: "ri:RiTableLine",
  },
  {
    menuId: "form",
    menuNm: "복합 폼",
    href: "/sample/form",
    icon: "ri:RiFileEditLine",
  },
  {
    menuId: "admin",
    menuNm: "관리자 화면",
    href: "/sample/admin",
    icon: "ri:RiShieldUserLine",
  },
];

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
  if (routeKey === "demo") return "샘플 허브";
  if (routeKey === "dashboard") return "샘플 대시보드";
  if (routeKey === "form") return "복합 폼 샘플";
  if (routeKey === "admin") return "관리자 화면 샘플";
  return "CRUD 관리 샘플";
};

const resolveSubtitle = (routeKey) => {
  if (routeKey === "demo") return "공개 샘플 > 허브";
  if (routeKey === "dashboard") return "공개 샘플 > 샘플 대시보드";
  if (routeKey === "form") return "공개 샘플 > 복합 폼";
  if (routeKey === "admin") return "공개 샘플 > 관리자 화면";
  return "공개 샘플 > CRUD 관리";
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
    text: "샘플 화면을 체험할 수 있어요.",
    menuList,
  };
};
