import { resolveDashboardLayoutMeta } from "@/app/dashboard/layoutMeta";

describe("dashboard layout meta", () => {
  test("업무관리 경로에서 메뉴 활성화와 breadcrumb를 계산한다", () => {
    const layoutMeta = resolveDashboardLayoutMeta({
      pathname: "/dashboard/tasks",
      searchParams: new URLSearchParams({
        q: "로그",
        status: "running",
        sort: "amt_desc",
        page: "2",
      }),
    });

    expect(layoutMeta.title).toBe("업무 관리");
    expect(layoutMeta.subtitle).toContain("대시보드 > 업무 관리");
    expect(layoutMeta.subtitle).toContain("상태: 진행중");
    expect(layoutMeta.subtitle).toContain("정렬: 금액 높은순");
    expect(layoutMeta.subtitle).toContain("검색: 로그");
    expect(layoutMeta.subtitle).toContain("페이지: 2");
    expect(layoutMeta.menuList.find((item) => item.menuId === "tasks")?.active).toBe(true);
    expect(
      layoutMeta.subMenuList.find((item) => item.subMenuId === "running")?.active
    ).toBe(true);
  });

  test("대시보드 경로면 요약 breadcrumb를 반환한다", () => {
    const layoutMeta = resolveDashboardLayoutMeta({
      pathname: "/dashboard",
      searchParams: new URLSearchParams(),
    });

    expect(layoutMeta.title).toBe("대시보드");
    expect(layoutMeta.subtitle).toBe("대시보드 > 요약");
    expect(layoutMeta.menuList.find((item) => item.menuId === "dashboard")?.active).toBe(
      true
    );
    expect(layoutMeta.subMenuList).toEqual([]);
  });

  test("설정 경로면 탭 기준 breadcrumb를 반환한다", () => {
    const layoutMeta = resolveDashboardLayoutMeta({
      pathname: "/dashboard/settings",
      searchParams: new URLSearchParams({ tab: "system" }),
    });

    expect(layoutMeta.title).toBe("설정");
    expect(layoutMeta.subtitle).toBe("대시보드 > 설정 > 시스템 설정");
    expect(layoutMeta.menuList.find((item) => item.menuId === "settings")?.active).toBe(
      true
    );
  });
});
