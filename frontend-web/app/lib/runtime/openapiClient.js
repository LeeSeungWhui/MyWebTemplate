/**
 * 파일명: openapiClient.js
 * 작성자: LSH
 * 갱신일: 2026-01-18
 * 설명: OpenAPI 스키마(/openapi.json) 기반 JS 클라이언트 유틸. 실제 요청은 apiRequest/apiJSON에 위임
 */

import { apiJSON, apiRequest } from "@/app/lib/runtime/api";

let cachedOpenApi = null;
let cachedOpenApiPromise = null;

/**
 * @description `/openapi.json` 스키마를 로드해 openapi-client-axios 인스턴스를 초기화
 * 실패 동작: 스키마가 객체가 아니거나 라이브러리 로딩 실패 시 Error를 던진다.
 * @updated 2026-02-27
 */
async function loadOpenApiClient() {
  const spec = await apiJSON(
    "/openapi.json",
    { method: "GET" },
    { authless: true },
  );
  if (!spec || typeof spec !== "object") {
    throw new Error("Invalid OpenAPI schema");
  }

  const mod = await import("openapi-client-axios");
  const OpenAPIClientAxios = mod?.default || mod?.OpenAPIClientAxios;
  if (typeof OpenAPIClientAxios !== "function") {
    throw new Error("openapi-client-axios not available");
  }

  // 요청 실행은 apiRequest/apiJSON에 위임하므로, 여기서는 스키마 파싱/요청 구성만 사용한다.
  const client = new OpenAPIClientAxios({ definition: spec, quick: true });
  client.initSync();
  return client;
}

/**
 * @description  OpenAPI 클라이언트를 캐시 기반으로 단일 인스턴스로 반환한다. 입력/출력 계약을 함께 명시
 * 처리 규칙: 초기 로딩 중에는 Promise 캐시를 공유해 중복 초기화를 방지한다.
 * @updated 2026-02-27
 */
async function getOpenApiClient() {
  if (cachedOpenApi) return cachedOpenApi;
  if (!cachedOpenApiPromise) {
    cachedOpenApiPromise = loadOpenApiClient()
      .then((client) => {
        cachedOpenApi = client;
        return client;
      })
      .finally(() => {
        cachedOpenApiPromise = null;
      });
  }
  return cachedOpenApiPromise;
}

/**
 * @description query params 객체를 URLSearchParams 문자열로 직렬화
 * 처리 규칙: null/undefined 키는 제외하고 배열 값은 같은 키로 반복 append 한다.
 * @updated 2026-02-27
 */
function buildQueryString(params) {
  if (!params || typeof params !== "object") return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (!k) continue;
    if (v == null) continue;
    if (Array.isArray(v)) {
      for (const item of v) {
        if (item == null) continue;
        sp.append(k, String(item));
      }
      continue;
    }
    sp.append(k, String(v));
  }
  return sp.toString();
}

/**
 * @description 기존 URL과 query string 병합 기반 최종 요청 URL 생성.
 * 반환값: 파라미터가 없으면 원본 URL, 있으면 `?` 또는 `&`가 반영된 URL.
 * @updated 2026-02-27
 */
function mergeUrlAndParams(url, params) {
  const base = typeof url === "string" ? url : String(url || "");
  const qs = buildQueryString(params);
  if (!qs) return base;
  return base.includes("?") ? `${base}&${qs}` : `${base}?${qs}`;
}

/**
 * 설명: OpenAPI operationId 기반 요청을 구성해 fetch(Request) 경로로 위임
 * 반환값: apiRequest가 반환하는 fetch Response 객체.
 * 갱신일: 2026-01-18
 */
export async function openapiRequest(
  operationId,
  parameters = null,
  data = null,
  config = {},

) {
  const api = await getOpenApiClient();
  const op = api.getOperation?.(operationId);
  if (!op) {
    throw new Error(
      `Unknown OpenAPI operationId: ${String(operationId || "")}`,
    );
  }
  const axiosConfig = api.getAxiosConfigForOperation(operationId, [
    parameters,
    data,
    config,
  ]);
  const method = String(axiosConfig?.method || "GET").toUpperCase();
  const url = mergeUrlAndParams(axiosConfig?.url, axiosConfig?.params);
  const headers = axiosConfig?.headers || {};
  const authless = !!axiosConfig?.authless;
  return apiRequest(
    url,
    { method, headers, body: axiosConfig?.data },
    { authless },
  );
}

/**
 * 설명: OpenAPI operationId 기반으로 JSON(표준 응답 스키마) 호출을 수행한다(apiJSON 규약 동일).
 * 반환값: apiJSON 규약의 JSON 객체(success/result/code/message/requestId 등).
 * 갱신일: 2026-01-18
 */
export async function openapiJSON(
  operationId,
  parameters = null,
  data = null,
  config = {},

) {
  const api = await getOpenApiClient();
  const op = api.getOperation?.(operationId);
  if (!op) {
    throw new Error(
      `Unknown OpenAPI operationId: ${String(operationId || "")}`,
    );
  }
  const axiosConfig = api.getAxiosConfigForOperation(operationId, [
    parameters,
    data,
    config,
  ]);
  const method = String(axiosConfig?.method || "GET").toUpperCase();
  const url = mergeUrlAndParams(axiosConfig?.url, axiosConfig?.params);
  const headers = axiosConfig?.headers || {};
  const authless = !!axiosConfig?.authless;
  return apiJSON(
    url,
    { method, headers, body: axiosConfig?.data },
    { authless },
  );
}
