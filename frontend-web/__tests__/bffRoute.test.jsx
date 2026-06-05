/**
 * 파일명: bffRoute.test.jsx
 * 작성자: LSH
 * 갱신일: 2026-06-05
 * 설명: /api/bff 프록시 라우트의 쿠키 기반 refresh/logout 전달 계약 테스트
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/bff/[...path]/route.js";

vi.mock("@/app/common/config/getBackendHost.server", () => ({
  getBackendHost: vi.fn(async () => "http://backend.local"),
}));

function buildBffRequest(pathname, { cookie = "access_token=old-at; refresh_token=rt" } = {}) {
  const url = `http://localhost:3000/api/bff${pathname}`;
  return {
    method: "POST",
    url,
    nextUrl: new URL(url),
    headers: new Headers({
      cookie,
      origin: "http://localhost:3000",
      referer: "http://localhost:3000/dashboard",
      "accept-language": "ko-KR",
    }),
    cookies: {
      get(name) {
        const cookieMap = Object.fromEntries(
          cookie.split(";").map((part) => {
            const [rawName, ...rawValueParts] = part.trim().split("=");
            return [rawName, rawValueParts.join("=")];
          }),
        );
        const value = cookieMap[name];
        return value ? { name, value } : undefined;
      },
    },
  };
}

function buildRouteContext(pathname) {
  const path = pathname.replace(/^\//, "").split("/");
  return { params: Promise.resolve({ path }) };
}

describe("/api/bff route", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("401 refresh 재시도 호출에 refresh_token cookie를 백엔드로 전달한다", async () => {
    const refreshHeaders = new Headers();
    refreshHeaders.set(
      "set-cookie",
      "access_token=new-at; Path=/; HttpOnly; SameSite=Lax",
    );
    fetch
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: false }), { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: true }), {
          status: 200,
          headers: refreshHeaders,
        }),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: true }), { status: 200 }));

    const req = buildBffRequest("/api/v1/sample/private");
    const res = await POST(req, buildRouteContext("/api/v1/sample/private"));

    expect(res.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(3);
    const [refreshUrl, refreshInitObj] = fetch.mock.calls[1];
    expect(String(refreshUrl)).toBe("http://backend.local/api/v1/auth/refresh");
    expect(refreshInitObj.headers.get("cookie")).toContain("refresh_token=rt");

    const [, retryInitObj] = fetch.mock.calls[2];
    expect(retryInitObj.headers.get("authorization")).toBe("Bearer new-at");
  });

  it("logout 프록시 호출에도 refresh_token cookie를 백엔드로 전달한다", async () => {
    fetch.mockResolvedValueOnce(new Response(null, { status: 204 }));

    const req = buildBffRequest("/api/v1/auth/logout");
    const res = await POST(req, buildRouteContext("/api/v1/auth/logout"));

    expect(res.status).toBe(204);
    expect(fetch).toHaveBeenCalledTimes(1);
    const [logoutUrl, logoutInitObj] = fetch.mock.calls[0];
    expect(String(logoutUrl)).toBe("http://backend.local/api/v1/auth/logout");
    expect(logoutInitObj.headers.get("cookie")).toContain("refresh_token=rt");
  });
});
