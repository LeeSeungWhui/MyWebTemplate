/**
 * 파일명: openapiClient.js
 * 작성자: LSH
 * 갱신일: 2026-01-18
 * 설명: OpenAPI 스키마(/openapi.json) 기반 JS 클라이언트 유틸. 실제 요청은 apiRequest/apiJSON에 위임한다.
 */

import { apiJSON, apiRequest } from "@/app/lib/runtime/api";

let cachedOpenApi = null;
let cachedOpenApiPromise = null;

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

function mergeUrlAndParams(url, params) {
  const base = typeof url === "string" ? url : String(url || "");
  const qs = buildQueryString(params);
  if (!qs) return base;
  return base.includes("?") ? `${base}&${qs}` : `${base}?${qs}`;
}

/**
 * 설명: OpenAPI operationId 기반으로 fetch(Request) 수준 호출을 수행한다.
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
