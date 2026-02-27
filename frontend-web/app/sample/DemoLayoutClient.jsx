"use client";
/**
 * 파일명: sample/DemoLayoutClient.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 공개 샘플 공통 레이아웃 클라이언트 컴포넌트
 */

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "@/app/common/layout/Header";
import Sidebar from "@/app/common/layout/Sidebar";
import Footer from "@/app/common/layout/Footer";
import Icon from "@/app/lib/component/Icon";
import { resolveDemoLayoutMeta } from "./layoutMeta";
import EasyObj from "@/app/lib/dataset/EasyObj";
import LANG_KO from "./lang.ko";

/**
 * @description 현재 경로가 샘플 공통 레이아웃을 우회해야 하는 경로인지 판별
 * 반환값: `/sample/portfolio` 경로면 true, 그 외는 false.
 * @updated 2026-02-27
 */
const isBypassLayoutPath = (pathname) => {
  const pathText = String(pathname || "");
  if (!pathText) return false;
  if (pathText.startsWith("/sample/portfolio")) return true;
  return false;
};

/**
 * @description 공개 샘플 페이지 공통 레이아웃을 렌더링. 입력/출력 계약을 함께 명시
 * 처리 규칙: 포트폴리오 경로는 레이아웃을 우회하고, 그 외에는 Header/Sidebar/Footer 셸을 적용한다.
 * @param {{ children: React.ReactNode }} props
 */
const DemoLayoutClient = ({ children }) => {

  const ui = EasyObj({
    sidebarOpen: false,
    isDesktopViewport: false,
  });
  const pathname = usePathname();
  const shouldBypassLayout = isBypassLayoutPath(pathname);
  const layoutMeta = resolveDemoLayoutMeta(pathname);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    /**
     * @description 뷰포트 크기에 맞춰 데스크톱 여부와 사이드바 열림 상태를 동기화
     * 처리 규칙: 1024px 이상이면 sidebarOpen=true, 미만이면 false로 맞춘다.
     * @updated 2026-02-27
     */
    const syncViewport = () => {
      ui.isDesktopViewport = mediaQuery.matches;
      ui.sidebarOpen = mediaQuery.matches;
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, [ui]);

  useEffect(() => {
    if (!ui.isDesktopViewport) {
      ui.sidebarOpen = false;
    }
  }, [pathname, ui.isDesktopViewport]);

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
          onToggleSidebar={() => {
            ui.sidebarOpen = !ui.sidebarOpen;
          }}
          text={layoutMeta.text}
          logo={(
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-blue-700 transition hover:bg-blue-100"
            >
              <Icon icon="ri:RiCodeBoxLine" className="text-blue-600" />
              <span className="text-sm font-semibold">{LANG_KO.layoutMeta.brandName}</span>
            </Link>
          )}
        />
      </div>

      <div className="flex min-h-0 flex-1 items-stretch">
        <Sidebar
          menuList={layoutMeta.menuList}
          isOpen={ui.sidebarOpen}
          onClose={() => {
            ui.sidebarOpen = false;
          }}
          logo={
            <span className="inline-flex items-center rounded-md bg-gradient-to-r from-[#1e3a5f] to-[#312e81] px-2 py-1 text-xs font-semibold text-white">
              {LANG_KO.layoutMeta.brandName}
            </span>
          }
          footerSlot={`© ${currentYear} ${LANG_KO.layoutMeta.brandName}`}
        />

        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-4 lg:px-4">
          {children}
        </main>
      </div>

      <Footer
        logo={<span className="font-semibold text-blue-600">{LANG_KO.layoutMeta.brandName}</span>}
        textObj={{ footerText: `© ${currentYear} ${LANG_KO.layoutMeta.brandName}` }}
        linkList={LANG_KO.layoutMeta.footerLinkList}
      />
    </div>
  );
};

export default DemoLayoutClient;
