"use client";
/**
 * 파일명: common/layout/PublicGnb.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 공개 페이지 공통 GNB(샘플 드롭다운/모바일 드로어 포함)
 */

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/app/lib/component/Icon";
import EasyObj from "@/app/lib/dataset/EasyObj";
import { COMMON_COMPONENT_LANG_KO } from "@/app/common/i18n/lang.ko";

const DEMO_MENU_LIST = COMMON_COMPONENT_LANG_KO.publicLayout.demoMenuList;
const PUBLIC_MENU_LIST = COMMON_COMPONENT_LANG_KO.publicLayout.publicMenuList;

/**
 * @description 현재 경로가 데모 드롭다운 그룹에 해당하는지 판별
 * 반환값: `/sample` 하위(단, `/sample/portfolio` 제외)면 true.
 * @updated 2026-02-27
 */
const isDemoPath = (pathname) => {
  const pathText = String(pathname || "");
  if (pathText === "/sample") {
    return true;
  }
  if (!pathText.startsWith("/sample/")) {
    return false;
  }
  if (pathText.startsWith("/sample/portfolio")) {
    return false;
  }
  return true;
};

/**
 * @description  메뉴 href가 현재 pathname과 활성 매칭되는지 계산한다. 입력/출력 계약을 함께 명시
 * 처리 규칙: 루트(`/`)와 샘플 루트(`/sample`)는 정확 일치, 그 외는 하위 경로 prefix까지 허용한다.
 * @updated 2026-02-27
 */
const isActiveMenu = (pathname, href) => {
  if (href === "/sample") {
    return pathname === "/sample";
  }
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
};

/**
 * @description 상단 메뉴 항목의 active 상태에 맞는 클래스를 조합
 * 반환값: hover/active 시각 상태가 포함된 className 문자열.
 * @updated 2026-02-27
 */
const getTopMenuClassName = (active) =>
  [
    "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600",
  ].join(" ");

/**
 * @description 데모 드롭다운 버튼의 active 상태 클래스를 조합
 * 반환값: 드롭다운 트리거 버튼용 className 문자열.
 * @updated 2026-02-27
 */
const getDemoButtonClassName = (active) =>
  [
    "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600",
  ].join(" ");

/**
 * @description 드롭다운 항목의 활성 상태에 맞는 텍스트/배경 클래스를 조합
 * 반환값: 활성/비활성 스타일이 반영된 className 문자열.
 * @updated 2026-02-27
 */
const getDropdownItemClassName = (active) =>
  [
    "block rounded-md px-3 py-2 text-sm transition-colors",
    active ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600",
  ].join(" ");

/**
 * @description  공개 페이지에서 사용하는 상단 GNB를 렌더링한다. 입력/출력 계약을 함께 명시
 * 처리 규칙: 데스크톱은 hover+pin 드롭다운, 모바일은 토글 드로어 메뉴 구조를 사용한다.
 */
const PublicGnb = () => {
  const pathname = usePathname() || "/";
  const ui = EasyObj({
    mobileOpen: false,
    demoMenuOpen: false,
  });
  const demoMenuRef = useRef(null);
  const demoMenuPinnedRef = useRef(false);

  const isDemoActive = isDemoPath(pathname);

  const closeDemoMenu = useCallback(() => {
    demoMenuPinnedRef.current = false;
    ui.demoMenuOpen = false;
  }, [ui]);

  /**
   * @description 데모 메뉴 버튼 클릭 시 pinned/open 상태를 토글
   * 처리 규칙: 이미 pin된 상태에서 재클릭하면 닫고, 그 외에는 pin=true/open=true로 유지한다.
   * @updated 2026-02-27
   */
  const handleToggleDemoMenu = () => {
    if (ui.demoMenuOpen && demoMenuPinnedRef.current) {
      closeDemoMenu();
      return;
    }
    demoMenuPinnedRef.current = true;
    ui.demoMenuOpen = true;
  };

  useEffect(() => {

    /**
     * @description 데모 메뉴 영역 바깥 포인터 입력에서 드롭다운을 닫는다.
     * 처리 규칙: demoMenuRef 외부 pointerdown 이벤트만 close 대상으로 본다.
     * @updated 2026-02-27
     */
    const handleClickOutside = (event) => {
      const target = event.target;
      if (!demoMenuRef.current || demoMenuRef.current.contains(target)) {
        return;
      }
      closeDemoMenu();
    };

    /**
     * @description Escape 키 입력으로 데모 드롭다운을 닫는다.
     * 처리 규칙: key 값이 Escape일 때 closeDemoMenu를 호출한다.
     * @updated 2026-02-27
     */
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeDemoMenu();
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closeDemoMenu]);

  useEffect(() => {
    closeDemoMenu();
  }, [pathname, closeDemoMenu]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 text-gray-700 md:hidden"
            aria-label={COMMON_COMPONENT_LANG_KO.publicLayout.mobileMenuOpenAriaLabel}
            onClick={() => {
              ui.mobileOpen = !ui.mobileOpen;
            }}
          >
            <Icon
              icon={ui.mobileOpen ? "ri:RiCloseLine" : "ri:RiMenuLine"}
              className="text-lg"
            />
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-base font-semibold text-gray-900"
          >
            <Icon icon="ri:RiCodeBoxLine" className="text-blue-600" />
            <span>MyWebTemplate</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-700 md:flex">
          <div
            ref={demoMenuRef}
            className="relative"
            onMouseEnter={() => {
              ui.demoMenuOpen = true;
            }}
            onMouseLeave={() => {
              if (!demoMenuPinnedRef.current) {
                ui.demoMenuOpen = false;
              }
            }}
          >
            <button
              type="button"
              className={getDemoButtonClassName(isDemoActive)}
              aria-haspopup="menu"
              aria-expanded={ui.demoMenuOpen}
              onClick={handleToggleDemoMenu}
            >
              {COMMON_COMPONENT_LANG_KO.publicLayout.demoMenuLabel}
              <Icon icon="ri:RiArrowDownSLine" />
            </button>
            <div
              className={`absolute right-0 top-full w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg transition ${
                ui.demoMenuOpen
                  ? "visible opacity-100"
                  : "invisible pointer-events-none opacity-0"
              }`}
              role="menu"
              aria-label={COMMON_COMPONENT_LANG_KO.publicLayout.demoMenuAriaLabel}
            >
              {DEMO_MENU_LIST.map((menuItem) => {
                const menuActive = isActiveMenu(pathname, menuItem.href);
                return (
                  <Link
                    key={menuItem.href}
                    href={menuItem.href}
                    className={getDropdownItemClassName(menuActive)}
                    onClick={closeDemoMenu}
                    aria-current={menuActive ? "page" : undefined}
                  >
                    {menuItem.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {PUBLIC_MENU_LIST.map((menuItem) => (
            <Link
              key={menuItem.href}
              href={menuItem.href}
              className={getTopMenuClassName(isActiveMenu(pathname, menuItem.href))}
              aria-current={
                isActiveMenu(pathname, menuItem.href) ? "page" : undefined
              }
            >
              {menuItem.label}
            </Link>
          ))}
        </nav>

      </div>

      {ui.mobileOpen ? (
        <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">
          <div className="space-y-1">
            <p className="px-2 py-1 text-xs font-semibold tracking-wide text-gray-500">
              {COMMON_COMPONENT_LANG_KO.publicLayout.demoMenuLabel}
            </p>
            {DEMO_MENU_LIST.map((menuItem) => (
              <Link
                key={menuItem.href}
                href={menuItem.href}
                className={`block rounded-md px-2 py-2 text-sm ${
                  isActiveMenu(pathname, menuItem.href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
                }`}
                onClick={() => {
                  ui.mobileOpen = false;
                }}
              >
                {menuItem.label}
              </Link>
            ))}
          </div>

          <div className="mt-3 space-y-1">
            {PUBLIC_MENU_LIST.map((menuItem) => (
              <Link
                key={menuItem.href}
                href={menuItem.href}
                className={`block rounded-md px-2 py-2 text-sm ${
                  isActiveMenu(pathname, menuItem.href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
                }`}
                onClick={() => {
                  ui.mobileOpen = false;
                }}
              >
                {menuItem.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default PublicGnb;
