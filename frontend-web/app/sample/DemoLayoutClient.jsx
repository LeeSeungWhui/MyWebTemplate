"use client";
/**
 * 파일명: sample/DemoLayoutClient.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 공개 샘플 공통 레이아웃 클라이언트 컴포넌트
 */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/app/common/layout/Header";
import Sidebar from "@/app/common/layout/Sidebar";
import Footer from "@/app/common/layout/Footer";
import Icon from "@/app/lib/component/Icon";
import { resolveDemoLayoutMeta } from "./layoutMeta";

const isBypassLayoutPath = (pathname) => {
  const pathText = String(pathname || "");
  if (!pathText) return false;
  if (pathText.startsWith("/sample/portfolio")) return true;
  return false;
};

/**
 * @description 공개 샘플 페이지 공통 레이아웃을 렌더링한다.
 * @param {{ children: React.ReactNode }} props
 */
const DemoLayoutClient = (props) => {
  const { children } = props;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const pathname = usePathname();
  const shouldBypassLayout = useMemo(
    () => isBypassLayoutPath(pathname),
    [pathname],
  );
  const layoutMeta = useMemo(
    () => resolveDemoLayoutMeta(pathname),
    [pathname],
  );
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const syncViewport = () => {
      const isDesktop = mediaQuery.matches;
      setIsDesktopViewport(isDesktop);
      setSidebarOpen(isDesktop);
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    if (!isDesktopViewport) {
      setSidebarOpen(false);
    }
  }, [pathname, isDesktopViewport]);

  if (shouldBypassLayout) {
    return children;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="sticky top-0 z-40">
        <Header
          title={layoutMeta.title}
          subtitle={layoutMeta.subtitle}
          menuList={layoutMeta.menuList}
          onToggleSidebar={() => setSidebarOpen((prevState) => !prevState)}
          text={layoutMeta.text}
          logo={(
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-blue-700 transition hover:bg-blue-100"
            >
              <Icon icon="ri:RiCodeBoxLine" className="text-blue-600" />
              <span className="text-sm font-semibold">MyWebTemplate</span>
            </Link>
          )}
        />
      </div>

      <div className="flex min-h-0 flex-1 items-stretch">
        <Sidebar
          menuList={layoutMeta.menuList}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          logo={
            <span className="inline-flex items-center rounded-md bg-gradient-to-r from-[#1e3a5f] to-[#312e81] px-2 py-1 text-xs font-semibold text-white">
              MyWebTemplate
            </span>
          }
          footerSlot={`© ${currentYear} MyWebTemplate`}
        />

        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-4 lg:px-4">
          {children}
        </main>
      </div>

      <Footer
        logo={<span className="font-semibold text-blue-600">MyWebTemplate</span>}
        textObj={{ footerText: `© ${currentYear} MyWebTemplate` }}
        linkList={[
          { linkId: "demo", linkNm: "샘플 허브", href: "/sample" },
          { linkId: "component", linkNm: "컴포넌트", href: "/component" },
          { linkId: "portfolio", linkNm: "포트폴리오", href: "/sample/portfolio" },
        ]}
      />
    </div>
  );
};

export default DemoLayoutClient;
