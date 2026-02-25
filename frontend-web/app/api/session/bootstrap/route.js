/**
 * 파일명: route.js
 * 작성자: LSH
 * 갱신일: 2026-01-18
 * 설명: /login 진입 시 refresh_token으로 access_token을 재발급하고 next(=nx)/dashboard로 자동 리다이렉트한다.
 */

import { NextResponse } from "next/server";
import { getBackendHost } from "@/app/common/config/getBackendHost.server";
import { getFrontendHost } from "@/app/common/config/getFrontendHost.server";
import {
  AUTH_REASON_COOKIE,
  AUTH_REASON_MAXLEN,
  DEFAULT_NEXT_PATH,
  NX_COOKIE,
  base64UrlEncodeUtf8,
  extractUnauthorizedReason,
  safeDecodeURIComponent,
  sanitizeInternalPath,
} from "@/app/lib/runtime/authRedirect";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const REFRESH_PATH = "/api/v1/auth/refresh";

/**
 * 설명: Cookie 헤더 문자열을 단순 파싱한다(값 디코딩은 별도 처리).
 * 갱신일: 2026-01-18
 */
function parseCookieHeader(cookieHeader) {
  const result = {};
  if (!cookieHeader || typeof cookieHeader !== "string") return result;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const name = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1);
    if (!name) continue;
    result[name] = value;
  }
  return result;
}

/**
 * 설명: 백엔드 Set-Cookie를 프런트 도메인에 맞게 정리한다(Domain 제거 + Path 보장).
 * 갱신일: 2026-01-18
 */
function rewriteSetCookie(rawValue) {
  if (!rawValue || typeof rawValue !== "string") return null;
  const segments = rawValue.split(";");
  const rewritten = [];
  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    if (lower.startsWith("domain=")) continue;
    rewritten.push(trimmed);
  }
  const hasPath = rewritten.some((seg) =>
    seg.toLowerCase().startsWith("path="),
  );
  if (!hasPath) rewritten.push("Path=/");
  return rewritten.join("; ");
}

/**
 * 설명: 런타임별 Response 헤더 구현 차이를 흡수해 Set-Cookie 배열을 모은다.
 * 갱신일: 2026-01-18
 */
function collectSetCookies(res) {
  let setCookies = res?.headers?.getSetCookie?.() || [];
  if (!setCookies.length) {
    const single = res?.headers?.get?.("set-cookie");
    if (single) setCookies = [single];
  }
  return setCookies;
}

/**
 * 설명: refresh_token이 있으면 access_token을 재발급하고 nx(/dashboard)로 이동시킨다.
 * 갱신일: 2026-01-18
 */
export async function GET(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = parseCookieHeader(cookieHeader);
  const refreshToken = cookies.refresh_token || null;
  const rawNext = safeDecodeURIComponent(cookies[NX_COOKIE] || null);
  const nextPath = sanitizeInternalPath(rawNext, DEFAULT_NEXT_PATH);

  if (!refreshToken) {
    const res = NextResponse.redirect(new URL("/login", request.url), 307);
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  const backendHost = await getBackendHost();
  const frontendOrigin =
    (await getFrontendHost()) ||
    request.nextUrl?.origin ||
    "";
  const refreshUrl = new URL(REFRESH_PATH, backendHost);
  const headers = new Headers();
  const acceptLanguage = request.headers.get("accept-language");
  const originHeader = request.headers.get("origin");
  const refererHeader = request.headers.get("referer");
  if (acceptLanguage) headers.set("accept-language", acceptLanguage);
  if (cookieHeader) headers.set("cookie", cookieHeader);
  if (originHeader) headers.set("origin", originHeader);
  else if (frontendOrigin) headers.set("origin", frontendOrigin);
  if (refererHeader) headers.set("referer", refererHeader);
  else if (frontendOrigin) headers.set("referer", `${frontendOrigin}/login`);
  headers.set("content-type", "application/json");

  const refreshRes = await fetch(refreshUrl, {
    method: "POST",
    headers,
    redirect: "manual",
    cache: "no-store",
  });

  const setCookies = collectSetCookies(refreshRes)
    .map(rewriteSetCookie)
    .filter(Boolean);
  const redirectTo = refreshRes.ok ? nextPath : "/login";

  const res = NextResponse.redirect(new URL(redirectTo, request.url), 307);
  res.headers.set("Cache-Control", "no-store");

  if (refreshRes.ok) {
    res.cookies.set(NX_COOKIE, "", { path: "/", maxAge: 0 });
  }
  if (!refreshRes.ok) {
    const reason = await extractUnauthorizedReason(refreshRes);
    const reasonEncoded = reason
      ? base64UrlEncodeUtf8(JSON.stringify(reason))
      : null;
    if (reasonEncoded && reasonEncoded.length <= AUTH_REASON_MAXLEN) {
      res.cookies.set(AUTH_REASON_COOKIE, reasonEncoded, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60,
      });
    }
  }

  for (const cookie of setCookies) {
    res.headers.append("set-cookie", cookie);
  }

  return res;
}
