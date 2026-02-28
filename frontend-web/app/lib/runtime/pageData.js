/**
 * 파일명: pageData.js
 * 작성자: Codex
 * 갱신일: 2026-02-28
 * 설명: PAGE_CONFIG(MODE/API) 기반 페이지 초기 데이터 자동 로딩 유틸
 */

import { apiJSON } from "@/app/lib/runtime/api";

const SSR_MODE = "SSR";
const CSR_MODE = "CSR";

/**
 * @description 값이 plain object인지 판별
 * 처리 규칙: `null` 제외 object 타입이며 배열이 아니면 true 반환.
 * @param {unknown} value
 * @returns {boolean}
 */
const isPlainObject = (value) => (
  !!value
  && typeof value === "object"
  && !Array.isArray(value)
);

/**
 * @description 페이지 MODE 문자열 정규화
 * 처리 규칙: 대문자 `SSR`만 SSR로 인정하고 나머지는 CSR로 보정.
 * @param {string} mode
 * @returns {"SSR"|"CSR"}
 */
const normalizeMode = (mode) => {
  const normalizedMode = String(mode || "").toUpperCase();
  return normalizedMode === SSR_MODE ? SSR_MODE : CSR_MODE;
};

/**
 * @description PAGE_CONFIG의 API 맵 정규화
 * 처리 규칙: `API` 우선, 레거시 `endPoints` 폴백 순서로 object 맵 반환.
 * @param {Object} pageConfig
 * @returns {Object}
 */
const normalizeApiMap = (pageConfig) => {
  const apiMap = pageConfig?.API ?? pageConfig?.endPoints ?? {};
  if (!isPlainObject(apiMap)) return {};
  return { ...apiMap };
};

/**
 * @description API 엔드포인트 스펙 정규화
 * 처리 규칙: string은 GET 경로로 해석하고 object는 path/method/body/options 병합.
 * @param {string|Object} endpoint
 * @returns {Object|null}
 */
const normalizeEndpointSpec = (endpoint) => {
  if (typeof endpoint === "string") {
    const path = String(endpoint || "").trim();
    if (!path) return null;
    return {
      path,
      method: "GET",
      body: undefined,
      fetchInit: {},
      options: {},
    };
  }
  if (!isPlainObject(endpoint)) return null;
  if (endpoint.enabled === false) return null;
  const initConfig = isPlainObject(endpoint.init)
    ? endpoint.init
    : isPlainObject(endpoint.fetchInit)
      ? endpoint.fetchInit
      : {};
  const endpointPath = String(
    endpoint.path ?? endpoint.url ?? endpoint.endpoint ?? initConfig.path ?? "",
  ).trim();
  if (!endpointPath) return null;
  const method = String(
    endpoint.method ?? initConfig.method ?? "GET",
  ).toUpperCase();
  const hasBody = Object.prototype.hasOwnProperty.call(endpoint, "body")
    || Object.prototype.hasOwnProperty.call(initConfig, "body");
  const body = Object.prototype.hasOwnProperty.call(endpoint, "body")
    ? endpoint.body
    : initConfig.body;
  const restInit = { ...initConfig };
  delete restInit.method;
  delete restInit.body;
  delete restInit.authless;
  const options = {};
  const authless = Object.prototype.hasOwnProperty.call(endpoint, "authless")
    ? endpoint.authless
    : initConfig.authless;
  if (typeof authless === "boolean") options.authless = authless;
  return {
    path: endpointPath,
    method,
    body: hasBody ? body : undefined,
    fetchInit: { ...restInit },
    options,
  };
};

/**
 * @description API 호출 실패 객체 정규화
 * 처리 규칙: 메시지/코드/requestId/statusCode만 추려 errorObj 값으로 사용.
 * @param {Error|Object} error
 * @returns {{message:string, code:string|undefined, requestId:string|undefined, statusCode:number|undefined}}
 */
const normalizeLoadError = (error) => ({
  message: error?.message || "INIT_FETCH_FAILED",
  code: error?.code,
  requestId: error?.requestId,
  statusCode: error?.statusCode,
});

/**
 * @description PAGE_CONFIG 기본 구조 정규화
 * 처리 규칙: MODE/API만 남긴 최소 구조로 변환해 반환.
 * @param {Object} pageConfig
 * @returns {{MODE:"SSR"|"CSR", API:Object}}
 */
export const normalizePageConfig = (pageConfig = {}) => ({
  MODE: normalizeMode(pageConfig?.MODE),
  API: normalizeApiMap(pageConfig),
});

/**
 * @description MODE가 SSR인지 판별
 * @param {string} mode
 * @returns {boolean}
 */
export const isSsrMode = (mode) => normalizeMode(mode) === SSR_MODE;

/**
 * @description PAGE_CONFIG에서 API 엔트리 목록 추출
 * 처리 규칙: 유효 path가 있는 엔트리만 `[apiKey, spec]` 배열로 반환.
 * @param {Object} pageConfig
 * @returns {Array<[string, Object]>}
 */
export const listPageApiEntries = (pageConfig = {}) => {
  const normalizedConfig = normalizePageConfig(pageConfig);
  const apiEntryList = [];
  Object.entries(normalizedConfig.API).forEach(([apiKey, endpointSpec]) => {
    const normalizedSpec = normalizeEndpointSpec(endpointSpec);
    if (!normalizedSpec) return;
    apiEntryList.push([apiKey, normalizedSpec]);
  });
  return apiEntryList;
};

/**
 * @description 단일 API 엔트리 호출 실행
 * 처리 규칙: init.method를 강제 주입하고 authless 옵션은 3번째 인자로 전달.
 * @param {Object} params
 * @param {Function} params.fetcher
 * @param {Object} params.endpointSpec
 * @returns {Promise<any>}
 */
const loadSingleEndpoint = async ({
  fetcher,
  endpointSpec,
}) => {
  const init = {
    ...endpointSpec.fetchInit,
    method: endpointSpec.method,
  };
  if (typeof endpointSpec.body !== "undefined") {
    init.body = endpointSpec.body;
  }
  const hasOptions = Object.keys(endpointSpec.options || {}).length > 0;
  if (hasOptions) {
    return fetcher(endpointSpec.path, init, endpointSpec.options);
  }
  return fetcher(endpointSpec.path, init);
};

/**
 * @description PAGE_CONFIG.API 엔트리 일괄 조회
 * 처리 규칙: Promise.allSettled로 전체 호출 후 dataObj/errorObj 분리 반환.
 * @param {Object} params
 * @param {Object} params.pageConfig
 * @param {Function} [params.fetcher]
 * @returns {Promise<{dataObj:Object, errorObj:Object, hasError:boolean}>}
 */
export const loadPageDataObj = async ({
  pageConfig,
  fetcher = apiJSON,
}) => {
  const apiEntryList = listPageApiEntries(pageConfig);
  if (!apiEntryList.length) {
    return {
      dataObj: {},
      errorObj: {},
      hasError: false,
    };
  }
  const settledResultList = await Promise.allSettled(
    apiEntryList.map(([, endpointSpec]) => (
      loadSingleEndpoint({
        fetcher,
        endpointSpec,
      })
    )),
  );
  const dataObj = {};
  const errorObj = {};
  settledResultList.forEach((settledResult, index) => {
    const [apiKey] = apiEntryList[index];
    if (settledResult.status === "fulfilled") {
      dataObj[apiKey] = settledResult.value;
      return;
    }
    errorObj[apiKey] = normalizeLoadError(settledResult.reason);
  });
  return {
    dataObj,
    errorObj,
    hasError: Object.keys(errorObj).length > 0,
  };
};

/**
 * @description SSR 모드 전용 서버 초기 데이터 로딩
 * 처리 규칙: SSR이 아니면 빈 맵 반환, SSR이면 API 맵 전체를 일괄 조회.
 * @param {Object} params
 * @param {Object} params.pageConfig
 * @param {Function} [params.fetcher]
 * @returns {Promise<{mode:"SSR"|"CSR", dataObj:Object, errorObj:Object, hasError:boolean}>}
 */
export const loadServerPageData = async ({
  pageConfig,
  fetcher = apiJSON,
}) => {
  const normalizedConfig = normalizePageConfig(pageConfig);
  if (!isSsrMode(normalizedConfig.MODE)) {
    return {
      mode: normalizedConfig.MODE,
      dataObj: {},
      errorObj: {},
      hasError: false,
    };
  }
  const loadResult = await loadPageDataObj({
    pageConfig: normalizedConfig,
    fetcher,
  });
  return {
    mode: normalizedConfig.MODE,
    ...loadResult,
  };
};
