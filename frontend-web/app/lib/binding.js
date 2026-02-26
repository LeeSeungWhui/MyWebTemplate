/**
 * 파일명: binding.js
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 바인딩 유틸 함수
 */
// binding.js
// Updated: 2025-09-09
// Purpose: Common helpers for data binding (EasyObj/EasyList) and change context

const isProxyLike = (obj) => obj && typeof obj === 'object' && (obj.__isProxy || obj.__rawObject);
const getRaw = (obj) => (obj && obj.__rawObject) ? obj.__rawObject : obj;

/**
 * @description 바인딩 객체에서 key 경로 값을 읽는다.
 * @updated 2026-02-24
 */
export function getBoundValue(dataObj, dataKey) {
  if (!dataObj || !dataKey) return undefined;
  // Prefer explicit getter if provided
  if (typeof dataObj.get === 'function') return dataObj.get(dataKey);
  // Dotted path support
  const parts = String(dataKey).split('.');
  let cur = dataObj;
  for (const segment of parts) {
    if (cur == null) return undefined;
    cur = cur[segment];
  }
  return cur;
}

/**
 * @description 바인딩 객체의 key 경로 값을 설정한다.
 * @updated 2026-02-24
 */
export function setBoundValue(dataObj, dataKey, value, options = {}) {
  if (!dataObj || !dataKey) return;
  const meta = typeof options === 'object' && options !== null ? options : {};
  if (typeof dataObj.set === 'function') return dataObj.set(dataKey, value, { source: meta.source ?? 'user' });
  const parts = String(dataKey).split('.');
  let cur = dataObj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] == null || typeof cur[parts[i]] !== 'object') {
      cur[parts[i]] = {};
    }
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
  return value;
}

/**
 * @description 값 변경 컨텍스트를 구성한다.
 * @updated 2026-02-24
 */
export function buildCtx({ dataKey, dataObj, source = 'user', valid = null, dirty = true }) {
  const raw = getRaw(dataObj);
  let modelType = null;
  if (Array.isArray(raw)) {
    modelType = 'list';
  } else if (raw && typeof raw === 'object') {
    modelType = 'obj';
  }
  return { dataKey, modelType, dirty: !!dirty, valid, source };
}

/**
 * @description onChange/onValueChange 핸들러를 공통 규약으로 호출한다.
 * @updated 2026-02-24
 */
export function fireValueHandlers({ onChange, onValueChange, value, ctx, event }) {
  // Back-compat: if consumer provided onChange expecting event, pass event with detail
  if (event) {
    try {
      if (!Object.prototype.hasOwnProperty.call(event, 'detail') || event.detail == null) {
        Object.defineProperty(event, 'detail', { value: { value, ctx }, configurable: true, writable: true });
      } else if (typeof event.detail === 'object') {
        event.detail.value = value;
        event.detail.ctx = ctx;
      }
    } catch (error) {
      try {
        event.detail = { value, ctx };
      } catch (_) {
        // readonly detail; ignore
      }
    }
  }
  if (typeof onChange === 'function' && event) onChange(event);
  if (typeof onValueChange === 'function') onValueChange(value, ctx);
}

const bindingUtils = {
  getBoundValue,
  setBoundValue,
  buildCtx,
  fireValueHandlers,
};

/**
 * @description bindingUtils export를 노출한다.
 */
export default bindingUtils
