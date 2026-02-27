/**
 * 파일명: api.js
 * 작성자: LSH
 * 갱신일: 2026-01-18
 * 설명: SSR/CSR 공통 API 호출 유틸 (isomorphic)
 */

import {
  parseJsonPayload,
  normalizeNestedJsonFields,
} from "@/app/lib/runtime/jsonPayload";
import {
  AUTH_REASON_MAXLEN,
  AUTH_REASON_QUERY_PARAM,
  NEXT_QUERY_PARAM,
  base64UrlEncodeUtf8,
  extractUnauthorizedReason,
} from "@/app/lib/runtime/authRedirect";

const BFF_PREFIX = "/api/bff";
const EMPTY_BODY_STATUS = new Set([204, 205, 304]);
const LOGIN_PATH = "/login";

function isServer() {
  return typeof window === "undefined";
}

function isTestEnv() {
  try {
    return !!(process?.env?.VITEST || process?.env?.NODE_ENV === "test");
  } catch {
    return false;
  }
}

function isAbsoluteUrl(input) {
  return typeof input === "string" && /^https?:\/\//i.test(input);
}

function toBffPath(path) {
  const normalizedPath = String(path || "");
  if (normalizedPath.startsWith(BFF_PREFIX)) return normalizedPath;
  return `${BFF_PREFIX}${normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`}`;
}

function isBodyLike(value) {
  return (
    typeof value === "string" ||
    (typeof FormData !== "undefined" && value instanceof FormData) ||
    (typeof Blob !== "undefined" && value instanceof Blob) ||
    (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer)
  );
}

function isFormBody(value) {
  return typeof FormData !== "undefined" && value instanceof FormData;
}

function isBinaryBody(value) {
  return (
    (typeof Blob !== "undefined" && value instanceof Blob) ||
    (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer)
  );
}

function serializeBody(input) {
  if (input == null) return undefined;
  if (isBodyLike(input)) return input;
  // 한글설명: EasyObj/EasyList proxies expose toJSON; JSON.stringify will respect it.
  // 한글설명: Also supports plain objects/arrays directly.
  try {
    return typeof input === "string" ? input : JSON.stringify(input);
  } catch {
    // 한글설명: Fallback: attempt structured clone via toJSON where possible
    try {
      // 한글설명: This will call toJSON on proxies and drop unsupported values
      return JSON.stringify(JSON.parse(JSON.stringify(input)));
    } catch {
      return JSON.stringify({});
    }
  }
}

function normalizeArgs(path, a2, a3) {
  // 한글설명: Supports overloading:
  // 한글설명: - api*(path)
  // 한글설명: - api*(path, init)
  // 한글설명: - api*(path, body)
  // 한글설명: - api*(path, body, 'authless')
  // 한글설명: - api*(path, body, { authless: boolean })
  // 한글설명: - api*(path, initLike, 'authless' | options)
  const isInitLike = (value) => {
    if (!value || typeof value !== "object") return false;
    if (isBodyLike(value)) return false;
    const keys = Object.keys(value);
    return (
      "method" in value ||
      "headers" in value ||
      "body" in value ||
      "authless" in value ||
      keys.length === 0
    );
  };
  const isLegacyOptionOnlyInit = (value) => {
    if (!value || typeof value !== "object") return false;
    if (isBodyLike(value)) return false;
    const keys = Object.keys(value);
    if (!keys.length) return false;
    return keys.every((key) => key === "csrf" || key === "auth");
  };

  let init = {};
  let options = {};
  const applyMode = (mode) => {
    if (!mode) return;
    if (mode === "authless") options.authless = true;
  };

  if (typeof a2 === "string") applyMode(a2);
  else if (isInitLike(a2) || isLegacyOptionOnlyInit(a2)) init = { ...a2 };
  else if (typeof a2 !== "undefined") {
    init = { method: "POST", body: a2 };
  }

  if (typeof a3 === "string") applyMode(a3);
  else if (a3 && typeof a3 === "object") {
    const { authless, ...rest } = a3;
    if (typeof authless === "boolean") options.authless = authless;
    if (Object.keys(rest).length) init = { ...init, ...rest };
  }

  if (typeof init.authless === "boolean") {
    options.authless = init.authless;
    delete init.authless;
  }
  if ("csrf" in init) delete init.csrf;
  if ("auth" in init) delete init.auth;

  return { path, init, options };
}

function hasHeader(headers, name) {
  if (!headers) return false;
  const target = String(name || "").toLowerCase();
  if (!target) return false;
  if (headers instanceof Headers) {
    return headers.has(target);
  }
  return Object.keys(headers).some((k) => String(k).toLowerCase() === target);
}

/**
 * 응답 본문을 안전하게 텍스트로 변환
 * @param {Response} response fetch Response 객체
 * @returns {Promise<string>} 본문 텍스트
 */
async function readResponseText(response) {
  if (!response || typeof response.text !== "function") return "";
  if (EMPTY_BODY_STATUS.has(response.status)) return "";
  try {
    return await response.text();
  } catch {
    return "";
  }
}

/**
 * 백엔드 JSON 문자열을 보정/정규화
 * @param {Response} response fetch Response
 * @returns {Promise<object|null>} 파싱 결과
 */
async function parseJsonResponseBody(response) {
  const rawText = await readResponseText(response);
  if (!rawText) return null;
  const parsed = parseJsonPayload(rawText, { context: "apiJSON" });
  if (!parsed) {
    const syntaxError = new SyntaxError("Invalid JSON response");
    syntaxError.cause = rawText;
    throw syntaxError;
  }
  return normalizeNestedJsonFields(parsed);
}

function isPlainObject(value) {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return false;
  return true;
}

function createApiError(path, response, body) {
  const statusCode = response?.status;
  const message =
    (isPlainObject(body) && typeof body.message === "string" && body.message) ||
    `API request failed (${statusCode || "unknown"})`;

  const err = new Error(message);
  err.name = "ApiError";
  err.statusCode = statusCode;
  err.code = isPlainObject(body) ? body.code : undefined;
  err.requestId = isPlainObject(body) ? body.requestId : undefined;
  err.body = body;
  err.path = typeof path === "string" ? path : String(path || "");
  return err;
}

/**
 * @description SSR/CSR 환경 공통 Request 단위 API 호출을 수행한다.
 * @param {string} path
 * @param {Object} [initOrBody]
 * @param {string|Object} [modeOrOptions]
 * @returns {Promise<Response>}
 */
export async function apiRequest(path, initOrBody = {}, modeOrOptions) {
  const { init, options } = normalizeArgs(path, initOrBody, modeOrOptions);
  const method = (init.method || "GET").toUpperCase();
  const headersIn = init.headers || {};
  const absoluteUrl = isAbsoluteUrl(path);
  const authless = !!options?.authless;
  const resolveFrontendOrigin = () => {
    const envOrigin =
      process.env.APP_FRONTEND_ORIGIN ||
      process.env.FRONTEND_ORIGIN ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_URL;
    if (envOrigin) {
      return envOrigin.startsWith("http") ? envOrigin : `https://${envOrigin}`;
    }
    const port = process.env.PORT || 3000;
    return `http://127.0.0.1:${port}`;
  };

  if (isServer()) {
    const { buildSSRHeaders } = await import("@/app/lib/runtime/ssr");
    const baseHeaders = { ...headersIn };
    if (
      method !== "GET" &&
      method !== "HEAD" &&
      !hasHeader(baseHeaders, "content-type")
    ) {
      if (!(isFormBody(init.body) || isBinaryBody(init.body))) {
        baseHeaders["Content-Type"] = "application/json";
      }
    }
    const headers = await buildSSRHeaders(baseHeaders);
    const body = serializeBody(init.body);
    const requestInit = {
      method,
      credentials: "include",
      headers,
      cache: "no-store",
    };
    if (method !== "GET" && method !== "HEAD" && typeof body !== "undefined") {
      requestInit.body = body;
    }
    const targetUrl = absoluteUrl
      ? path
      : new URL(toBffPath(path), resolveFrontendOrigin());
    const doFetch = () => fetch(targetUrl, requestInit);
    return doFetch();
  }

  // 한글설명: Client: delegate to CSR helpers with refresh-once logic
  const targetUrl = absoluteUrl ? path : toBffPath(path);
  const headers = { ...headersIn };
  if (!hasHeader(headers, "accept-language"))
    headers["Accept-Language"] = navigator.language || "en";
  if (
    method !== "GET" &&
    method !== "HEAD" &&
    !hasHeader(headers, "content-type")
  ) {
    if (!(isFormBody(init.body) || isBinaryBody(init.body))) {
      headers["Content-Type"] = "application/json";
    }
  }

  const doFetch = async () => {
    const reqInit = {
      method,
      credentials: "include",
      headers,
    };
    if (method !== "GET" && method !== "HEAD") {
      reqInit.body = serializeBody(init.body) ?? "{}";
    }
    return fetch(targetUrl, reqInit);
  };

  const res = await doFetch();
  if (res.status !== 401) return res;

  const { pathname, search } = window.location;
  const isOnLogin = pathname.startsWith(LOGIN_PATH);
  const nextPath = pathname + (search || "");
  const reason = await extractUnauthorizedReason(res);
  const reasonEncoded = reason
    ? base64UrlEncodeUtf8(JSON.stringify(reason))
    : null;
  const reasonQuery =
    reasonEncoded && reasonEncoded.length <= AUTH_REASON_MAXLEN
      ? `&${AUTH_REASON_QUERY_PARAM}=${encodeURIComponent(reasonEncoded)}`
      : "";
  const redirectTo = `${LOGIN_PATH}?${NEXT_QUERY_PARAM}=${encodeURIComponent(nextPath)}${reasonQuery}`;
  if (!authless && !isOnLogin) {
    if (!isTestEnv()) {
      try {
        window.location.assign(redirectTo);
      } catch {
        // navigation 실패는 무시(테스트/특수 환경)
      }
    }
    const err = new Error("UNAUTHORIZED");
    err.name = "UnauthorizedError";
    err.redirectTo = redirectTo;
    throw err;
  }
  return res;
}

/**
 * @description 표준 JSON 응답을 파싱하고 비정상 응답을 ApiError로 변환한다.
 * @param {string} path
 * @param {Object} [initOrBody]
 * @param {string|Object} [modeOrOptions]
 * @returns {Promise<any>}
 */
export async function apiJSON(path, initOrBody = {}, modeOrOptions) {
  const res = await apiRequest(path, initOrBody, modeOrOptions);
  const body = await parseJsonResponseBody(res);
  if (!res?.ok) {
    throw createApiError(path, res, body);
  }
  if (isPlainObject(body) && body.status === false) {
    throw createApiError(path, res, body);
  }
  return body;
}

/**
 * @description GET 메서드 기반 JSON API 호출을 수행한다.
 */
export function apiGet(path, init = {}) {
  return apiJSON(path, { ...init, method: "GET" });
}

/**
 * @description POST 메서드 기반 JSON API 호출을 수행한다.
 */
export function apiPost(path, body, init = {}) {
  return apiJSON(path, { ...init, method: "POST", body });
}

/**
 * @description PUT 메서드 기반 JSON API 호출을 수행한다.
 */
export function apiPut(path, body, init = {}) {
  return apiJSON(path, { ...init, method: "PUT", body });
}

/**
 * @description PATCH 메서드 기반 JSON API 호출을 수행한다.
 */
export function apiPatch(path, body, init = {}) {
  return apiJSON(path, { ...init, method: "PATCH", body });
}

/**
 * @description DELETE 메서드 기반 JSON API 호출을 수행한다.
 */
export function apiDelete(path, body, init = {}) {
  return apiJSON(path, { ...init, method: "DELETE", body });
}
