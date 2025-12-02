"use client";
/**
 * 파일명: dashboard/layout.jsx
 * 작성자: Codex
 * 갱신일: 2025-11-27
 * 설명: 대시보드 레이아웃 (Header/Sidebar/Footer 포함)
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/common/layout/Header";
import Sidebar from "@/app/common/layout/Sidebar";
import Footer from "@/app/common/layout/Footer";
import Button from "@/app/lib/component/Button";
import { apiJSON } from "@/app/lib/runtime/api";
import { useGlobalUi, useUser } from "@/app/common/store/SharedStore";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const { setUser } = useUser();
  const { setLoading, showToast } = useGlobalUi();
  const menuList = [
    {
      menuId: "menu1",
      menuNm: "메뉴1",
      href: "/dashboard",
      active: true,
      icon: "ri:RiDashboardLine",
    },
    {
      menuId: "menu2",
      menuNm: "메뉴2",
      href: "#",
      icon: "ri:RiBarChart2Line",
    },
    {
      menuId: "menu3",
      menuNm: "메뉴3",
      href: "#",
      icon: "ri:RiSettings3Line",
    },
  ];
  const subMenuList = [
    {
      menuId: "menu2",
      subMenuId: "sub1",
      subMenuNm: "서브메뉴1",
      href: "#",
    },
    {
      menuId: "menu2",
      subMenuId: "sub2",
      subMenuNm: "서브메뉴2",
      href: "#",
    },
  ];

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
          title="Dashboard"
          subtitle="오늘의 지표를 한눈에"
          menuList={menuList}
          subMenuList={subMenuList}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          text="어서오세요."
        >
          <Button size="sm" variant="secondary" onClick={handleLogout}>
            로그아웃
          </Button>
        </Header>
      </div>
      <div className="flex flex-1 min-h-0 items-stretch">
        <Sidebar
          menuList={menuList}
          subMenuList={subMenuList}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          logo={<span className="font-semibold text-blue-600">MyWeb</span>}
          footerSlot="ⓒ 2025 MyWebTemplate"
        />
        <main className="flex-1 min-w-0 overflow-y-auto px-4 py-4 lg:px-4">
          {children}
        </main>
      </div>
      <Footer
        logo={<span className="font-semibold text-blue-600">MyWeb</span>}
        textObj={{ footerText: "© 2025 MyWebTemplate" }}
        linkList={[
          { linkId: "help", linkNm: "도움말", href: "#" },
          { linkId: "privacy", linkNm: "개인정보", href: "#" },
        ]}
      />
    </div>
  );
};

export default DashboardLayout;
