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

/**
 * @description 현재 실행 환경이 서버 런타임인지 판별한다.
 * 처리 규칙: `window` 전역이 없으면 서버 환경으로 간주한다.
 * @updated 2026-02-27
 */
function isServer() {
  return typeof window === "undefined";
}

/**
 * @description 테스트 실행 환경 여부를 확인한다.
 * 처리 규칙: `VITEST` 또는 `NODE_ENV=test` 플래그를 우선 읽고 예외 발생 시 false를 반환한다.
 * @updated 2026-02-27
 */
function isTestEnv() {
  try {
    return !!(process?.env?.VITEST || process?.env?.NODE_ENV === "test");
  } catch {
    return false;
  }
}

/**
 * @description 입력 경로가 절대 URL인지 판별한다.
 * 처리 규칙: 문자열이면서 `http://` 또는 `https://` 프리픽스를 가지면 true를 반환한다.
 * @updated 2026-02-27
 */
function isAbsoluteUrl(input) {
  return typeof input === "string" && /^https?:\/\//i.test(input);
}

/**
 * @description 애플리케이션 경로를 BFF 프록시 경로로 정규화한다.
 * 처리 규칙: 이미 `/api/bff`로 시작하면 유지하고, 아니면 prefix를 붙여 반환한다.
 * @updated 2026-02-27
 */
function toBffPath(path) {
  const normalizedPath = String(path || "");
  if (normalizedPath.startsWith(BFF_PREFIX)) return normalizedPath;
  return `${BFF_PREFIX}${normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`}`;
}

/**
 * @description Request body로 직접 전달 가능한 타입인지 검사한다.
 * 처리 규칙: string/FormData/Blob/ArrayBuffer 타입을 body-like 값으로 인정한다.
 * @updated 2026-02-27
 */
function isBodyLike(value) {
  return (
    typeof value === "string" ||
    (typeof FormData !== "undefined" && value instanceof FormData) ||
    (typeof Blob !== "undefined" && value instanceof Blob) ||
    (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer)
  );
}

/**
 * @description body 값이 FormData인지 판별한다.
 * 처리 규칙: 브라우저 환경에서 `instanceof FormData`일 때만 true를 반환한다.
 * @updated 2026-02-27
 */
function isFormBody(value) {
  return typeof FormData !== "undefined" && value instanceof FormData;
}

/**
 * @description body 값이 바이너리 타입인지 판별한다.
 * 처리 규칙: `Blob` 또는 `ArrayBuffer` 인스턴스면 true를 반환한다.
 * @updated 2026-02-27
 */
function isBinaryBody(value) {
  return (
    (typeof Blob !== "undefined" && value instanceof Blob) ||
    (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer)
  );
}

/**
 * @description 요청 body 입력을 전송 가능한 값으로 직렬화한다.
 * 처리 규칙: body-like 값은 그대로 사용하고, 일반 객체는 JSON 문자열로 변환한다.
 * @updated 2026-02-27
 */
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

/**
 * @description api 호출 인자 오버로딩 패턴을 단일 포맷으로 정규화한다.
 * 처리 규칙: `(path, init|body, mode|options)` 입력을 `{ path, init, options }` 형태로 통일한다.
 * @updated 2026-02-27
 */
function normalizeArgs(path, a2, a3) {
  // 한글설명: Supports overloading:
  // 한글설명: - api*(path)
  // 한글설명: - api*(path, init)
  // 한글설명: - api*(path, body)
  // 한글설명: - api*(path, body, 'authless')
  // 한글설명: - api*(path, body, { authless: boolean })
  // 한글설명: - api*(path, initLike, 'authless' | options)

  /**
   * @description 값이 RequestInit 유사 객체인지 판별한다.
   * 처리 규칙: body-like 값은 제외하고, method/headers/body/authless 키 보유 여부로 판별한다.
   * @updated 2026-02-27
   */
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

  /**
   * @description 구형 옵션 전용 init 객체인지 판별한다.
   * 처리 규칙: body-like 값이 아니고 키가 `csrf`/`auth` 조합으로만 구성되면 true를 반환한다.
   * @updated 2026-02-27
   */
  const isLegacyOptionOnlyInit = (value) => {
    if (!value || typeof value !== "object") return false;
    if (isBodyLike(value)) return false;
    const keys = Object.keys(value);
    if (!keys.length) return false;
    return keys.every((key) => key === "csrf" || key === "auth");
  };

  let init = {};
  let options = {};

  /**
   * @description 모드 문자열을 options 객체에 반영한다.
   * 처리 규칙: 현재는 `authless` 모드만 해석해 `options.authless=true`로 설정한다.
   * @updated 2026-02-27
   */
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

/**
 * @description 헤더 집합에 대상 헤더가 존재하는지 검사한다.
 * 처리 규칙: `Headers` 인스턴스와 plain object 양쪽을 지원하며 키 비교는 소문자로 수행한다.
 * @updated 2026-02-27
 */
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
 * @description Response 본문을 안전하게 텍스트로 읽는다.
 * 처리 규칙: 빈 본문 상태코드(204/205/304)는 즉시 빈 문자열을 반환하고 읽기 실패도 빈 문자열로 수렴한다.
 * @updated 2026-02-27
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
 * @description 응답 JSON 문자열을 파싱하고 중첩 JSON 문자열 필드를 정규화한다.
 * 처리 규칙: 파싱 실패 시 SyntaxError를 던지고 원문 텍스트를 `cause`에 보관한다.
 * @updated 2026-02-27
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

/**
 * @description 값이 배열이 아닌 일반 객체인지 판별한다.
 * 처리 규칙: null/array를 제외한 object 타입만 true를 반환한다.
 * @updated 2026-02-27
 */
function isPlainObject(value) {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return false;
  return true;
}

/**
 * @description API 실패 응답을 표준 ApiError 객체로 변환한다.
 * 처리 규칙: body의 message/code/requestId를 우선 사용하고, 없으면 상태코드 기반 기본 메시지를 구성한다.
 * @updated 2026-02-27
 */
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
 * @description SSR/CSR 공통 규약으로 Request 기반 API 응답(Response)을 반환한다.
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

  /**
   * @description SSR에서 사용할 프론트엔드 origin을 결정한다.
   * 처리 규칙: 환경변수 값을 우선 사용하고 없으면 `http://127.0.0.1:<PORT>` 기본값을 반환한다.
   * @updated 2026-02-27
   */
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

    /**
     * @description SSR fetch 호출을 지연 실행 함수로 감싼다.
     * 처리 규칙: targetUrl/requestInit 스냅샷을 사용해 단일 fetch 요청을 수행한다.
     * @updated 2026-02-27
     */
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

  /**
   * @description CSR fetch 요청 초기값을 구성한 뒤 네트워크 요청을 보낸다.
   * 처리 규칙: 비-GET/HEAD 메서드에서 body 미지정 시 `"{}"`를 기본 body로 사용한다.
   * @updated 2026-02-27
   */
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
 * @description API 응답을 JSON으로 파싱하고 실패 응답을 ApiError로 전환한다.
 * 처리 규칙: HTTP 비정상(`!ok`) 또는 body.status=false 모두 예외로 승격한다.
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
 * @description GET 메서드 JSON API 래퍼를 제공한다.
 * 처리 규칙: init에 method를 강제로 `GET`으로 주입해 `apiJSON`으로 위임한다.
 * @returns {Promise<any>} JSON 응답 페이로드
 */
export function apiGet(path, init = {}) {

  return apiJSON(path, { ...init, method: "GET" });
}

/**
 * @description POST 메서드 JSON API 래퍼를 제공한다.
 * 처리 규칙: 전달 body를 포함해 method=`POST`로 고정한 뒤 `apiJSON`으로 위임한다.
 * @returns {Promise<any>} JSON 응답 페이로드
 */
export function apiPost(path, body, init = {}) {

  return apiJSON(path, { ...init, method: "POST", body });
}

/**
 * @description PUT 메서드 JSON API 래퍼를 제공한다.
 * 처리 규칙: 전달 body를 포함해 method=`PUT`으로 고정한 뒤 `apiJSON`으로 위임한다.
 * @returns {Promise<any>} JSON 응답 페이로드
 */
export function apiPut(path, body, init = {}) {

  return apiJSON(path, { ...init, method: "PUT", body });
}

/**
 * @description PATCH 메서드 JSON API 래퍼를 제공한다.
 * 처리 규칙: 전달 body를 포함해 method=`PATCH`로 고정한 뒤 `apiJSON`으로 위임한다.
 * @returns {Promise<any>} JSON 응답 페이로드
 */
export function apiPatch(path, body, init = {}) {

  return apiJSON(path, { ...init, method: "PATCH", body });
}

/**
 * @description DELETE 메서드 JSON API 래퍼를 제공한다.
 * 처리 규칙: 전달 body를 포함해 method=`DELETE`로 고정한 뒤 `apiJSON`으로 위임한다.
 * @returns {Promise<any>} JSON 응답 페이로드
 */
export function apiDelete(path, body, init = {}) {

  return apiJSON(path, { ...init, method: "DELETE", body });
}
