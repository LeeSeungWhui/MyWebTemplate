"use client";
/**
 * 파일명: common/layout/PublicGnb.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 공개 페이지 공통 GNB(샘플 드롭다운/모바일 드로어 포함)
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/app/lib/component/Icon";

const DEMO_MENU_LIST = [
  { href: "/sample", label: "샘플 허브" },
  { href: "/sample/dashboard", label: "샘플 대시보드" },
  { href: "/sample/crud", label: "CRUD 관리" },
  { href: "/sample/form", label: "복합 폼" },
  { href: "/sample/admin", label: "관리자 화면" },
];

const PUBLIC_MENU_LIST = [
  { href: "/component", label: "컴포넌트" },
  { href: "/sample/portfolio", label: "포트폴리오" },
];

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

const isActiveMenu = (pathname, href) => {
  if (href === "/sample") {
    return pathname === "/sample";
  }
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
};

const getTopMenuClassName = (active) =>
  [
    "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600",
  ].join(" ");

const getDemoButtonClassName = (active) =>
  [
    "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600",
  ].join(" ");

const getDropdownItemClassName = (active) =>
  [
    "block rounded-md px-3 py-2 text-sm transition-colors",
    active ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600",
  ].join(" ");

/**
 * @description 공개 페이지에서 사용하는 상단 GNB를 렌더링한다.
 */
const PublicGnb = () => {
  const pathname = usePathname() || "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const demoMenuRef = useRef(null);
  const demoMenuPinnedRef = useRef(false);

  const isDemoActive = useMemo(() => isDemoPath(pathname), [pathname]);

  const closeDemoMenu = useCallback(() => {
    demoMenuPinnedRef.current = false;
    setDemoMenuOpen(false);
  }, []);

  const handleToggleDemoMenu = () => {
    if (demoMenuOpen && demoMenuPinnedRef.current) {
      closeDemoMenu();
      return;
    }
    demoMenuPinnedRef.current = true;
    setDemoMenuOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (!demoMenuRef.current || demoMenuRef.current.contains(target)) {
        return;
      }
      closeDemoMenu();
    };

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
            aria-label="모바일 메뉴 열기"
            onClick={() => setMobileOpen((prevState) => !prevState)}
          >
            <Icon
              icon={mobileOpen ? "ri:RiCloseLine" : "ri:RiMenuLine"}
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
            onMouseEnter={() => setDemoMenuOpen(true)}
            onMouseLeave={() => {
              if (!demoMenuPinnedRef.current) {
                setDemoMenuOpen(false);
              }
            }}
          >
            <button
              type="button"
              className={getDemoButtonClassName(isDemoActive)}
              aria-haspopup="menu"
              aria-expanded={demoMenuOpen}
              onClick={handleToggleDemoMenu}
            >
              샘플
              <Icon icon="ri:RiArrowDownSLine" />
            </button>
            <div
              className={`absolute right-0 top-full w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg transition ${
                demoMenuOpen
                  ? "visible opacity-100"
                  : "invisible pointer-events-none opacity-0"
              }`}
              role="menu"
              aria-label="샘플 메뉴"
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

      {mobileOpen ? (
        <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">
          <div className="space-y-1">
            <p className="px-2 py-1 text-xs font-semibold tracking-wide text-gray-500">
              샘플
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
                onClick={() => setMobileOpen(false)}
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
                onClick={() => setMobileOpen(false)}
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
