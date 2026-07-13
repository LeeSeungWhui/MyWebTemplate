/**
 * 파일명: bffRoute.test.jsx
 * 작성자: LSH
 * 갱신일: 2026-07-11
 * 설명: /api/bff 프록시 라우트의 쿠키 기반 refresh/logout 전달 계약 테스트
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/bff/[...path]/route.js";
import { getBackendHost } from "@/app/common/config/getBackendHost.server";

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
    vi.mocked(getBackendHost).mockResolvedValue("http://backend.local");
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

  it("공개 비밀번호 재설정 요청과 완료의 401에서는 refresh를 시도하지 않는다", async () => {
    const resetPathList = [
      "/api/v1/auth/password-reset/request",
      "/api/v1/auth/password-reset/complete",
      "/api/v1/auth/passwordResetRequest",
      "/api/v1/auth/passwordResetComplete",
    ];

    for (const resetPath of resetPathList) {
      fetch.mockReset();
      fetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ status: false }), { status: 401 }),
      );

      const req = buildBffRequest(resetPath);
      const res = await POST(req, buildRouteContext(resetPath));

      expect(res.status).toBe(401);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(String(fetch.mock.calls[0][0])).toBe(`http://backend.local${resetPath}`);
    }
  });

  it("비밀번호 재설정 완료의 access/refresh 쿠키 삭제를 그대로 전달한다", async () => {
    const resetHeaders = new Headers({
      "content-type": "application/json",
    });
    resetHeaders.append(
      "set-cookie",
      "access_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax",
    );
    resetHeaders.append(
      "set-cookie",
      "refresh_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax",
    );
    fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: true, result: { completed: true } }), {
        status: 200,
        headers: resetHeaders,
      }),
    );

    const resetPath = "/api/v1/auth/passwordResetComplete";
    const req = buildBffRequest(resetPath);
    const res = await POST(req, buildRouteContext(resetPath));
    const body = await res.json();
    const setCookieList = res.headers.getSetCookie?.() || [res.headers.get("set-cookie")];
    const setCookieText = setCookieList.join("\n");

    expect(res.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(setCookieText).toContain("access_token=; Max-Age=0");
    expect(setCookieText).toContain("refresh_token=; Max-Age=0");
    expect(body).toEqual({ status: true, result: { completed: true } });
    expect(JSON.stringify(body)).not.toMatch(/accessToken|refreshToken|access_token|refresh_token/);
  });

  it("primary fetch 거부를 requestId 포함 502 JSON으로 변환한다", async () => {
    fetch.mockRejectedValueOnce(new Error("private transport detail"));

    const req = buildBffRequest("/api/v1/sample/private");
    const res = await POST(req, buildRouteContext("/api/v1/sample/private"));
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(res.headers.get("x-request-id")).toBeTruthy();
    expect(body).toMatchObject({
      status: false,
      code: "BFF_502_BACKEND_UNAVAILABLE",
      message: "backend service unavailable",
    });
    expect(body.requestId).toBe(res.headers.get("x-request-id"));
    expect(JSON.stringify(body)).not.toContain("private transport detail");
  });

  it("refresh fetch 거부도 안정적인 502로 변환한다", async () => {
    fetch
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: false }), { status: 401 }))
      .mockRejectedValueOnce(new Error("refresh transport detail"));

    const req = buildBffRequest("/api/v1/sample/private");
    const res = await POST(req, buildRouteContext("/api/v1/sample/private"));
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body.code).toBe("BFF_502_BACKEND_UNAVAILABLE");
    expect(JSON.stringify(body)).not.toContain("refresh transport detail");
  });

  it("refresh 성공 후 retry fetch 거부 시 회전 쿠키를 502에도 보존한다", async () => {
    const refreshHeaders = new Headers();
    refreshHeaders.append(
      "set-cookie",
      "access_token=rotated-at; Path=/; HttpOnly; SameSite=Lax",
    );
    fetch
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: false }), { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: true }), {
          status: 200,
          headers: refreshHeaders,
        }),
      )
      .mockRejectedValueOnce(new Error("retry transport detail"));

    const req = buildBffRequest("/api/v1/sample/private");
    const res = await POST(req, buildRouteContext("/api/v1/sample/private"));

    expect(res.status).toBe(502);
    expect(res.headers.get("set-cookie")).toContain("access_token=rotated-at");
  });
});
