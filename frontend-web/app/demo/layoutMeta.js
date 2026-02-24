/**
 * 파일명: demo/layoutMeta.js
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 공개 데모 레이아웃(헤더/사이드바) 메타 계산 유틸
 */

const MENU_TEMPLATE_LIST = [
  {
    menuId: "demo",
    menuNm: "데모 허브",
    href: "/demo",
    icon: "ri:RiApps2Line",
  },
  {
    menuId: "dashboard",
    menuNm: "데모 대시보드",
    href: "/demo/dashboard",
    icon: "ri:RiBarChart2Line",
  },
  {
    menuId: "crud",
    menuNm: "CRUD 관리",
    href: "/demo/crud",
    icon: "ri:RiTableLine",
  },
  {
    menuId: "form",
    menuNm: "복합 폼",
    href: "/demo/form",
    icon: "ri:RiFileEditLine",
  },
  {
    menuId: "admin",
    menuNm: "관리자 화면",
    href: "/demo/admin",
    icon: "ri:RiShieldUserLine",
  },
];

const resolveRouteKey = (pathname) => {
  const pathText = String(pathname || "");
  if (pathText === "/demo") return "demo";
  if (pathText.startsWith("/demo/dashboard")) return "dashboard";
  if (pathText.startsWith("/demo/crud")) return "crud";
  if (pathText.startsWith("/demo/form")) return "form";
  if (pathText.startsWith("/demo/admin")) return "admin";
  return "demo";
};

const resolveTitle = (routeKey) => {
  if (routeKey === "demo") return "데모 허브";
  if (routeKey === "dashboard") return "데모 대시보드";
  if (routeKey === "form") return "복합 폼 데모";
  if (routeKey === "admin") return "관리자 화면 데모";
  return "CRUD 관리 데모";
};

const resolveSubtitle = (routeKey) => {
  if (routeKey === "demo") return "공개 데모 > 허브";
  if (routeKey === "dashboard") return "공개 데모 > 데모 대시보드";
  if (routeKey === "form") return "공개 데모 > 복합 폼";
  if (routeKey === "admin") return "공개 데모 > 관리자 화면";
  return "공개 데모 > CRUD 관리";
};

/**
 * @description 현재 공개 데모 경로 기준으로 헤더/사이드바 메타를 계산한다.
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
    text: "로그인 없이 체험할 수 있어요.",
    menuList,
  };
};
