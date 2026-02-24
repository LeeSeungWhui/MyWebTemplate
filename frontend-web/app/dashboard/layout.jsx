"use client";
/**
 * 파일명: dashboard/layout.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 대시보드 레이아웃 (Header/Sidebar/Footer 포함)
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/common/layout/Header";
import Sidebar from "@/app/common/layout/Sidebar";
import Footer from "@/app/common/layout/Footer";
import Button from "@/app/lib/component/Button";
import Icon from "@/app/lib/component/Icon";
import { apiJSON } from "@/app/lib/runtime/api";
import { useGlobalUi, useUser } from "@/app/common/store/SharedStore";
import { resolveDashboardLayoutMeta } from "./layoutMeta";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setUser } = useUser();
  const { setLoading, showToast } = useGlobalUi();
  const layoutMeta = useMemo(
    () =>
      resolveDashboardLayoutMeta({
        pathname,
        searchParams,
      }),
    [pathname, searchParams?.toString()]
  );
  const currentYear = new Date().getFullYear();
  const handleGoHome = () => {
    router.push("/");
  };

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
  }, [pathname, searchParams?.toString(), isDesktopViewport]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await apiJSON("/api/v1/auth/logout", { method: "POST" });
      setUser(null);
      showToast("로그아웃에 성공했습니다.", { type: "info" });
      router.push("/login");
    } catch (err) {
      console.error(err);
      showToast("로그아웃에 실패했습니다.", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="sticky top-0 z-40">
        <Header
          title={layoutMeta.title}
          subtitle={layoutMeta.subtitle}
          menuList={layoutMeta.menuList}
          subMenuList={layoutMeta.subMenuList}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
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
        >
          <Button
            size="sm"
            variant="ghost"
            className="px-2 text-gray-600 hover:text-gray-900 sm:px-3"
            onClick={handleGoHome}
          >
            <Icon icon="ri:RiHome6Line" className="text-base sm:hidden" />
            <span className="hidden sm:inline">홈으로</span>
          </Button>
          <Button size="sm" variant="secondary" className="px-2 sm:px-3" onClick={handleLogout}>
            로그아웃
          </Button>
        </Header>
      </div>
      <div className="flex flex-1 min-h-0 items-stretch">
        <Sidebar
          menuList={layoutMeta.menuList}
          subMenuList={layoutMeta.subMenuList}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          logo={
            <span className="inline-flex items-center rounded-md bg-gradient-to-r from-[#1e3a5f] to-[#312e81] px-2 py-1 text-xs font-semibold text-white">
              MyWebTemplate
            </span>
          }
          footerSlot={`© ${currentYear} MyWebTemplate`}
        />
        <main className="flex-1 min-w-0 overflow-y-auto px-4 py-4 lg:px-4">
          {children}
        </main>
      </div>
      <Footer
        logo={
          <span className="font-semibold text-blue-600">MyWebTemplate</span>
        }
        textObj={{ footerText: `© ${currentYear} MyWebTemplate` }}
        linkList={[
          { linkId: "crud", linkNm: "CRUD 데모", href: "/demo/crud" },
          { linkId: "form", linkNm: "복합 폼 데모", href: "/demo/form" },
          { linkId: "admin", linkNm: "관리자 화면 데모", href: "/demo/admin" },
          { linkId: "component", linkNm: "컴포넌트 문서", href: "/component" },
          { linkId: "portfolio", linkNm: "포트폴리오", href: "/demo/portfolio" },
        ]}
      />
    </div>
  );
};

export default DashboardLayout;
