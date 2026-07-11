/**
 * 파일명: sessionBootstrap.test.jsx
 * 작성자: LSH
 * 갱신일: 2026-07-11
 * 설명: /api/session/bootstrap 라우트(리프레시 기반 자동 로그인/리다이렉트) 테스트
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { GET } from "@/app/api/session/bootstrap/route.js";
import { getBackendHost } from "@/app/common/config/getBackendHost.server";

vi.mock("@/app/common/config/getBackendHost.server", () => ({
  getBackendHost: vi.fn(async () => "http://backend.local"),
}));

function getSetCookies(res) {
  if (typeof res?.headers?.getSetCookie === "function")
    return res.headers.getSetCookie();
  const singleSetCookie = res?.headers?.get?.("set-cookie");
  return singleSetCookie ? [singleSetCookie] : [];
}

function findCookieValue(setCookies, name) {
  for (const line of setCookies) {
    if (typeof line !== "string") continue;
    const prefix = `${name}=`;
    if (!line.startsWith(prefix)) continue;
    return line.slice(prefix.length).split(";")[0];
  }
  return null;
}

function decodeBase64UrlJson(encoded) {
  const base64 = String(encoded || "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const padded = base64 + "===".slice((base64.length + 3) % 4);
  const decodedText = Buffer.from(padded, "base64").toString("utf8");
  return JSON.parse(decodedText);
}

describe("/api/session/bootstrap", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(getBackendHost).mockResolvedValue("http://backend.local");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("refresh_token이 없으면 /login으로 보낸다(원격 호출 없음)", async () => {
    const req = new Request("http://localhost:3000/api/session/bootstrap");
    const res = await GET(req);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("refresh 성공 시 nx(없으면 /dashboard)로 리다이렉트하고 nx를 정리한다", async () => {
    const nx = encodeURIComponent("/settings/profile?foo=bar");
    const req = new Request("http://localhost:3000/api/session/bootstrap", {
      headers: { cookie: `refresh_token=rt; nx=${nx}` },
    });

    const refreshHeaders = new Headers();
    refreshHeaders.append(
      "set-cookie",
      "access_token=at; Path=/; HttpOnly; SameSite=Lax",
    );
    refreshHeaders.append(
      "set-cookie",
      "refresh_token=rt2; Path=/; HttpOnly; SameSite=Lax",
    );
    refreshHeaders.set("content-type", "application/json");

    fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: true }), { status: 200, headers: refreshHeaders }),
    );

    const res = await GET(req);
    expect(res.headers.get("location")).toBe(
      "http://localhost:3000/settings/profile?foo=bar",
    );

    const setCookies = getSetCookies(res).join("\n");
    expect(setCookies).toContain("access_token=at");
    expect(setCookies).toContain("refresh_token=rt2");
    expect(setCookies).toMatch(/(^|\n)nx=;/);
    expect(setCookies.toLowerCase()).toContain("max-age=0");
  });

  it("refresh 성공 시 악성 nx는 /dashboard로 sanitize한다", async () => {
    const maliciousNxList = [
      "/\\evil.example",
      "/%5Cevil.example",
      "/%250A%250D//evil.example",
      "//evil.example/a",
      "https://evil.example/a",
    ];

    for (const maliciousNx of maliciousNxList) {
      const req = new Request("http://localhost:3000/api/session/bootstrap", {
        headers: {
          cookie: `refresh_token=rt; nx=${encodeURIComponent(maliciousNx)}`,
        },
      });
      const refreshHeaders = new Headers();
      refreshHeaders.append(
        "set-cookie",
        "access_token=at; Path=/; HttpOnly; SameSite=Lax",
      );
      refreshHeaders.set("content-type", "application/json");

      fetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ status: true }), {
          status: 200,
          headers: refreshHeaders,
        }),
      );

      const res = await GET(req);
      expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard");
    }
  });

  it("refresh 실패 시 /login으로 보내고, 백엔드 Set-Cookie(삭제 포함)는 전달한다", async () => {
    const req = new Request("http://localhost:3000/api/session/bootstrap", {
      headers: {
        cookie: `refresh_token=rt; nx=${encodeURIComponent("/dashboard")}`,
      },
    });

    const refreshHeaders = new Headers();
    refreshHeaders.append("set-cookie", "access_token=; Path=/; Max-Age=0");
    refreshHeaders.append("set-cookie", "refresh_token=; Path=/; Max-Age=0");
    refreshHeaders.set("content-type", "application/json");

    fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: false }), { status: 401, headers: refreshHeaders }),
    );

    const res = await GET(req);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");

    const setCookies = getSetCookies(res).join("\n");
    expect(setCookies).toContain("access_token=");
    expect(setCookies).toContain("refresh_token=");
    expect(setCookies).not.toMatch(/(^|\n)nx=;/);
  });

  it("refresh 실패 + code/requestId가 있으면 auth_reason 쿠키로 전달한다", async () => {
    const req = new Request("http://localhost:3000/api/session/bootstrap", {
      headers: {
        cookie: `refresh_token=rt; nx=${encodeURIComponent("/dashboard")}`,
      },
    });

    const refreshHeaders = new Headers();
    refreshHeaders.append("set-cookie", "access_token=; Path=/; Max-Age=0");
    refreshHeaders.append("set-cookie", "refresh_token=; Path=/; Max-Age=0");
    refreshHeaders.set("content-type", "application/json");

    fetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          status: false,
          code: "AUTH_401_INVALID",
          requestId: "req-123",
          message: "expired",
        }),
        { status: 401, headers: refreshHeaders },
      ),
    );

    const res = await GET(req);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");

    const setCookies = getSetCookies(res);
    const reasonEncoded = findCookieValue(setCookies, "auth_reason");
    expect(reasonEncoded).toBeTruthy();
    const reason = decodeBase64UrlJson(reasonEncoded);
    expect(reason).toMatchObject({
      code: "AUTH_401_INVALID",
      requestId: "req-123",
    });
  });

  it("refresh fetch 거부 시 /login으로 보내고 인증 쿠키를 정리한다", async () => {
    const req = new Request("http://localhost:3000/api/session/bootstrap", {
      headers: { cookie: "access_token=old-at; refresh_token=rt" },
    });
    fetch.mockRejectedValueOnce(new Error("private transport detail"));

    const res = await GET(req);
    const setCookies = getSetCookies(res);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(setCookies.join("\n")).toMatch(/access_token=;/);
    expect(setCookies.join("\n")).toMatch(/refresh_token=;/);
    const reason = decodeBase64UrlJson(findCookieValue(setCookies, "auth_reason"));
    expect(reason).toEqual({ code: "AUTH_502_BACKEND_UNAVAILABLE" });
    expect(JSON.stringify(reason)).not.toContain("private transport detail");
  });

  it("backend host 거부 시에도 같은 안전한 로그인 복구 경계를 사용한다", async () => {
    vi.mocked(getBackendHost).mockRejectedValueOnce(new Error("private host detail"));
    const req = new Request("http://localhost:3000/api/session/bootstrap", {
      headers: { cookie: "access_token=old-at; refresh_token=rt" },
    });

    const res = await GET(req);
    const setCookies = getSetCookies(res).join("\n");

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
    expect(setCookies).toContain("access_token=");
    expect(setCookies).toContain("refresh_token=");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("backend 삭제 쿠키가 없는 non-ok refresh도 로컬 인증 쿠키를 정리한다", async () => {
    const req = new Request("http://localhost:3000/api/session/bootstrap", {
      headers: { cookie: "access_token=old-at; refresh_token=rt" },
    });
    fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: false, code: "AUTH_401_INVALID" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      }),
    );

    const res = await GET(req);
    const setCookies = getSetCookies(res).join("\n");

    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
    expect(setCookies).toMatch(/access_token=;/);
    expect(setCookies).toMatch(/refresh_token=;/);
  });
});
