import {
  buildDashboardInitialData,
  DASHBOARD_ERROR_KEY,
  isSsrMode,
  toErrorState,
} from "@/app/dashboard/dataStrategy";

describe("dashboard data strategy", () => {
  it("MODE가 SSR일 때만 SSR 모드로 판단한다", () => {
    expect(isSsrMode("SSR")).toBe(true);
    expect(isSsrMode("ssr")).toBe(true);
    expect(isSsrMode("CSR")).toBe(false);
    expect(isSsrMode("")).toBe(false);
  });

  it("필수 엔드포인트가 없으면 ENDPOINT_MISSING 오류를 반환한다", async () => {
    const result = await buildDashboardInitialData({
      mode: "SSR",
      endPoints: { list: "/api/v1/dashboard" },
      fetcher: vi.fn(),
    });

    expect(result.statList).toEqual([]);
    expect(result.dataList).toEqual([]);
    expect(result.error).toEqual({
      key: DASHBOARD_ERROR_KEY.ENDPOINT_MISSING,
    });
  });

  it("CSR 모드면 서버 초기 조회를 건너뛴다", async () => {
    const fetcher = vi.fn();
    const result = await buildDashboardInitialData({
      mode: "CSR",
      endPoints: {
        stats: "/api/v1/dashboard/stats",
        list: "/api/v1/dashboard",
      },
      fetcher,
    });

    expect(fetcher).not.toHaveBeenCalled();
    expect(result).toEqual({
      statList: [],
      dataList: [],
      error: null,
    });
  });

  it("SSR 모드면 stats/list를 함께 조회해 초기 데이터를 만든다", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({
        result: { byStatus: [{ status: "ready", count: 2, amountSum: 12000 }] },
      })
      .mockResolvedValueOnce({
        result: {
          items: [{ id: 11, title: "테스트 업무", status: "ready", amount: 12000 }],
        },
      });
    const result = await buildDashboardInitialData({
      mode: "SSR",
      endPoints: {
        stats: "/api/v1/dashboard/stats",
        list: "/api/v1/dashboard",
      },
      fetcher,
    });

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenNthCalledWith(1, "/api/v1/dashboard/stats");
    expect(fetcher).toHaveBeenNthCalledWith(2, "/api/v1/dashboard");
    expect(result.error).toBeNull();
    expect(result.statList).toEqual([{ status: "ready", count: 2, amountSum: 12000 }]);
    expect(result.dataList).toEqual([
      { id: 11, title: "테스트 업무", status: "ready", amount: 12000 },
    ]);
  });

  it("SSR 초기 조회 실패 시 INIT_FETCH_FAILED 오류를 반환한다", async () => {
    const fetchError = new Error("fetch failed");
    fetchError.code = "DASHBOARD_500";
    fetchError.requestId = "rid-dashboard-1";
    const result = await buildDashboardInitialData({
      mode: "SSR",
      endPoints: {
        stats: "/api/v1/dashboard/stats",
        list: "/api/v1/dashboard",
      },
      fetcher: vi.fn().mockRejectedValue(fetchError),
    });

    expect(result.statList).toEqual([]);
    expect(result.dataList).toEqual([]);
    expect(result.error).toEqual({
      key: DASHBOARD_ERROR_KEY.INIT_FETCH_FAILED,
      code: "DASHBOARD_500",
      requestId: "rid-dashboard-1",
    });
  });

  it("toErrorState는 err가 없으면 key만 반환한다", () => {
    expect(toErrorState(null, DASHBOARD_ERROR_KEY.ENDPOINT_MISSING)).toEqual({
      key: DASHBOARD_ERROR_KEY.ENDPOINT_MISSING,
    });
  });
});
